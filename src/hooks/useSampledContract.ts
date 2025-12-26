/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unused-vars */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IUploadSamplePayload } from "../@types/sample";
import { toast } from "sonner";
import { IoCloseCircleSharp } from "react-icons/io5";
import { AptosClient, AptosAccount, Types } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
// const client = new AptosClient("https://testnet.movementnetwork.xyz/v1");
const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://testnet.movementnetwork.xyz/v1',
  faucet: 'https://faucet.testnet.movementnetwork.xyz/',
  indexer: 'https://indexer.testnet.movementnetwork.xyz/v1/graphql',
})
const aptos = new Aptos(config);

const CONTRACT_ADDRESS = "0x84c5633ea19673377f5448f5c004c45a7b31329e66c1b51c903addb7a405d196"

// TODO: Import Movement SDK when available
// import { MovementClient } from "@movement-labs/sdk";

export interface IPurchaseSamplePayload {
  buyer: string;
  sample_id: number;
}

export interface IPurchaseSampleResponse {
  ipfs_link: string;
  transactionHash: string;
  sample_id: number;
}

// TODO: Replace with Movement token conversion
export const stroopsToXlm = (stroops: bigint | string | number): number => {
  const amount = typeof stroops === "bigint" ? stroops : BigInt(stroops || 0);
  return Number(amount) / 10_000_000;
};

/**
 * Hook to upload a sample to the Movement M1 smart contract
 * TODO: Implement with Movement SDK and smart contract
 */
export const useUploadSample = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: IUploadSamplePayload) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }



const response = await signAndSubmitTransaction({
  sender: account.address,
  data: {
  function: `${CONTRACT_ADDRESS}::sampled_marketplace::upload_sample`,
    functionArguments: [
      // account.address,
    request.price,
    request.ipfs_link,
    request.title,
    request.bpm,
    request.genre
  ],
  }
})
const transactionRes = await aptos.waitForTransaction({transactionHash:response.hash});

// const txn = await client.generateTransaction(account.address.toString(), payload);
// console.log(txn)
// const signedTxn = await client.signTransaction(account as any, txn);
// const transactionRes = await client.submitTransaction(signedTxn);

      // console.log("Upload sample payload:", payload);
      return transactionRes
      throw new Error("Movement contract integration not yet implemented");
    },
    
    onSuccess(data) {
      queryClient.invalidateQueries({
        // queryKey: ["user-samples", data?.seller],
      });
      queryClient.invalidateQueries({
        queryKey: ["all-samples"],
      });
    },
    onError: (error: string) => {
      console.log(error)
      toast.error("Error", {
        className: "!bg-red-500 *:!text-white !border-0",
        description: "Failed to upload sample",
        duration: 5000,
        icon: IoCloseCircleSharp({ size: 24 }),
      });
    },
  });
};

/**
 * Hook to get samples uploaded by the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserSamples = () => {
  const { account } = useWallet();

  return useQuery({
    queryFn: async () => {
      if (!account) return [];

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_user_samples({ user_address: address });
      // return result;

      console.log("Get user samples for:", account);
      return [];
    },
    queryKey: ["user-samples", account],
    enabled: !!account,
  });
};

/**
 * Hook to get all samples from the marketplace
 * TODO: Implement with Movement SDK
 */
export const useGetAllSamples = () => {
  const { account } = useWallet();

  return useQuery({
    queryFn: async () => {
      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_all_samples();
      // return result;

      console.log("Get all samples");
      return [];
    },
    queryKey: ["all-samples"],
  });
};

/**
 * Hook to get a specific sample by ID
 * TODO: Implement with Movement SDK
 */
export const useGetSample = (sample_id: string) => {
  const { account } = useWallet();

  return useQuery({
    queryFn: async () => {
      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_sample({ sample_id: Number(sample_id) });
      // return result;

      console.log("Get sample:", sample_id);
      return null;
    },
    queryKey: ["single-sample", sample_id],
    enabled: !!sample_id,
  });
};

/**
 * Hook to purchase a sample
 * TODO: Implement with Movement SDK
 */
