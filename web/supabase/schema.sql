-- Firstform schema. Run in the Supabase SQL editor (or `supabase db push`).
-- Rules that matter: evolution + XP are decided by SQL functions (deterministic), never by AI or the client.

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_color text not null default '#F2C66D',
  xp int not null default 0,
  is_private boolean not null default false,
  role text not null default 'member' check (role in ('member','moderator','admin')),
  created_at timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(nullif(split_part(new.email, '@', 1), ''), 'player') || '_' || substr(new.id::text, 1, 4));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create or replace function is_moderator() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('moderator','admin'));
$$;

-- ---------- species ----------
create table if not exists species (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  creator_id uuid references profiles(id) on delete set null,
  name text not null check (char_length(name) between 2 and 24),
  description text not null default '' check (char_length(description) <= 140),
  creature_type text not null check (creature_type in ('animal','amphibian','alien','fantasy','robot','custom')),
  personality text not null,
  world text not null,
  color text not null default '#62B88A',
  stage int not null default 0 check (stage between 0 and 3),
  stage_names text[] not null default array['Hatchling','Sprout','Wanderer','Ascended'],
  origin_story text not null default '',
  window_label text not null default '14-day qualifying window',
  has_token boolean not null default false,
  token_info jsonb,
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index if not exists species_created_idx on species (created_at desc);

-- Public, published criteria for unlocking each stage. Published before users contribute; not editable via the API.
create table if not exists evolution_criteria (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  stage int not null check (stage between 1 and 3),   -- the stage this criterion unlocks
  kind text not null check (kind in ('verified_quests','contributors','approved_contributions')),
  label text not null,
  target int not null check (target > 0)
);
create index if not exists crit_species_idx on evolution_criteria (species_id, stage);

create table if not exists species_events (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  type text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists events_species_idx on species_events (species_id, created_at desc);

create table if not exists follows (
  user_id uuid not null references profiles(id) on delete cascade,
  species_id uuid not null references species(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, species_id)
);

-- ---------- quests ----------
create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  species_id uuid references species(id) on delete cascade,
  kind text not null check (kind in ('daily','weekly','community','seasonal')),
  title text not null,
  difficulty text not null default 'Easy',
  time_estimate text not null default '5 min',
  xp int not null check (xp between 0 and 500),
  objective text not null,
  eligibility text not null default 'Open to all members',
  active boolean not null default true
);

create table if not exists quest_submissions (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','verified','rejected','rewarded')),
  evidence text not null default '',
  moderation_note text,
  xp_awarded int not null default 0,
  updated_at timestamptz not null default now(),
  unique (quest_id, user_id)
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists lore_votes (
  species_id uuid not null references species(id) on delete cascade,
  chapter int not null default 1,
  option int not null check (option between 0 and 2),
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (species_id, chapter, user_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete set null,
  species_id uuid references species(id) on delete cascade,
  contribution_id uuid references contributions(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);

-- ---------- deterministic progress ----------
create or replace function criteria_progress(sp uuid)
returns table (criterion_id uuid, stage int, kind text, label text, target int, current int)
language sql stable security definer set search_path = public as $$
  select c.id, c.stage, c.kind, c.label, c.target,
    case c.kind
      when 'verified_quests' then (select count(*)::int from quest_submissions s join quests q on q.id = s.quest_id
                                   where q.species_id = sp and s.status in ('verified','rewarded'))
      when 'contributors' then (select count(distinct s.user_id)::int from quest_submissions s join quests q on q.id = s.quest_id
                                where q.species_id = sp and s.status in ('verified','rewarded'))
      when 'approved_contributions' then (select count(*)::int from contributions x where x.species_id = sp and x.status = 'approved')
    end
  from evolution_criteria c
  join species s on s.id = c.species_id and s.id = sp
  where c.stage = s.stage + 1
  order by c.label;
$$;

create or replace function species_progress(sp uuid) returns int language sql stable security definer set search_path = public as $$
  select coalesce(round(avg(least(current::numeric / target, 1)) * 100)::int, 100) from criteria_progress(sp);
$$;

create or replace function check_evolution(sp uuid) returns void language plpgsql security definer set search_path = public as $$
declare s species; met boolean; nxt text;
begin
  select * into s from species where id = sp;
  if s.stage >= 3 then return; end if;
  select coalesce(bool_and(current >= target), false) into met from criteria_progress(sp);
  if met then
    update species set stage = stage + 1 where id = sp returning stage_names[stage + 1] into nxt;
    insert into species_events (species_id, type, text)
    values (sp, 'evolution', s.name || ' evolved into ' || nxt || '!');
  end if;
end $$;

create or replace view species_cards as
select s.*,
  (select count(*) from follows f where f.species_id = s.id)::int as members,
  species_progress(s.id) as progress,
  p.display_name as creator_name
from species s left join profiles p on p.id = s.creator_id
where s.status = 'published';

-- ---------- gameplay functions ----------
create or replace function submit_quest(qid uuid, ev text) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  insert into quest_submissions (quest_id, user_id, status, evidence) values (qid, auth.uid(), 'submitted', left(ev, 2000))
  on conflict (quest_id, user_id) do update set status = 'submitted', evidence = excluded.evidence, updated_at = now()
  where quest_submissions.status in ('in_progress','rejected');
end $$;

create or replace function start_quest(qid uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  insert into quest_submissions (quest_id, user_id) values (qid, auth.uid()) on conflict do nothing;
end $$;

create or replace function review_submission(sid uuid, approve boolean, note text default null) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_moderator() then raise exception 'moderators only'; end if;
  update quest_submissions set status = case when approve then 'verified' else 'rejected' end, moderation_note = note, updated_at = now()
  where id = sid and status = 'submitted';
end $$;

create or replace function claim_reward(sid uuid) returns int language plpgsql security definer set search_path = public as $$
declare sub quest_submissions; q quests;
begin
  select * into sub from quest_submissions where id = sid and user_id = auth.uid() and status = 'verified' for update;
  if not found then raise exception 'nothing to claim'; end if;
  select * into q from quests where id = sub.quest_id;
  update quest_submissions set status = 'rewarded', xp_awarded = q.xp, updated_at = now() where id = sid;
  update profiles set xp = xp + q.xp where id = auth.uid();
  -- status 'rewarded' still counts as verified for criteria
  if q.species_id is not null then perform check_evolution(q.species_id); end if;
  return q.xp;
end $$;

create or replace function review_contribution(cid uuid, approve boolean) returns void language plpgsql security definer set search_path = public as $$
declare sp uuid;
begin
  if not is_moderator() then raise exception 'moderators only'; end if;
  update contributions set status = case when approve then 'approved' else 'rejected' end where id = cid and status = 'pending' returning species_id into sp;
  if approve and sp is not null then
    insert into species_events (species_id, type, text) values (sp, 'contribution', 'A new community contribution was approved');
    perform check_evolution(sp);
  end if;
end $$;

-- Creating a species also publishes its (default) evolution criteria.
create or replace function create_species(
  p_name text, p_desc text, p_type text, p_personality text, p_world text, p_color text, p_story text, p_token boolean
) returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid; base text; names text[];
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  base := coalesce(nullif(regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g'), ''), 'species');
  names := array[p_name || ' Hatchling', p_name || ' Sprout', p_name || ' Wanderer', p_name || ' Ascended'];
  insert into species (slug, creator_id, name, description, creature_type, personality, world, color, origin_story, stage_names, has_token)
  values (base || '-' || substr(gen_random_uuid()::text, 1, 4), auth.uid(), p_name, left(p_desc, 140), p_type, p_personality, p_world, p_color, p_story, names, false)
  returning id into sid;
  insert into evolution_criteria (species_id, stage, kind, label, target) values
    (sid, 1, 'verified_quests', 'Verified quests completed by community', 5),
    (sid, 1, 'contributors', 'Unique contributors', 3),
    (sid, 2, 'verified_quests', 'Verified quests completed by community', 20),
    (sid, 2, 'approved_contributions', 'Community contributions approved', 5),
    (sid, 3, 'verified_quests', 'Verified quests completed by community', 60),
    (sid, 3, 'contributors', 'Unique contributors', 15);
  insert into quests (species_id, kind, title, difficulty, time_estimate, xp, objective) values
    (sid, 'daily', 'Welcome ' || p_name, 'Easy', '2 min', 20, 'Say hello in the community feed and tell us why you followed ' || p_name || '.'),
    (sid, 'weekly', 'Draw ' || p_name, 'Medium', '30 min', 100, 'Submit original artwork of ' || p_name || '. Quality review applies.');
  insert into follows (user_id, species_id) values (auth.uid(), sid);
  insert into species_events (species_id, type, text) values (sid, 'created', p_name || ' was published');
  return sid;
end $$;

-- ---------- row level security ----------
alter table profiles enable row level security;
alter table species enable row level security;
alter table evolution_criteria enable row level security;
alter table species_events enable row level security;
alter table follows enable row level security;
alter table quests enable row level security;
alter table quest_submissions enable row level security;
alter table contributions enable row level security;
alter table lore_votes enable row level security;
alter table reports enable row level security;

create policy "profiles readable" on profiles for select using (not is_private or id = auth.uid() or is_moderator());
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()) and xp = (select xp from profiles where id = auth.uid()));

create policy "species public" on species for select using (status = 'published' or creator_id = auth.uid() or is_moderator());
create policy "criteria public" on evolution_criteria for select using (true);
create policy "events public" on species_events for select using (true);

create policy "own follows read" on follows for select using (user_id = auth.uid());
create policy "own follows add" on follows for insert with check (user_id = auth.uid());
create policy "own follows delete" on follows for delete using (user_id = auth.uid());

create policy "quests public" on quests for select using (active);
create policy "own submissions read" on quest_submissions for select using (user_id = auth.uid() or is_moderator());

create policy "contributions read" on contributions for select using (status = 'approved' or user_id = auth.uid() or is_moderator());
create policy "contributions add" on contributions for insert with check (user_id = auth.uid() and status = 'pending');

create policy "votes read" on lore_votes for select using (true);
create policy "votes add" on lore_votes for insert with check (user_id = auth.uid());

create policy "reports add" on reports for insert with check (reporter_id = auth.uid());
create policy "reports mod read" on reports for select using (is_moderator() or reporter_id = auth.uid());
create policy "reports mod update" on reports for update using (is_moderator());

grant select on species_cards to anon, authenticated;
grant execute on function start_quest(uuid), submit_quest(uuid, text), claim_reward(uuid), create_species(text,text,text,text,text,text,text,boolean) to authenticated;
grant execute on function review_submission(uuid, boolean, text), review_contribution(uuid, boolean) to authenticated;
grant execute on function criteria_progress(uuid), species_progress(uuid) to anon, authenticated;
revoke execute on function check_evolution(uuid) from public, anon, authenticated;
