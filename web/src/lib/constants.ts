export type Species = {
  id: string; slug: string; name: string; description: string; creature_type: string; personality: string; world: string;
  color: string; stage: number; stage_names: string[]; origin_story: string; window_label: string; has_token: boolean;
  token_info: { network?: string; contract?: string | null; verified?: boolean } | null;
  created_at: string; creator_name: string | null; members: number; progress: number;
};
export type Criterion = { criterion_id: string; stage: number; kind: string; label: string; target: number; current: number };
export type Quest = { id: string; species_id: string | null; kind: string; title: string; difficulty: string; time_estimate: string; xp: number; objective: string; eligibility: string };
export type Submission = { id: string; quest_id: string; status: 'in_progress' | 'submitted' | 'verified' | 'rejected' | 'rewarded'; evidence: string; moderation_note: string | null };
export type Profile = { id: string; display_name: string; xp: number; is_private: boolean; role: string };

export const STAGE_NAMES = ['Hatchling', 'Sprout', 'Wanderer', 'Ascended'];
export const SUBMISSION_STEPS = ['Not started', 'In progress', 'Submitted', 'Verified', 'Rewarded'];
export const submissionIndex = (s?: Submission) => !s ? 0 : s.status === 'in_progress' ? 1 : s.status === 'submitted' ? 2 : s.status === 'verified' ? 3 : s.status === 'rewarded' ? 4 : 1;

export function ago(iso: string) {
  const m = Math.round((Date.now() - +new Date(iso)) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
