require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-chai-matchers');
require('dotenv').config();

// The deployer key is read from chain/.env at run time and never committed (see .env.example).
const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: { version: '0.8.24', settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris' } },
  networks: {
    robinhoodTestnet: { url: process.env.RH_TESTNET_RPC_URL || 'https://rpc.testnet.chain.robinhood.com', chainId: 46630, accounts },
    robinhood: { url: process.env.RH_MAINNET_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com', chainId: 4663, accounts }
  }
};
