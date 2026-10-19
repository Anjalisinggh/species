import Link from 'next/link';
import { CONTACT_EMAIL, LEGAL_UPDATED } from '@/lib/site';

export const metadata = { title: 'Terms and Conditions', description: 'The rules for using Firstform.' };

export default function Terms() {
  return (
    <div className="wrap narrow legal">
      <div className="pagehead"><h1>Terms and Conditions</h1><p className="muted">Last updated {LEGAL_UPDATED}</p></div>
      <div className="card pad">
        <p>By using Firstform you agree to these terms. If you do not agree, please do not use the site.</p>

        <h3>Using the site</h3>
        <ul>
          <li>You must be at least 13 years old, and old enough to agree to these terms where you live.</li>
          <li>Keep your login secure. You are responsible for activity on your account.</li>
          <li>Do not attempt to cheat quests or XP, use bots or scripts, or probe the site for weaknesses.</li>
        </ul>

        <h3>Your content</h3>
        <p>You keep ownership of what you create. By posting it, you give Firstform a non-exclusive licence to display it on the site and in share cards so the community can see it. Only submit work you have the right to share. Do not post anything illegal, hateful, harassing, sexual involving minors, misleading, or that infringes someone else&apos;s rights.</p>

        <h3>Moderation</h3>
        <p>Submissions and posts are reviewed before they count or appear publicly. We may remove content, withhold XP, hide a species, or suspend accounts that break these rules. Every species and post has a report button.</p>

        <h3>XP, evolution and rewards</h3>
        <p>XP, badges and evolutions are game features with no cash value. Evolution criteria are published in advance and decided by the site&apos;s rules, not by AI. We may rebalance or reset game features, and we will not change criteria for a milestone already in progress without saying so.</p>

        <h3>Optional token features</h3>
        <p>Some species may later link to a token. Tokens are optional, separate from gameplay, and are not an investment product. Their value can fall to zero and nothing on this site is financial advice or a promise of returns. See <Link href="/safety"><u>Safety &amp; risks</u></Link>.</p>

        <h3>AI-generated material</h3>
        <p>Parts of the experience may use AI-assisted art or writing, labelled where it appears. It may be imperfect.</p>

        <h3>Availability and liability</h3>
        <p>The site is provided &quot;as is&quot;. We do not guarantee it will always be available or error-free. To the extent the law allows, we are not liable for indirect or consequential losses arising from your use of the site. Nothing here limits rights you have by law that cannot be limited.</p>

        <h3>Ending your use</h3>
        <p>You can stop using the site at any time and ask us to delete your account. We may suspend or end access for serious or repeated breaches of these terms.</p>

        <h3>Changes</h3>
        <p>We may update these terms. If we make a meaningful change, we will update the date above. Continuing to use the site means you accept the updated terms.</p>

        <h3>Contact</h3>
        <p>{CONTACT_EMAIL ? <>Email <a href={`mailto:${CONTACT_EMAIL}`}><u>{CONTACT_EMAIL}</u></a>.</> : 'Please contact the site operator through the community channels listed on this site.'} See also our <Link href="/privacy"><u>Privacy Policy</u></Link>.</p>
      </div>
    </div>
  );
}
