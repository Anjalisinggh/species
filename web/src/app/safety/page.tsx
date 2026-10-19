export const metadata = { title: 'Safety & risks' };
export default function Safety() {
  return (
    <div className="wrap narrow">
      <div className="pagehead"><h1>Safety &amp; risks</h1></div>
      <div className="card pad">
        <p>Firstform is a game first. You can explore, follow, play quests and evolve species without owning any token.</p>
        <h3>Tokens (optional)</h3>
        <p>Where a species has a token, it is separate from XP, evolution and collectibles. Tokens are volatile, can lose all value, and may have thin liquidity. Smart contracts can contain bugs. Nothing here is financial advice or a promise of returns.</p>
        <h3>Your account</h3>
        <p>We will never ask for a seed phrase or private key. Wallet actions, when they exist, use standard wallet signing with a transaction preview.</p>
        <h3>Fair rules</h3>
        <p>Evolution criteria are published before anyone contributes. They are checked by application logic, not by AI, and can&apos;t be silently changed.</p>
        <h3>Reporting</h3>
        <p>Every species and contribution has a report button. Moderators review reports and submissions before XP is awarded.</p>
      </div>
    </div>
  );
}
