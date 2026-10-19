import 'server-only';
import { createPublicClient, encodeAbiParameters, http, keccak256, stringToHex, zeroAddress, type Address, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CHAIN, REGISTRY, registryAbi, speciesKey, type Onchain } from './config';

const client = createPublicClient({ chain: CHAIN, transport: http(undefined, { timeout: 6000, retryCount: 1 }) });

/** Live read of a species' on-chain record. Never throws: the page must render when the RPC is down. */
export async function readOnchain(speciesId: string): Promise<Onchain> {
  if (!REGISTRY) return { status: 'unconfigured' };
  try {
    const s = await client.readContract({ address: REGISTRY, abi: registryAbi, functionName: 'getSpecies', args: [speciesKey(speciesId)] });
    return { status: 'ok', registered: s.creator !== zeroAddress, creator: s.creator, stage: s.stage, registeredAt: Number(s.registeredAt), evolvedAt: Number(s.evolvedAt), tokenRef: s.tokenRef };
  } catch { return { status: 'error' }; }
}

function attester() {
  const key = process.env.ATTESTER_PRIVATE_KEY;
  if (!REGISTRY || !key || !/^0x[0-9a-fA-F]{64}$/.test(key)) return null;
  return privateKeyToAccount(key as Hex);
}
export const canAttest = () => attester() !== null;

// Both digests must match SpeciesRegistry._check exactly.
const TAG = { register: keccak256(stringToHex('SpeciesRegistry.register')), evolve: keccak256(stringToHex('SpeciesRegistry.evolve')) };

export async function signRegister(speciesId: string, creator: Address, slug: string): Promise<Hex | null> {
  const a = attester(); if (!a) return null;
  const hash = keccak256(encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'address' }, { type: 'bytes32' }, { type: 'address' }, { type: 'bytes32' }],
    [TAG.register, BigInt(CHAIN.id), REGISTRY!, speciesKey(speciesId), creator, keccak256(stringToHex(slug))]));
  return a.signMessage({ message: { raw: hash } });
}

export async function signEvolve(speciesId: string, stage: number): Promise<Hex | null> {
  const a = attester(); if (!a) return null;
  const hash = keccak256(encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'address' }, { type: 'bytes32' }, { type: 'uint8' }],
    [TAG.evolve, BigInt(CHAIN.id), REGISTRY!, speciesKey(speciesId), stage]));
  return a.signMessage({ message: { raw: hash } });
}
