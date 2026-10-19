import { CONTACT_EMAIL, LEGAL_UPDATED } from '@/lib/site';

export const metadata = { title: 'Privacy Policy', description: 'What Firstform collects, why, and how it is protected.' };

export default function Privacy() {
  return (
    <div className="wrap narrow legal">
      <div className="pagehead"><h1>Privacy Policy</h1><p className="muted">Last updated {LEGAL_UPDATED}</p></div>
      <div className="card pad">
        <p>Firstform is a creature community game. This policy explains what we collect, why, and the choices you have.</p>

        <h3>What we collect</h3>
        <ul>
          <li><b>Account details:</b> your email address and a password (stored only as a hash by our authentication provider) and a display name.</li>
          <li><b>Activity you create:</b> species you publish, species you follow, quest submissions and the evidence you write, community posts, votes, and reports.</li>
          <li><b>Progress:</b> your XP and level.</li>
          <li><b>Technical data:</b> standard server logs such as IP address, browser type and pages requested, kept by our hosting providers for security and reliability.</li>
        </ul>
        <p>We do not ask for wallet seed phrases or private keys, and we do not collect payment details.</p>

        <h3>How we use it</h3>
        <p>To run your account, show your progress, let moderators review submissions and reports, keep the community safe, and fix problems. We do not sell your personal data and we do not use it for advertising.</p>

        <h3>Cookies and local storage</h3>
        <p>We use only what is needed for the site to work: a sign-in session cookie, and your browser&apos;s local storage to save an unfinished species draft. These are strictly necessary, so there is no tracking-cookie banner to accept. If we add analytics, it will be privacy-friendly and cookie-free, and this page will say so.</p>

        <h3>Who processes your data</h3>
        <p>We use Supabase to host our database and authentication, and a hosting provider to serve the website. They process data on our behalf under their own security and privacy terms.</p>

        <h3>What is public</h3>
        <p>Species you create, their names and descriptions, and approved community posts are visible to others, along with your display name. You can make your profile private from My Collection. Quest evidence is visible only to you and moderators.</p>

        <h3>Retention and deletion</h3>
        <p>We keep your data while your account exists. You can ask us to delete your account and associated personal data at any time using the contact below. Some records, such as moderation reports, may be kept for a limited time where needed to protect the community.</p>

        <h3>Your rights</h3>
        <p>Depending on where you live, you may have the right to access, correct, export or delete your personal data, and to object to or restrict some processing. Contact us and we will respond within a reasonable time.</p>

        <h3>Children</h3>
        <p>Firstform is not directed to children under 13, and we do not knowingly collect their data.</p>

        <h3>Changes</h3>
        <p>If we change this policy in a meaningful way, we will update the date above and, where appropriate, tell you in the product.</p>

        <h3>Contact</h3>
        <p>{CONTACT_EMAIL ? <>Questions or requests: <a href={`mailto:${CONTACT_EMAIL}`}><u>{CONTACT_EMAIL}</u></a>.</> : 'Questions or requests: please contact the site operator through the community channels listed on this site.'}</p>
      </div>
    </div>
  );
}
