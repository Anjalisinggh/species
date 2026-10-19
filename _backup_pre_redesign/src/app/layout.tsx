import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui';
import { BottomNav, EyeTracker, LogoMark, NavLinks } from '@/components/chrome';
import { getProfile } from '@/lib/data';
import { isConfigured } from '@/lib/supabase/server';
import { signOut } from './actions';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });

export const metadata: Metadata = {
  title: { default: 'Species.family — Every species starts somewhere', template: '%s — Species.family' },
  description: 'Create a creature, build its community, and watch it evolve.'
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
              <Link className="logo" href="/"><LogoMark /><span>Species<em>.family</em></span></Link>
              <NavLinks />
              <div className="tools">
                <form action="/explore" className="search" role="search">
                  <label className="sr" htmlFor="gs">Search species</label>
                  <input id="gs" name="q" type="search" placeholder="Search species, creators, traits" />
                </form>
                {profile ? (
                  <>
                    {(profile.role === 'moderator' || profile.role === 'admin') && <Link className="btn sm sec" href="/admin">Moderate</Link>}
                    <Link className="iconbtn avatar" href="/collection" aria-label={`Profile: ${profile.display_name}`}>{profile.display_name[0]?.toUpperCase()}</Link>
                    <form action={signOut}><button className="btn sm sec">Sign out</button></form>
                  </>
                ) : (
                  <Link className="btn sm" href="/login">Sign in</Link>
                )}
              </div>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            {!configured ? <SetupNotice /> : children}
          </main>
          <footer className="footer">
            <div className="wrap">
              <div><div className="logo" style={{ color: '#fff' }}><LogoMark /><span>Species<em>.family</em></span></div><p style={{ maxWidth: '34ch', marginTop: 10 }}>Create a species. Raise it together. Shape its evolution.</p></div>
              <div><h4>Explore</h4><Link href="/explore">Species</Link><Link href="/quests">Quests</Link><Link href="/create">Create</Link></div>
              <div><h4>Trust</h4><Link href="/safety">Safety &amp; risks</Link></div>
              <p className="small" style={{ flexBasis: '100%', margin: 0, opacity: 0.8 }}>No financial returns are promised. Token features are optional, separate from gameplay, and carry risk.</p>
            </div>
          </footer>
          <BottomNav />
          <EyeTracker />
        </ToastProvider>
      </body>
    </html>
  );
}

function SetupNotice() {
  return (
    <div className="wrap" style={{ padding: '60px 20px' }}>
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
