import { defineChain, isAddress, type Address, type Hex } from 'viem';

// Values from https://docs.robinhood.com/chain/connecting
export const robinhoodTestnet = defineChain({
  id: 46630, name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.chain.robinhood.com'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer.testnet.chain.robinhood.com' } },
  testnet: true
});
export const robinhood = defineChain({
  id: 4663, name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mainnet.chain.robinhood.com'] } },
  blockExplorers: { default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' } }
});

export const CHAIN = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? robinhood : robinhoodTestnet;
const addr = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ?? '';
export const REGISTRY: Address | null = isAddress(addr) ? addr : null;
export const explorer = (kind: 'address' | 'tx', v: string) => `${CHAIN.blockExplorers.default.url}/${kind}/${v}`;

/** A species UUID as the bytes32 key used on-chain (16 UUID bytes, left-padded). */
export const speciesKey = (uuid: string): Hex => `0x${uuid.replace(/-/g, '').toLowerCase().padStart(64, '0')}`;

export const TOKEN_PREFIX = 'solana:';
export const isSolanaMint = (s: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);

export type Onchain =
  | { status: 'unconfigured' }
  | { status: 'error' }
  | { status: 'ok'; registered: boolean; creator: Address; stage: number; registeredAt: number; evolvedAt: number; tokenRef: string };

// Mirrors chain/contracts/SpeciesRegistry.sol
export const registryAbi = [
  { type: 'function', name: 'register', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'bytes32' }, { name: 'slug', type: 'string' }, { name: 'sig', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'recordEvolution', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'bytes32' }, { name: 'stage', type: 'uint8' }, { name: 'sig', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'setTokenRef', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'bytes32' }, { name: 'tokenRef', type: 'string' }], outputs: [] },
  { type: 'function', name: 'getSpecies', stateMutability: 'view', inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'tuple', components: [
    { name: 'creator', type: 'address' }, { name: 'stage', type: 'uint8' }, { name: 'registeredAt', type: 'uint64' }, { name: 'evolvedAt', type: 'uint64' }, { name: 'slug', type: 'string' }, { name: 'tokenRef', type: 'string' }] }] },
  { type: 'error', name: 'AlreadyRegistered', inputs: [] }, { type: 'error', name: 'NotRegistered', inputs: [] }, { type: 'error', name: 'NotCreator', inputs: [] },
  { type: 'error', name: 'BadStage', inputs: [] }, { type: 'error', name: 'BadSignature', inputs: [] }, { type: 'error', name: 'BadInput', inputs: [] }
] as const;
