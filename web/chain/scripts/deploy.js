const hre = require('hardhat');

// Usage: npm run deploy:testnet   (needs DEPLOYER_PRIVATE_KEY and ATTESTER_ADDRESS in chain/.env)
async function main() {
  const attester = process.env.ATTESTER_ADDRESS;
  if (!attester || !hre.ethers.isAddress(attester)) throw new Error('Set ATTESTER_ADDRESS in chain/.env (the public address of the app\'s signing key).');
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error('Set DEPLOYER_PRIVATE_KEY in chain/.env.');
  const net = await hre.ethers.provider.getNetwork();
  console.log(`Deploying SpeciesRegistry to chain ${net.chainId} from ${deployer.address}`);
  const registry = await hre.ethers.deployContract('SpeciesRegistry', [attester]);
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  console.log(`\nDeployed at ${address}`);
  console.log('\nAdd to web/.env.local:');
  console.log(`NEXT_PUBLIC_CHAIN=${net.chainId === 4663n ? 'mainnet' : 'testnet'}`);
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${address}`);
}

main().catch((e) => { console.error(e.message ?? e); process.exitCode = 1; });
