# SuiFusion Smart Contract Integration

This document outlines the integration of the SuiFusion smart contract with the frontend application.

## Smart Contract Overview

The SuiFusion smart contract provides the following core functionalities:

1. **Profile Management**: Create and manage user profiles
2. **Stream Management**: Create and manage live streams
3. **Tipping System**: Allow viewers to tip streamers

## Package Information

- **Package ID**: `0x9472526d3f11c96362e60748def454e3bfa4c253401edf0cb31c58f1e0485eaa`
- **Network**: Deployed on Testnet (same package ID for all networks in this implementation)

## Integration Files

### 1. Constants ([lib/constant.ts](file:///c:/Users/DELL%20USER/Desktop/sui-fusion/sui-fusion-frontend/lib/constant.ts))

Updated with the actual deployed package ID for all networks.

### 2. Smart Contract Hook ([hooks/useSuiFusionContract.ts](file:///c:/Users/DELL%20USER/Desktop/sui-fusion/sui-fusion-frontend/hooks/useSuiFusionContract.ts))

Custom hook that provides functions to interact with the smart contract:

- `useCreateProfile`: Create a user profile on-chain
- `useCreateStream`: Create a stream on-chain
- `useSendTip`: Send a tip to a streamer
- `useGetProfile`: Fetch profile data (placeholder implementation)
- `useGetStream`: Fetch stream data (placeholder implementation)

### 3. Utility Functions ([lib/utils.ts](file:///c:/Users/DELL%20USER/Desktop/sui-fusion/sui-fusion-frontend/lib/utils.ts))

Helper functions for converting between strings and vector<u8> types used in Sui Move:

- `stringToVector`: Convert string to vector<u8>
- `vectorToString`: Convert vector<u8> to string
- `stringArrayToVectorArray`: Convert array of strings to vector<vector<u8>>
- `vectorArrayToStringArray`: Convert vector<vector<u8>> to array of strings

### 4. Updated Components

#### Create Stream Hook ([hooks/use-create-stream.ts](file:///c:/Users/DELL%20USER/Desktop/sui-fusion/sui-fusion-frontend/hooks/use-create-stream.ts))

Updated to create streams both on Livepeer and on-chain using the smart contract.

#### Create Fusion Account Modal ([components/create-fusion-account-modal.tsx](file:///c:/Users/DELL%20USER/Desktop/sui-fusion/sui-fusion-frontend/components/create-fusion-account-modal.tsx))

Updated to create user profiles on-chain using the smart contract.

#### Watch Stream Page ([app/(protected)/watch/[playbackId]/page.tsx](file:///c:/Users/DELL%20USER/Desktop/sui-fusion/sui-fusion-frontend/app/(protected)/watch/%5BplaybackId%5D/page.tsx))

Added tip functionality that allows viewers to send tips to streamers using the smart contract.

## Function Implementations

### Profile Creation

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::profile::create_profile`,
  arguments: [
    tx.pure.address(account.address),
    tx.pure.vector("u8", stringToVector(name)),
    tx.pure.vector("u8", stringToVector(avatarUrl)),
  ],
});
```

### Stream Creation

```typescript
const tx = new Transaction();
const categoryVectors = stringArrayToVectorArray(categories);

tx.moveCall({
  target: `${packageId}::stream::create_stream`,
  arguments: [
    tx.pure.address(account.address),
    tx.pure.vector("u8", stringToVector(name)),
    tx.pure.vector("u8", stringToVector(description)),
    tx.pure.vector("u8", stringToVector(playbackId)),
    tx.pure.vector("u8", stringToVector(playbackUrl)),
    tx.pure.vector("u8", stringToVector(chatId)),
    tx.pure.vector("vector<u8>", categoryVectors),
  ],
});
```

### Sending Tips

```typescript
const tx = new Transaction();
const categoryVectors = stringArrayToVectorArray(categories);

tx.moveCall({
  target: `${packageId}::tip::send_tip`,
  arguments: [
    tx.pure.address(account.address),
    tx.pure.u64(streamId),
    tx.pure.u128(BigInt(amount)),
    tx.pure.vector("vector<u8>", categoryVectors),
  ],
});
```

## Future Improvements

1. Implement full querying functionality for profiles and streams
2. Add error handling for specific smart contract errors
3. Implement event listening for real-time updates
4. Add transaction history tracking
5. Implement profile and stream editing functionality