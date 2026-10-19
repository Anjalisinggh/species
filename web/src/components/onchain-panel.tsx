'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseError, ContractFunctionRevertedError, createPublicClient, createWalletClient, custom, http, UserRejectedRequestError, type Address, type Hex } from 'viem';
import { attestEvolution, attestRegister } from '@/app/actions';
import { CHAIN, REGISTRY, TOKEN_PREFIX, explorer, isSolanaMint, registryAbi, speciesKey, type Onchain } from '@/lib/chain/config';
import { useToast } from './ui';

type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (e: string, f: (a: string[]) => void) => void; removeListener?: (e: string, f: (a: string[]) => void) => void };
const eth = () => (typeof window === 'undefined' ? undefined : (window as unknown as { ethereum?: Eth }).ethereum);
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const REVERTS: Record<string, string> = {
  AlreadyRegistered: 'This species is already registered on-chain.', NotRegistered: 'This species is not registered on-chain yet.',
  NotCreator: 'Only the wallet that registered this species can do that.', BadStage: 'The chain is already at this stage.',
  BadSignature: 'The server approval did not match this wallet. Reconnect and try again.', BadInput: 'That value is not accepted.'
};
function explain(e: unknown) {
  if (e instanceof BaseError) {
    if (e.walk((x) => x instanceof UserRejectedRequestError)) return 'You cancelled the request in your wallet.';
    const r = e.walk((x) => x instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
    if (r?.data?.errorName && REVERTS[r.data.errorName]) return REVERTS[r.data.errorName];
    return e.shortMessage;
  }
  return 'Something went wrong. Nothing was changed.';
}

export function OnchainPanel({ speciesId, name, gameStage, stageNames, chain }: { speciesId: string; name: string; gameStage: number; stageNames: string[]; chain: Extract<Onchain, { status: 'ok' }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [account, setAccount] = useState<Address | null>(null);
  const [hasWallet, setHasWallet] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tx, setTx] = useState<Hex | null>(null);
  const [mint, setMint] = useState('');

  useEffect(() => {
    const e = eth(); setHasWallet(!!e); if (!e) return;
    e.request({ method: 'eth_accounts' }).then((a) => setAccount(((a as Address[])[0]) ?? null)).catch(() => {});
    const changed = (a: string[]) => setAccount((a[0] as Address) ?? null);
    e.on?.('accountsChanged', changed);
    return () => e.removeListener?.('accountsChanged', changed);
  }, []);

  async function connect(): Promise<Address | null> {
    const e = eth(); if (!e) return null;
    const [a] = (await e.request({ method: 'eth_requestAccounts' })) as Address[];
    setAccount(a ?? null);
    return a ?? null;
  }
  async function ensureChain(e: Eth) {
    const id = `0x${CHAIN.id.toString(16)}`;
    try { await e.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: id }] }); }
    catch (err) {
      if ((err as { code?: number }).code !== 4902) throw err;
      await e.request({ method: 'wallet_addEthereumChain', params: [{ chainId: id, chainName: CHAIN.name, nativeCurrency: CHAIN.nativeCurrency, rpcUrls: CHAIN.rpcUrls.default.http, blockExplorerUrls: [CHAIN.blockExplorers.default.url] }] });
    }
  }

  /** Runs one contract write end to end and only reports success once the transaction is mined. */
  async function send(label: string, build: (from: Address) => Promise<{ functionName: 'register' | 'recordEvolution' | 'setTokenRef'; args: readonly unknown[] } | string>, done: string) {
    const e = eth(); if (!e || !REGISTRY) return;
    setError(''); setTx(null); setBusy(label);
    try {
      const from = account ?? (await connect()); if (!from) throw new Error('no-account');
      await ensureChain(e);
      const call = await build(from);
      if (typeof call === 'string') { setError(call); return; }
      const wallet = createWalletClient({ account: from, chain: CHAIN, transport: custom(e) });
      const pub = createPublicClient({ chain: CHAIN, transport: http() });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { request } = await pub.simulateContract({ account: from, address: REGISTRY, abi: registryAbi, ...(call as any) });
      const hash = await wallet.writeContract(request);
      setTx(hash); setBusy('Waiting for confirmation');
      const receipt = await pub.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') { setError('The transaction was mined but failed. Nothing was recorded.'); return; }
      toast(done); router.refresh();
    } catch (err) { setError(explain(err)); }
    finally { setBusy(null); }
  }

  const register = () => send('Registering', async (from) => {
    const a = await attestRegister(speciesId, from);
    return a.ok ? { functionName: 'register', args: [speciesKey(speciesId), a.slug!, a.sig!] } : a.error!;
  }, `${name} is registered on ${CHAIN.name}`);
  const evolve = () => send('Recording evolution', async () => {
    const a = await attestEvolution(speciesId);
    return a.ok ? { functionName: 'recordEvolution', args: [speciesKey(speciesId), a.stage!, a.sig!] } : a.error!;
  }, 'Evolution recorded on-chain');
  const linkToken = () => send('Linking token', async () => (isSolanaMint(mint.trim()) ? { functionName: 'setTokenRef', args: [speciesKey(speciesId), TOKEN_PREFIX + mint.trim()] } : 'Enter a valid Solana token address (the mint shown on Bags).'), 'Token linked');

  const isCreator = !!account && chain.registered && account.toLowerCase() === chain.creator.toLowerCase();
  const behind = chain.registered && chain.stage < gameStage;

  return (
    <div className="card pad">
      <h3>Actions</h3>
      {!hasWallet ? (
        <p className="muted" style={{ margin: 0 }}>No browser wallet found. Install a wallet such as MetaMask to register or record on-chain. Everything else on Firstform works without one.</p>
      ) : (
        <>
          <p className="small muted">{account ? <>Connected as <b>{short(account)}</b>. You confirm every transaction in your wallet and pay a small network fee in ETH.</> : 'Connect a wallet to continue. We never ask for a seed phrase or private key.'}</p>
          <div className="btnrow">
            {!account && <button className="btn sm" disabled={!!busy} onClick={() => connect().catch((e) => setError(explain(e)))}>Connect wallet</button>}
            {account && !chain.registered && <button className="btn sm" disabled={!!busy} aria-busy={busy === 'Registering'} onClick={register}>Register {name} on-chain</button>}
            {account && behind && <button className="btn sm" disabled={!!busy} aria-busy={busy === 'Recording evolution'} onClick={evolve}>Record {stageNames[chain.stage + 1]} on-chain</button>}
          </div>
          {account && chain.registered && !behind && <p className="small muted" style={{ margin: '10px 0 0' }}>The chain matches the game. Nothing to record right now.</p>}
          {isCreator && (
            <div className="field" style={{ margin: '18px 0 0' }}>
              <label htmlFor="mint">Link a Bags token (optional)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="mint" value={mint} onChange={(e) => setMint(e.target.value)} placeholder="Solana token address" autoComplete="off" spellCheck={false} />
                <button className="btn sm sec" disabled={!!busy || !mint.trim()} aria-busy={busy === 'Linking token'} onClick={linkToken}>Link</button>
              </div>
              <div className="hint">Launch the token on bags.fm first, then paste its address. This only stores a pointer; it does not create or move any token.</div>
            </div>
          )}
          <div role="status" aria-live="polite">
            {busy && <p className="small muted" style={{ margin: '12px 0 0' }}>{busy}… keep this tab open.</p>}
            {tx && <p className="small" style={{ margin: '8px 0 0' }}><a href={explorer('tx', tx)} target="_blank" rel="noreferrer">View transaction</a></p>}
          </div>
          {error && <p className="err" role="alert" style={{ margin: '12px 0 0' }}>{error}</p>}
        </>
      )}
    </div>
  );
}
