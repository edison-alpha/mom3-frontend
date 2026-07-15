# Particle gas sponsorship

mom3 uses Particle Universal Accounts for chain abstraction. Universal Account
gas abstraction can front native gas and settle its cost from the user's
Universal Balance. This is different from developer-funded gas sponsorship.

## Runtime behavior

- Send, convert, supply, and withdraw use the `gasless` fee quote when Particle
  actually returns one for that transaction.
- The signing root is rebuilt from the sponsored UserOperations before the
  user's owner wallet signs it.
- `NEXT_PUBLIC_PARTICLE_REQUIRE_GAS_SPONSORSHIP=false` allows Particle's normal
  Universal Account fee quote, with network gas settled from Universal Balance.
- Set the variable to `true` only after the active execution path is verified
  to return a sponsored `gasless` quote. Strict mode blocks submission when that
  quote is unavailable.

Service, liquidity-provider, bridge, or settlement fees are separate from
network gas and can still apply. The transaction review shows those fees.

## Mainnet setup

1. Open the Particle Dashboard for the project matching
   `NEXT_PUBLIC_PARTICLE_PROJECT_ID`, `NEXT_PUBLIC_PARTICLE_CLIENT_KEY`, and
   `NEXT_PUBLIC_PARTICLE_APP_ID`.
2. Open **Paymaster**.
3. Deposit USDT on Ethereum or BNB Chain.
4. Keep the Paymaster balance funded. One balance sponsors supported EVM chains.
5. Optionally configure a contract-method allowlist or a signed
   `before_paymaster_sign` webhook to limit which transactions mom3 sponsors.

Particle's AA Paymaster automatically sponsors testnet transactions. Mainnet
developer-funded sponsorship requires sufficient project Paymaster balance.
The Universal Account SDK may still return only its normal fee quote; funding
the AA Paymaster does not by itself prove that a Universal Account transaction
will include a `gasless` quote.

Official references:

- https://developers.particle.network/aa/guides/paymaster
- https://developers.particle.network/aa/architecture/omni-paymaster
- https://developers.particle.network/aa/sdks/desktop/web
