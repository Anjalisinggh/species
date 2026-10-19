import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Species, Criterion, Quest, Submission, Profile } from './constants';
export * from './constants';

export const getUser = cache(async () => {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  return data.user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser(); if (!user) return null;
  const sb = await createClient();
  const { data } = await sb.from('profiles').select('id,display_name,xp,is_private,role').eq('id', user.id).single();
  return data as Profile | null;
});

export async function listSpecies(opts: { q?: string; sort?: string } = {}): Promise<Species[]> {
  const sb = await createClient();
  let query = sb.from('species_cards').select('*');
  const q = (opts.q ?? '').replace(/[%,()]/g, ' ').trim();
  if (q) query = query.or(`name.ilike.%${q}%,personality.ilike.%${q}%,world.ilike.%${q}%,creature_type.ilike.%${q}%,creator_name.ilike.%${q}%`);
  const { data } = await query;
  const list = (data ?? []) as Species[];
  if (opts.sort === 'recent') list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  else if (opts.sort === 'members') list.sort((a, b) => b.members - a.members);
  else if (opts.sort === 'closest') list.sort((a, b) => (b.stage < 3 ? b.progress : -1) - (a.stage < 3 ? a.progress : -1));
  else list.sort((a, b) => b.members + b.progress - (a.members + a.progress));
  return list;
}

export async function getSpecies(slug: string): Promise<Species | null> {
  const sb = await createClient();
  const { data } = await sb.from('species_cards').select('*').eq('slug', slug).maybeSingle();
  return (data as Species) ?? null;
}

export async function getCriteria(id: string): Promise<Criterion[]> {
  const sb = await createClient();
  const { data } = await sb.rpc('criteria_progress', { sp: id });
  return (data ?? []) as Criterion[];
}

export async function getAllCriteria(id: string) {
  const sb = await createClient();
  const { data } = await sb.from('evolution_criteria').select('stage,kind,label,target').eq('species_id', id).order('stage');
  return (data ?? []) as { stage: number; kind: string; label: string; target: number }[];
}

export async function getEvents(id: string) {
  const sb = await createClient();
  const { data } = await sb.from('species_events').select('id,type,text,created_at').eq('species_id', id).order('created_at', { ascending: false }).limit(8);
  return (data ?? []) as { id: string; type: string; text: string; created_at: string }[];
}

export async function getQuests(speciesId?: string): Promise<Quest[]> {
  const sb = await createClient();
  let q = sb.from('quests').select('*').order('xp');
  if (speciesId) q = q.eq('species_id', speciesId);
  const { data } = await q;
  return (data ?? []) as Quest[];
}

export async function getMySubmissions(): Promise<Record<string, Submission>> {
  const user = await getUser(); if (!user) return {};
  const sb = await createClient();
  const { data } = await sb.from('quest_submissions').select('id,quest_id,status,evidence,moderation_note').eq('user_id', user.id);
  return Object.fromEntries(((data ?? []) as Submission[]).map((s) => [s.quest_id, s]));
}

export async function getMyFollows(): Promise<string[]> {
  const user = await getUser(); if (!user) return [];
  const sb = await createClient();
  const { data } = await sb.from('follows').select('species_id').eq('user_id', user.id);
  return (data ?? []).map((r: { species_id: string }) => r.species_id);
}

export async function getContributions(id: string) {
  const sb = await createClient();
  const { data } = await sb.from('contributions').select('id,body,status,created_at,user_id').eq('species_id', id).order('created_at', { ascending: false }).limit(20);
  return (data ?? []) as { id: string; body: string; status: string; created_at: string; user_id: string }[];
}

export async function getVotes(id: string) {
  const sb = await createClient();
  const { data } = await sb.from('lore_votes').select('option').eq('species_id', id).eq('chapter', 1);
  const counts = [0, 0, 0];
  (data ?? []).forEach((v: { option: number }) => counts[v.option]++);
  return counts;
}

