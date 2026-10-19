'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Result = { ok: boolean; error?: string; msg?: string; slug?: string; xp?: number };
const fail = (e: { message: string } | null | undefined): Result => ({ ok: false, error: e?.message ?? 'Something went wrong' });
const done = (extra: Partial<Result> = {}): Result => { revalidatePath('/', 'layout'); return { ok: true, ...extra }; };

async function authed() {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user };
}

/* ----- auth ----- */
export async function signIn(_: Result | null, fd: FormData): Promise<Result> {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) });
  if (error) return fail(error);
  redirect(safeNext(fd.get('next')));
}
export async function signUp(_: Result | null, fd: FormData): Promise<Result> {
  const sb = await createClient();
  const password = String(fd.get('password'));
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  const { data, error } = await sb.auth.signUp({ email: String(fd.get('email')), password });
  if (error) return fail(error);
  if (!data.session) return { ok: true, msg: 'Check your email to confirm your account, then sign in.' };
  redirect(safeNext(fd.get('next')));
}
export async function signOut() {
  const sb = await createClient(); await sb.auth.signOut(); revalidatePath('/', 'layout'); redirect('/');
}
const safeNext = (n: FormDataEntryValue | null) => { const s = String(n ?? '/'); return s.startsWith('/') && !s.startsWith('//') ? s : '/'; };

/* ----- follows ----- */
export async function toggleFollow(speciesId: string, following: boolean): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in to follow species.' };
  const { error } = following
    ? await sb.from('follows').delete().eq('user_id', user.id).eq('species_id', speciesId)
    : await sb.from('follows').insert({ user_id: user.id, species_id: speciesId });
  return error ? fail(error) : done({ msg: following ? 'Unfollowed' : 'Following!' });
}

/* ----- quests ----- */
export async function startQuest(qid: string): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in to start quests.' };
  const { error } = await sb.rpc('start_quest', { qid });
  return error ? fail(error) : done({ msg: 'Quest started' });
}
export async function submitQuest(qid: string, evidence: string): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in first.' };
  if (!evidence.trim()) return { ok: false, error: 'Add a link or short description of your work.' };
  const { error } = await sb.rpc('submit_quest', { qid, ev: evidence.trim() });
  return error ? fail(error) : done({ msg: 'Submitted for review' });
}
export async function claimReward(sid: string): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in first.' };
  const { data, error } = await sb.rpc('claim_reward', { sid });
  return error ? fail(error) : done({ xp: data as number, msg: `+${data} XP earned!` });
}

/* ----- species ----- */
export type NewSpecies = { name: string; description: string; type: string; personality: string; world: string; color: string; story: string };
export async function createSpecies(s: NewSpecies): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in to publish a species.' };
  if (s.name.trim().length < 2 || s.name.trim().length > 24) return { ok: false, error: 'Name must be 2–24 characters.' };
  const { data, error } = await sb.rpc('create_species', {
    p_name: s.name.trim(), p_desc: s.description.trim(), p_type: s.type, p_personality: s.personality, p_world: s.world,
    p_color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#62B88A', p_story: s.story.slice(0, 1000), p_token: false
  });
  if (error) return fail(error);
  const { data: row } = await sb.from('species').select('slug').eq('id', data as string).single();
  return done({ slug: row?.slug, msg: 'Species published!' });
}

export async function postContribution(speciesId: string, body: string): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in to contribute.' };
  if (!body.trim()) return { ok: false, error: 'Write something first.' };
  const { error } = await sb.from('contributions').insert({ species_id: speciesId, user_id: user.id, body: body.trim().slice(0, 1000) });
  return error ? fail(error) : done({ msg: 'Submitted. It will appear after review.' });
}
export async function voteLore(speciesId: string, option: number): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in to vote.' };
  const { error } = await sb.from('lore_votes').insert({ species_id: speciesId, chapter: 1, option, user_id: user.id });
  if (error?.code === '23505') return { ok: false, error: 'You already voted on this chapter.' };
  return error ? fail(error) : done({ msg: 'Vote recorded' });
}
export async function report(speciesId: string, reason: string, contributionId?: string): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in to report.' };
  const { error } = await sb.from('reports').insert({ reporter_id: user.id, species_id: speciesId, contribution_id: contributionId ?? null, reason: reason.slice(0, 200) });
  return error ? fail(error) : done({ msg: 'Report sent. Thank you.' });
}

/* ----- profile ----- */
export async function setPrivacy(isPrivate: boolean): Promise<Result> {
  const { sb, user } = await authed(); if (!user) return { ok: false, error: 'Sign in first.' };
  const { error } = await sb.from('profiles').update({ is_private: isPrivate }).eq('id', user.id);
  return error ? fail(error) : done({ msg: isPrivate ? 'Profile is private' : 'Profile is public' });
}

/* ----- moderation (RLS + SQL functions enforce moderator role) ----- */
export async function reviewSubmission(sid: string, approve: boolean, note?: string): Promise<Result> {
  const { sb } = await authed();
  const { error } = await sb.rpc('review_submission', { sid, approve, note: note ?? null });
  return error ? fail(error) : done({ msg: approve ? 'Verified' : 'Rejected' });
}
export async function reviewContribution(cid: string, approve: boolean): Promise<Result> {
  const { sb } = await authed();
  const { error } = await sb.rpc('review_contribution', { cid, approve });
  return error ? fail(error) : done({ msg: approve ? 'Approved' : 'Rejected' });
}
export async function resolveReport(id: string): Promise<Result> {
  const { sb } = await authed();
  const { error } = await sb.from('reports').update({ status: 'resolved' }).eq('id', id);
  return error ? fail(error) : done({ msg: 'Resolved' });
}
