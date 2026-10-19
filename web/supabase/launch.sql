-- Launch hardening: per-user rate limits on public write endpoints. Safe to run more than once.
-- Runs inside the database, so it applies no matter how the API is called.

create or replace function enforce_rate_limit() returns trigger language plpgsql security definer set search_path = public as $$
declare uid uuid; n int; lim int; win interval;
begin
  if tg_table_name = 'contributions' then uid := new.user_id; lim := 5;  win := interval '1 hour';
    select count(*) into n from contributions where user_id = uid and created_at > now() - win;
  elsif tg_table_name = 'reports' then uid := new.reporter_id; lim := 10; win := interval '1 hour';
    select count(*) into n from reports where reporter_id = uid and created_at > now() - win;
  elsif tg_table_name = 'species' then uid := new.creator_id; lim := 3;  win := interval '1 day';
    select count(*) into n from species where creator_id = uid and created_at > now() - win;
  else return new; end if;
  if uid is not null and n >= lim then
    raise exception 'You are doing that too often. Please try again later.' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists contributions_rate on contributions;
create trigger contributions_rate before insert on contributions for each row execute function enforce_rate_limit();
drop trigger if exists reports_rate on reports;
create trigger reports_rate before insert on reports for each row execute function enforce_rate_limit();
drop trigger if exists species_rate on species;
create trigger species_rate before insert on species for each row execute function enforce_rate_limit();

-- Stop one account flooding the moderation queue with quest submissions.
create or replace function limit_pending_submissions() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'submitted' and (select count(*) from quest_submissions where user_id = new.user_id and status = 'submitted' and id <> new.id) >= 20 then
    raise exception 'You have many submissions waiting for review. Please wait for them to be checked.';
  end if;
  return new;
end $$;
drop trigger if exists submissions_pending_limit on quest_submissions;
create trigger submissions_pending_limit before insert or update on quest_submissions for each row execute function limit_pending_submissions();
