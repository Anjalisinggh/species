// Proves the web app's signer (viem, see web/src/lib/chain/server.ts) produces signatures this contract accepts.
const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const { encodeAbiParameters, keccak256, stringToHex } = require('viem');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');

const speciesKey = (uuid) => `0x${uuid.replace(/-/g, '').toLowerCase().padStart(64, '0')}`;

describe('viem attester compatibility', () => {
  it('accepts register and evolve signatures built the way the web app builds them', async () => {
    const attester = privateKeyToAccount(generatePrivateKey());
    const [, creator] = await ethers.getSigners();
    const registry = await ethers.deployContract('SpeciesRegistry', [attester.address]);
    const addr = await registry.getAddress();
    const chainId = BigInt(network.config.chainId);
    const id = speciesKey('3F2B8C1E-9a4d-4c6f-b1a2-7d5e8f901234');

    const reg = await attester.signMessage({ message: { raw: keccak256(encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'address' }, { type: 'bytes32' }, { type: 'address' }, { type: 'bytes32' }],
      [keccak256(stringToHex('SpeciesRegistry.register')), chainId, addr, id, creator.address, keccak256(stringToHex('mossling'))])) } });
    await registry.connect(creator).register(id, 'mossling', reg);

    const evo = await attester.signMessage({ message: { raw: keccak256(encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'address' }, { type: 'bytes32' }, { type: 'uint8' }],
      [keccak256(stringToHex('SpeciesRegistry.evolve')), chainId, addr, id, 1])) } });
    await registry.recordEvolution(id, 1, evo);

    const s = await registry.getSpecies(id);
    expect(s.creator).to.equal(creator.address);
    expect(s.stage).to.equal(1n);
  });
});