export const usePurchaseSample = () => {
  const { account, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sampleId: number): Promise<IPurchaseSampleResponse> => {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      const payload: IPurchaseSamplePayload = {
        buyer: account?.address.toString(),
        sample_id: sampleId,
      };

      // TODO: Implement Movement contract call
      // const client = new MovementClient({ network: "testnet" });
      // const tx = await client.contracts.sampled.purchase_sample(payload);
      // const result = await signTransaction(tx);
      // return { ipfs_link: result.ipfs_link, transactionHash: result.hash, sample_id: sampleId };

      console.log("Purchase sample:", payload);
      throw new Error("Movement contract integration not yet implemented");
    },
    onSuccess: (data) => {
      console.log("Purchase successful:", data);

      queryClient.invalidateQueries({ queryKey: ["user-purchases", account?.address?.toString()] });
      queryClient.invalidateQueries({ queryKey: ["user-earnings", account?.address?.toString()] });
      queryClient.invalidateQueries({
        queryKey: ["single-sample", data.sample_id],
      });
    },
    onError: () => {
      toast.error("Error", {
        className: "!bg-red-500 *:!text-white !border-0",
        description: "Failed to purchase sample",
        duration: 5000,
        icon: IoCloseCircleSharp({ size: 24 }),
      });
    },
  });
};

/**
 * Hook to check if the current user has purchased a sample
 * TODO: Implement with Movement SDK
 */
export const useHasPurchased = (sampleId: number) => {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["hasPurchased", account?.address.toString(), sampleId],
    queryFn: async () => {
      if (!account?.address || !sampleId) return false;

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.has_purchased({ buyer: address, sample_id: sampleId });
      // return result;

      console.log("Check has purchased:",  account?.address.toString(), sampleId);
      return false;
    },
    enabled: !! account?.address.toString() && !!sampleId,
  });
};

/**
 * Hook to get all purchases made by the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserPurchases = () => {
  const { account } = useWallet();

  return useQuery({
    queryFn: async () => {
      if (! account?.address.toString()) return [];

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_user_purchases({ buyer:  account?.address.toString() });
      // return result;

      console.log("Get user purchases:",  account?.address.toString());
      return [];
    },
    queryKey: ["user-purchases",  account?.address.toString()],
    enabled: !! account?.address.toString(),
  });
};

/**
 * Hook to get platform statistics
 * TODO: Implement with Movement SDK
 */
export const useGetStats = () => {
  const { account } = useWallet();

  return useQuery({
    queryFn: async () => {
      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_stats();
      // return result;

      console.log("Get stats");
      return null;
    },
    queryKey: ["stats"],
  });
};

/**
 * Hook to get earnings for the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserEarnings = () => {
  const { account } = useWallet();

  return useQuery({
    queryFn: async () => {
      if (! account?.address.toString()) return 0;

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_earnings({ user:  account?.address.toString() });
      // return result;

      console.log("Get user earnings:",  account?.address.toString());
      return 0;
    },
    queryKey: ["user-earnings",  account?.address.toString()],
    enabled: !! account?.address.toString(),
  });
};

/**
 * Hook to withdraw earnings
 * TODO: Implement with Movement SDK
 */
export const useWithdrawEarnings = () => {
  const { account, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_user: string) => {
      if (! account?.address.toString()) {
        throw new Error("Please connect your wallet first");
      }

      // TODO: Implement Movement contract call
      // const client = new MovementClient({ network: "testnet" });
      // const tx = await client.contracts.sampled.withdraw_earnings({ user:  account?.address.toString() });
      // const result = await signTransaction(tx);
      // return { transactionHash: result.hash };

      console.log("Withdraw earnings for:",  account?.address.toString());
      throw new Error("Movement contract integration not yet implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-earnings",  account?.address.toString()] });
    },
    onError: () => {
      toast.error("Error", {
        className: "!bg-red-500 *:!text-white !border-0",
        description: "Failed to withdraw earnings",
        duration: 5000,
        icon: IoCloseCircleSharp({ size: 24 }),
      });
    },
  });
};
