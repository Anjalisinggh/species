import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import './theme.css';
import './art.css';
import './storybook.css';
import { ToastProvider } from '@/components/ui';
import { BottomNav, EyeTracker, GlobalSearch, LogoMark, NavLinks, ProfileMenu } from '@/components/chrome';
import { Icon } from '@/components/icons';
import { getProfile } from '@/lib/data';
import { isConfigured } from '@/lib/supabase/server';
import { signOut } from './actions';
import Script from 'next/script';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const grotesk = Fraunces({ subsets: ['latin'], variable: '--font-grotesk' });

const DESC = 'Discover strange little creatures, join their communities, and help shape what they become.';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Firstform — Every species has a story', template: '%s — Firstform' },
  description: DESC,
  applicationName: SITE_NAME,
  openGraph: { type: 'website', siteName: SITE_NAME, title: 'Firstform — Every species has a story', description: DESC, url: SITE_URL },
  twitter: { card: 'summary_large_image', title: 'Firstform — Every species has a story', description: DESC }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const configured = isConfigured();
  const profile = configured ? await getProfile() : null;
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <ToastProvider>
          <header className="topbar">
            <div className="wrap">
              <Link className="logo" href="/"><LogoMark /><span>First<em>form</em></span></Link>
              <NavLinks />
              <div className="tools">
                {configured && <GlobalSearch />}
                <Link className="iconbtn search-link" href="/explore#search" aria-label="Search species"><Icon name="search" /></Link>
                {profile
                  ? <ProfileMenu name={profile.display_name} moderator={profile.role === 'moderator' || profile.role === 'admin'} signOut={signOut} />
                  : <Link className="btn sm accent" href="/login">Sign in</Link>}
              </div>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            {!configured ? <SetupNotice /> : children}
          </main>
          <footer className="footer">
            <div className="wrap">
              <div><div className="logo" style={{ color: '#fff' }}><LogoMark /><span>First<em>form</em></span></div><p style={{ maxWidth: '34ch', marginTop: 10 }}>Discover. Evolve. Belong.</p></div>
              <div><h4>Explore</h4><Link href="/explore">Species</Link><Link href="/quests">Quests</Link><Link href="/battles">Battles</Link></div>
              <div><h4>Take part</h4><Link href="/create">Create a species</Link><Link href="/collection">My collection</Link></div>
              <div><h4>Trust</h4><Link href="/safety">Safety &amp; risks</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link></div>
              <p className="small" style={{ flexBasis: '100%', margin: 0, opacity: 0.8 }}>No financial returns are promised. Token features are optional, separate from gameplay, and carry risk.</p>
            </div>
          </footer>
          <BottomNav />
          <EyeTracker />
          {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && <Script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
        </ToastProvider>
      </body>
    </html>
  );
}

function SetupNotice() {
  return (
    <div className="wrap narrow" style={{ padding: '60px 20px' }}>
      <div className="card pad">
        <h1 style={{ fontSize: '2rem' }}>Connect Supabase to get started</h1>
        <ol>
          <li>Create a project at supabase.com.</li>
          <li>In the SQL editor, run <code>supabase/schema.sql</code>, then <code>supabase/seed.sql</code>.</li>
          <li>Copy <code>.env.local.example</code> to <code>.env.local</code> and fill in the project URL and anon key.</li>
          <li>Restart <code>npm run dev</code>.</li>
        </ol>
      </div>
    </div>
  );
}
