# Species.family on-chain

One contract, `SpeciesRegistry`, on **Robinhood Chain** (an Arbitrum Layer 2, gas paid in ETH).

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | 46630 | 4663 |
| RPC | https://rpc.testnet.chain.robinhood.com | https://rpc.mainnet.chain.robinhood.com |
| Explorer | https://explorer.testnet.chain.robinhood.com | https://robinhoodchain.blockscout.com |

## What is on-chain
- **Registration:** which wallet registered a species, and when.
- **Evolution:** each stage (1 to 3) a species reaches, one at a time, permanently.
- **Token pointer (optional):** the address of a token launched on Bags (Solana). A pointer only.

Follows, quests, XP and moderation stay in Supabase. The contract holds no funds and no tokens.

## How it stays honest
The web server holds an *attester* key. It signs a short approval only when the database agrees
(the caller created the species; the species really reached that stage). The user's wallet sends the
transaction with that approval, and the contract rejects anything not signed by the attester.

## Deploy (testnet first)
1. Create two fresh wallets: a **deployer** and an **attester**. Do not reuse a personal wallet.
2. Get testnet ETH for the deployer.
3. `cp .env.example .env`, then set `DEPLOYER_PRIVATE_KEY` and `ATTESTER_ADDRESS` (the attester's public address).
4. `npm install && npm test && npm run deploy:testnet`
5. Put the printed `NEXT_PUBLIC_CHAIN` and `NEXT_PUBLIC_REGISTRY_ADDRESS` in `web/.env.local`,
   add `ATTESTER_PRIVATE_KEY=<attester private key>`, and restart the web app.

Mainnet is the same with `npm run deploy:mainnet` and real ETH. Get the contract reviewed first.

## If the attester key leaks
Call `setAttester(newAddress)` from the owner (deployer) wallet. Old approvals stop working immediately.
