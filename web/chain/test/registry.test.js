const { expect } = require('chai');
const { ethers } = require('hardhat');

const REGISTER = ethers.id('SpeciesRegistry.register');
const EVOLVE = ethers.id('SpeciesRegistry.evolve');
const coder = ethers.AbiCoder.defaultAbiCoder();
const ID = ethers.zeroPadValue('0x3f2b8c1e9a4d4c6fb1a27d5e8f901234', 32);

describe('SpeciesRegistry', () => {
  let registry, owner, attester, creator, stranger, chainId, addr;

  const signRegister = (signer, id, who, slug) => signer.signMessage(ethers.getBytes(ethers.keccak256(
    coder.encode(['bytes32', 'uint256', 'address', 'bytes32', 'address', 'bytes32'], [REGISTER, chainId, addr, id, who, ethers.id(slug)]))));
  const signEvolve = (signer, id, stage) => signer.signMessage(ethers.getBytes(ethers.keccak256(
    coder.encode(['bytes32', 'uint256', 'address', 'bytes32', 'uint8'], [EVOLVE, chainId, addr, id, stage]))));

  beforeEach(async () => {
    [owner, attester, creator, stranger] = await ethers.getSigners();
    registry = await ethers.deployContract('SpeciesRegistry', [attester.address]);
    addr = await registry.getAddress();
    chainId = (await ethers.provider.getNetwork()).chainId;
  });

  it('registers with a valid attestation', async () => {
    const sig = await signRegister(attester, ID, creator.address, 'mossling');
    await expect(registry.connect(creator).register(ID, 'mossling', sig)).to.emit(registry, 'SpeciesRegistered').withArgs(ID, creator.address, 'mossling');
    const s = await registry.getSpecies(ID);
    expect(s.creator).to.equal(creator.address);
    expect(s.stage).to.equal(0n);
    expect(s.slug).to.equal('mossling');
    expect(await registry.total()).to.equal(1n);
  });

  it('rejects an attestation used by a different wallet, slug or signer', async () => {
    const sig = await signRegister(attester, ID, creator.address, 'mossling');
    await expect(registry.connect(stranger).register(ID, 'mossling', sig)).to.be.revertedWithCustomError(registry, 'BadSignature');
    await expect(registry.connect(creator).register(ID, 'zapkin', sig)).to.be.revertedWithCustomError(registry, 'BadSignature');
    const forged = await signRegister(stranger, ID, creator.address, 'mossling');
    await expect(registry.connect(creator).register(ID, 'mossling', forged)).to.be.revertedWithCustomError(registry, 'BadSignature');
  });

  it('cannot register twice', async () => {
    const sig = await signRegister(attester, ID, creator.address, 'mossling');
    await registry.connect(creator).register(ID, 'mossling', sig);
    await expect(registry.connect(creator).register(ID, 'mossling', sig)).to.be.revertedWithCustomError(registry, 'AlreadyRegistered');
  });

  it('records evolution one stage at a time, submitted by anyone', async () => {
    await registry.connect(creator).register(ID, 'mossling', await signRegister(attester, ID, creator.address, 'mossling'));
    await expect(registry.connect(stranger).recordEvolution(ID, 2, await signEvolve(attester, ID, 2))).to.be.revertedWithCustomError(registry, 'BadStage');
    await expect(registry.connect(stranger).recordEvolution(ID, 1, await signEvolve(attester, ID, 1))).to.emit(registry, 'SpeciesEvolved').withArgs(ID, 1);
    await expect(registry.recordEvolution(ID, 1, await signEvolve(attester, ID, 1))).to.be.revertedWithCustomError(registry, 'BadStage');
    await registry.recordEvolution(ID, 2, await signEvolve(attester, ID, 2));
    await registry.recordEvolution(ID, 3, await signEvolve(attester, ID, 3));
    await expect(registry.recordEvolution(ID, 4, await signEvolve(attester, ID, 4))).to.be.revertedWithCustomError(registry, 'BadStage');
    expect((await registry.getSpecies(ID)).stage).to.equal(3n);
  });

  it('rejects evolution without a valid attestation or registration', async () => {
    await expect(registry.recordEvolution(ID, 1, await signEvolve(attester, ID, 1))).to.be.revertedWithCustomError(registry, 'NotRegistered');
    await registry.connect(creator).register(ID, 'mossling', await signRegister(attester, ID, creator.address, 'mossling'));
    await expect(registry.recordEvolution(ID, 1, await signEvolve(stranger, ID, 1))).to.be.revertedWithCustomError(registry, 'BadSignature');
    await expect(registry.recordEvolution(ID, 1, '0x1234')).to.be.revertedWithCustomError(registry, 'BadSignature');
  });

  it('lets only the creator set the token reference', async () => {
    await registry.connect(creator).register(ID, 'mossling', await signRegister(attester, ID, creator.address, 'mossling'));
    await expect(registry.connect(stranger).setTokenRef(ID, 'solana:abc')).to.be.revertedWithCustomError(registry, 'NotCreator');
    await expect(registry.connect(creator).setTokenRef(ID, 'solana:abc')).to.emit(registry, 'TokenRefSet').withArgs(ID, 'solana:abc');
    expect((await registry.getSpecies(ID)).tokenRef).to.equal('solana:abc');
    await expect(registry.connect(creator).setTokenRef(ID, 'x'.repeat(129))).to.be.revertedWithCustomError(registry, 'BadInput');
  });

  it('lets only the owner rotate the attester, and old signatures stop working', async () => {
    await expect(registry.connect(stranger).setAttester(stranger.address)).to.be.revertedWithCustomError(registry, 'NotOwner');
    const sig = await signRegister(attester, ID, creator.address, 'mossling');
    await registry.connect(owner).setAttester(stranger.address);
    await expect(registry.connect(creator).register(ID, 'mossling', sig)).to.be.revertedWithCustomError(registry, 'BadSignature');
  });
});
