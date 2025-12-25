# Migration Guide: Stellar to Movement M1

This document outlines the changes made during the Stellar to Movement M1 migration and the next steps for completing the integration.

## What Was Cleaned Up

### 1. Dependencies Removed
- `@creit.tech/stellar-wallets-kit` - Stellar wallet connection
- `@stellar/design-system` - Stellar UI components
- `@stellar/stellar-sdk` - Stellar blockchain SDK
- `@stellar/stellar-xdr-json` - XDR JSON utilities
- `vite-plugin-wasm` - WASM support (for Soroban)
- `vite-plugin-node-polyfills` - Node polyfills (buffer for Stellar crypto)

### 2. Files Deleted
- `src/util/wallet.ts` - Stellar wallet utilities
- `src/util/friendbot.ts` - Stellar testnet faucet
- `src/@types/stellar-generated.ts` - Auto-generated Stellar contract types
- `src/contracts/` - Contract utilities
- `contracts/` - Soroban smart contracts (Rust)
- `src/debug/` - 84 debugging tool files
- `src/components/WalletButton.tsx` - Stellar wallet UI
- `src/components/ConnectAccount.tsx` - Stellar connection UI
- `src/components/FundAccountButton.tsx` - Faucet button
- `src/components/NetworkPill.tsx` - Network indicator
- `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml` - Rust configuration
- `.cargo/` and `packages/` directories

### 3. Files Updated
- `package.json` - Removed Stellar dependencies and scripts
- `.env.example` - Updated with Movement M1 configuration
- `vite.config.ts` - Cleaned Stellar-specific plugins
- `README.md` - Updated documentation for Movement M1
- `src/providers/WalletProvider.tsx` - Stubbed for Movement
- `src/hooks/useSampledContract.ts` - Stubbed for Movement
- `src/hooks/useWallet.ts` - Already generic, no changes needed

## Hooks Preserved

These hooks maintain the same interface and are ready for Movement integration:

### `useWallet()`
Returns:
- `address?: string` - Connected wallet address
- `network?: string` - Current network
- `networkPassphrase?: string` - Network identifier
- `isPending: boolean` - Loading state
- `signTransaction?: (tx: unknown) => Promise<unknown>` - Transaction signing

### `useSampledContract()`
Provides these hooks for contract interaction:
- `useUploadSample()` - Upload a music sample
- `useGetUserSamples()` - Get user's uploaded samples
- `useGetAllSamples()` - Get all marketplace samples
- `useGetSample(sample_id)` - Get single sample details
- `usePurchaseSample()` - Purchase a sample
- `useHasPurchased(sampleId)` - Check if user purchased a sample
- `useGetUserPurchases()` - Get user's purchase history
- `useGetStats()` - Get platform statistics
- `useGetUserEarnings()` - Get user's earnings balance
- `useWithdrawEarnings()` - Withdraw earnings

All hooks are stubbed with TODO comments indicating where Movement SDK calls should be implemented.

## Next Steps for Movement M1 Integration

### 1. Install Movement Dependencies

```bash
# Add Movement SDK (replace with actual package names when available)
npm install @movement-labs/sdk @movement-labs/wallet-adapter
```

### 2. Write Move Smart Contract

Create your smart contract in Move with these functions:
- `upload_sample(seller, title, description, price, ipfs_link, genre, bpm)`
- `get_sample(sample_id)`
- `get_user_samples(user_address)`
- `get_all_samples()`
- `purchase_sample(buyer, sample_id)`
- `has_purchased(buyer, sample_id)`
- `get_user_purchases(buyer)`
- `withdraw_earnings(user)`
- `get_earnings(user)`
- `get_stats()`

### 3. Deploy Contract to Movement M1

```bash
# Deploy to Movement testnet (commands may vary)
movement move publish --network testnet
movement move run --function upload_sample
```

### 4. Implement Wallet Integration

Update `src/providers/WalletProvider.tsx`:
- Import Movement wallet adapter
- Implement `updateCurrentWalletState()` to connect to Movement wallet
- Implement `signTransaction()` for Movement transactions

Search for `// TODO: Implement Movement wallet` in the file.

### 5. Implement Contract Hooks

Update `src/hooks/useSampledContract.ts`:
- Import Movement SDK client
- Replace all `// TODO: Implement Movement contract` sections
- Connect hooks to your deployed contract address

Each hook has placeholder code showing the structure needed.

### 6. Update Environment Variables

Update `.env` with your actual values:
```env
PUBLIC_MOVEMENT_NETWORK="TESTNET"
PUBLIC_MOVEMENT_RPC_URL="https://your-movement-rpc-url"
PUBLIC_MOVEMENT_CONTRACT_ADDRESS="0x..."
```

### 7. UI Components to Update

These components reference Stellar and need updates:
- Components using `useWallet()` - Should work once WalletProvider is updated
- Components using `useSampledContract()` hooks - Should work once hooks are updated
- Any components with hardcoded Stellar references

Search codebase for:
- `stellar` (case-insensitive)
- `soroban`
- `xlm`
- `stroops`

### 8. Update Type Definitions

Check `src/@types/` for any Stellar-specific types that need updating.

## Testing Checklist

Once Movement integration is complete, test:
- [ ] Wallet connection and disconnection
- [ ] Network switching (if applicable)
- [ ] Upload sample functionality
- [ ] Browse samples (all + user-specific)
- [ ] Purchase sample flow
- [ ] Earnings tracking
- [ ] Withdrawal functionality
- [ ] Error handling for all operations

## Resources

- [Movement Labs Documentation](https://docs.movementlabs.xyz/)
- [Move Language Documentation](https://move-language.github.io/move/)
- [Movement M1 Testnet](https://testnet.movementnetwork.xyz/)

## Notes

- All Stellar code has been removed
- Hook interfaces are preserved for easy migration
- The project structure remains the same
- UI components are ready to work with Movement once hooks are implemented
- Error handling and loading states are already in place
