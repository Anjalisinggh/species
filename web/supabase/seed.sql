-- Starter species + quests so Explore isn't empty. Run after schema.sql.
insert into species (slug, name, description, creature_type, personality, world, color, stage, stage_names, origin_story, window_label, has_token, token_info) values
('mossling','Mossling','A shy forest cub who grows moss wherever friends gather.','animal','Wholesome','Enchanted forest','#62B88A',1,array['Mossling Pup','Mossling Sprout','Elder Moss','Grove Guardian'],'Born under a fallen oak, Mossling remembers every kindness it has ever been shown.','14-day window',false,null),
('zapkin','Zapkin','A pocket-sized bot that rewrites its own jokes.','robot','Chaotic','Cyberpunk','#7774E8',2,array['Zap Chip','Zapkin','Overclock Zapkin','Zapkin Prime'],'Zapkin booted up with a corrupted humor module and decided it was a feature.','30-day window',true,'{"network":"Robinhood Chain (demo)","contract":null,"verified":false}'),
('nebulo','Nebulo','Drifts between constellations collecting forgotten wishes.','alien','Mysterious','Cosmic','#9b8cf0',0,array['Nebulo Spark','Nebulo Drift','Nebulo Nova','Nebulo Eternal'],'Nebulo speaks only in riddles, because plain words were never big enough.','14-day window',false,null),
('bubblix','Bubblix','A tide-pool frog that blows bubbles shaped like questions.','amphibian','Curious','Ocean','#58b5d8',1,array['Bubblix Egg','Bubblix','Tidal Bubblix','Abyss Oracle'],'Every bubble Bubblix blows holds a tiny secret about the sea.','14-day window',false,null),
('emberfox','Emberfox','A flame-tailed trickster who challenges every species it meets.','fantasy','Competitive','Enchanted forest','#ef8f5e',2,array['Ember Kit','Emberfox','Blazefox','Solar Kitsune'],'Emberfox never loses gracefully, and has never lost quietly.','30-day window',true,'{"network":"Robinhood Chain (demo)","contract":null,"verified":false}'),
('glimmer','Glimmer','A drop of starlight that learned to smile.','custom','Wholesome','Cosmic','#e9b44c',0,array['Glimmer Drop','Glimmer Flare','Glimmer Aura','Glimmer Sun'],'Glimmer glows brighter with every shared drawing.','14-day window',false,null)
on conflict (slug) do nothing;

-- Default public criteria for every seeded species that has none yet.
insert into evolution_criteria (species_id, stage, kind, label, target)
select s.id, v.stage, v.kind, v.label, v.target
from species s
cross join (values
  (1,'verified_quests','Verified quests completed by community',5),
  (1,'contributors','Unique contributors',3),
  (2,'verified_quests','Verified quests completed by community',20),
  (2,'approved_contributions','Community contributions approved',5),
  (3,'verified_quests','Verified quests completed by community',60),
  (3,'contributors','Unique contributors',15)
) as v(stage, kind, label, target)
where not exists (select 1 from evolution_criteria c where c.species_id = s.id);

insert into quests (species_id, kind, title, difficulty, time_estimate, xp, objective, eligibility)
select s.id, q.kind, q.title, q.diff, q.t, q.xp, q.obj, q.el from species s join (values
 ('zapkin','daily','Original meme for Zapkin','Easy','5 min',40,'Submit one original meme starring Zapkin. No reposts.','Open to all members'),
 ('mossling','daily','Welcome a new member','Easy','2 min',20,'Say hello to someone who joined this week in the Mossling feed.','Open to all members'),
 ('bubblix','daily','Vote on a story choice','Easy','1 min',15,'Pick what Bubblix does next in Chapter 3.','Open to all members'),
 ('nebulo','weekly','Solve the Nebulo riddle','Medium','15 min',90,'Decode three constellation riddles and share your reasoning.','Open to all members'),
 ('emberfox','weekly','Draw Emberfox mid-leap','Medium','30 min',120,'Original artwork only. Entries pass quality review.','Open to all members'),
 ('mossling','community','1,000 kindness notes','Team','Ongoing',60,'The community writes kindness notes together.','Open to all members'),
 ('glimmer','seasonal','Harvest Moon lore trail','Hard','45 min',250,'Follow six hidden lore clues and assemble the story.','Season 1'),
 ('zapkin','seasonal','Spooky forms fan art','Medium','30 min',150,'Reimagine any species in a spooky costume. XP only.','Season 1')
) as q(slug, kind, title, diff, t, xp, obj, el) on q.slug = s.slug
where not exists (select 1 from quests where quests.species_id = s.id and quests.title = q.title);

-- To make yourself a moderator after signing up:
--   update profiles set role = 'admin' where id = '<your auth user id>';
