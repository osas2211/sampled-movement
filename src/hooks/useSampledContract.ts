/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unused-vars */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "./useWallet";
import { IUploadSamplePayload } from "../@types/sample";
import { toast } from "sonner";
import { IoCloseCircleSharp } from "react-icons/io5";

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
  const { address, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IUploadSamplePayload) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      // TODO: Implement Movement contract call
      // Example:
      // const client = new MovementClient({ network: "testnet" });
      // const tx = await client.contracts.sampled.upload_sample(payload);
      // const result = await signTransaction(tx);
      // return result;

      console.log("Upload sample payload:", payload);
      throw new Error("Movement contract integration not yet implemented");
    },
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["user-samples", data?.seller],
      });
      queryClient.invalidateQueries({
        queryKey: ["all-samples"],
      });
    },
    onError: () => {
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
  const { address } = useWallet();

  return useQuery({
    queryFn: async () => {
      if (!address) return [];

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_user_samples({ user_address: address });
      // return result;

      console.log("Get user samples for:", address);
      return [];
    },
    queryKey: ["user-samples", address],
    enabled: !!address,
  });
};

/**
 * Hook to get all samples from the marketplace
 * TODO: Implement with Movement SDK
 */
export const useGetAllSamples = () => {
  const { address } = useWallet();

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
  const { address } = useWallet();

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
  const { address, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sampleId: number): Promise<IPurchaseSampleResponse> => {
      if (!address) {
        throw new Error("Please connect your wallet first");
      }

      const payload: IPurchaseSamplePayload = {
        buyer: address,
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

      queryClient.invalidateQueries({ queryKey: ["user-purchases", address] });
      queryClient.invalidateQueries({ queryKey: ["user-earnings", address] });
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
  const { address } = useWallet();

  return useQuery({
    queryKey: ["hasPurchased", address, sampleId],
    queryFn: async () => {
      if (!address || !sampleId) return false;

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.has_purchased({ buyer: address, sample_id: sampleId });
      // return result;

      console.log("Check has purchased:", address, sampleId);
      return false;
    },
    enabled: !!address && !!sampleId,
  });
};

/**
 * Hook to get all purchases made by the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserPurchases = () => {
  const { address } = useWallet();

  return useQuery({
    queryFn: async () => {
      if (!address) return [];

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_user_purchases({ buyer: address });
      // return result;

      console.log("Get user purchases:", address);
      return [];
    },
    queryKey: ["user-purchases", address],
    enabled: !!address,
  });
};

/**
 * Hook to get platform statistics
 * TODO: Implement with Movement SDK
 */
export const useGetStats = () => {
  const { address } = useWallet();

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
  const { address } = useWallet();

  return useQuery({
    queryFn: async () => {
      if (!address) return 0;

      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_earnings({ user: address });
      // return result;

      console.log("Get user earnings:", address);
      return 0;
    },
    queryKey: ["user-earnings", address],
    enabled: !!address,
  });
};

/**
 * Hook to withdraw earnings
 * TODO: Implement with Movement SDK
 */
export const useWithdrawEarnings = () => {
  const { address, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_user: string) => {
      if (!address) {
        throw new Error("Please connect your wallet first");
      }

      // TODO: Implement Movement contract call
      // const client = new MovementClient({ network: "testnet" });
      // const tx = await client.contracts.sampled.withdraw_earnings({ user: address });
      // const result = await signTransaction(tx);
      // return { transactionHash: result.hash };

      console.log("Withdraw earnings for:", address);
      throw new Error("Movement contract integration not yet implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-earnings", address] });
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
