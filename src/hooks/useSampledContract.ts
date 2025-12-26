/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unused-vars */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ISample, IUploadSamplePayload } from "../@types/sample"
import { toast } from "sonner"
import { IoCloseCircleSharp } from "react-icons/io5"
import { AptosClient, AptosAccount, Types } from "aptos"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
// const client = new AptosClient("https://testnet.movementnetwork.xyz/v1");
const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://testnet.movementnetwork.xyz/v1',
  faucet: 'https://faucet.testnet.movementnetwork.xyz/',
  indexer: 'https://indexer.testnet.movementnetwork.xyz/v1/graphql',
})
const aptos = new Aptos(config)

const CONTRACT_ADDRESS = "0x462d050a0ff74fd8bb7afa8a70c3b63eedd7313cf5cfc1e47e285c7a3428a974"

// TODO: Import Movement SDK when available
// import { MovementClient } from "@movement-labs/sdk";

export interface IPurchaseSamplePayload {
  buyer: string
  sample_id: number
}

export interface IPurchaseSampleResponse {
  // ipfs_link: string
  transactionHash: string
  sample_id: string
}

/** Convert octas (smallest unit) to MOVE tokens (1 MOVE = 100,000,000 octas) */
export const octasToMove = (octas: bigint | string | number): number => {
  const amount = typeof octas === "bigint" ? octas : BigInt(octas || 0)
  return Number(amount) / 100_000_000
}


export const useUploadSample = () => {
  const { account, signAndSubmitTransaction } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: IUploadSamplePayload) => {
      if (!account) {
        throw new Error("Wallet not connected")
      }
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::upload_sample`,
          functionArguments: [
            request.price,
            request.ipfs_link,
            request.title,
            request.bpm,
            request.genre,
            request.cover_image
          ],
        }
      })
      const transactionRes = await aptos.waitForTransaction({ transactionHash: response.hash })
      return transactionRes
    },

    onSuccess(data) {
      console.log(data)
      queryClient.invalidateQueries({
        queryKey: ["user-samples", account?.address?.toString()],
      })
      queryClient.invalidateQueries({
        queryKey: ["all-samples"],
      })
    },
    onError: (error: string) => {
      console.log(error)
      toast.error("Error", {
        className: "!bg-red-500 *:!text-white !border-0",
        description: "Failed to upload sample",
        duration: 5000,
        icon: IoCloseCircleSharp({ size: 24 }),
      })
    },
  })
}

/**
 * Hook to get samples uploaded by the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserSamples = () => {
  const { account } = useWallet()

  return useQuery({
    queryFn: async () => {
      if (!account) return []

      const samples = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::get_user_samples_full`,
          functionArguments: [account?.address?.toString()],
        }
      })

      console.log("Get user samples for:", account)
      return samples?.[0] as ISample[] || []
    },
    queryKey: ["user-samples", account],
    enabled: !!account,
  })
}

/**
 * Hook to get all samples from the marketplace
 * TODO: Implement with Movement SDK
 */
export const useGetAllSamples = () => {
  const { account } = useWallet()

  return useQuery({
    queryFn: async () => {
      const samples = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::get_all_samples`,
          functionArguments: [],
        }
      })

      console.log("Get all samples")
      return samples?.[0] as ISample[] || []
    },
    queryKey: ["all-samples"],
  })
}

/**
 * Hook to get a specific sample by ID
 * TODO: Implement with Movement SDK
 */
export const useGetSample = (sample_id: string) => {
  const { account } = useWallet()

  return useQuery({
    queryFn: async () => {
      const sample = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::get_sample`,
          functionArguments: [sample_id],
        }
      })

      console.log("Get sample:", sample_id)
      return sample?.[0] as ISample
    },
    queryKey: ["single-sample", sample_id],
    enabled: !!sample_id,
  })
}

/**
 * Hook to purchase a sample
 * TODO: Implement with Movement SDK
 */
export const usePurchaseSample = () => {
  const { account, signAndSubmitTransaction } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sampleId: string): Promise<IPurchaseSampleResponse> => {
      if (!account) {
        throw new Error("Please connect your wallet first")
      }

      const payload: IPurchaseSamplePayload = {
        buyer: account?.address.toString(),
        sample_id: Number(sampleId),
      }

      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::purchase_sample`,
          functionArguments: [
            payload.sample_id,
          ],
        }
      })
      const transactionRes = await aptos.waitForTransaction({ transactionHash: response.hash })
      return {
        transactionHash: transactionRes.hash,
        sample_id: sampleId
      }

    },
    onSuccess: (data) => {
      console.log("Purchase successful:", data)

      queryClient.invalidateQueries({ queryKey: ["user-purchases", account?.address?.toString()] })
      queryClient.invalidateQueries({ queryKey: ["user-earnings", account?.address?.toString()] })
      queryClient.invalidateQueries({
        queryKey: ["single-sample", data.sample_id],
      })
    },
    onError: (error) => {
      console.log(error)
      toast.error("Error", {
        className: "!bg-red-500 *:!text-white !border-0",
        description: "Failed to purchase sample",
        duration: 5000,
        icon: IoCloseCircleSharp({ size: 24 }),
      })
    },
  })
}

/**
 * Hook to check if the current user has purchased a sample
 * TODO: Implement with Movement SDK
 */
export const useHasPurchased = (sampleId: string) => {
  const { account } = useWallet()

  return useQuery({
    queryKey: ["hasPurchased", account?.address.toString(), sampleId],
    queryFn: async () => {
      if (!account?.address || !sampleId) return false

      const hasPurchased = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::has_purchased`,
          functionArguments: [account?.address.toString(), sampleId],
        }
      })

      return hasPurchased?.[0] as boolean


    },
    enabled: !!account?.address.toString() && !!sampleId,
  })
}

/**
 * Hook to get all purchases made by the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserPurchases = () => {
  const { account } = useWallet()

  return useQuery({
    queryFn: async () => {
      if (!account?.address.toString()) return []
      const samples = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::get_user_purchases_full`,
          functionArguments: [account?.address?.toString()],
        }
      })

      console.log("Get user samples for:", account)
      return samples?.[0] as ISample[] || []

    },
    queryKey: ["user-purchases", account?.address.toString()],
    enabled: !!account?.address.toString(),
  })
}

/**
 * Hook to get platform statistics
 * TODO: Implement with Movement SDK
 */
export const useGetStats = () => {
  const { account } = useWallet()

  return useQuery({
    queryFn: async () => {
      // TODO: Implement Movement contract query
      // const client = new MovementClient({ network: "testnet" });
      // const result = await client.contracts.sampled.get_stats();
      // return result;

      console.log("Get stats")
      return null
    },
    queryKey: ["stats"],
  })
}

/**
 * Hook to get earnings for the current user
 * TODO: Implement with Movement SDK
 */
export const useGetUserEarnings = () => {
  const { account } = useWallet()

  return useQuery({
    queryFn: async () => {
      if (!account?.address.toString()) return 0

      const earnings = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::get_earnings`,
          functionArguments: [account?.address?.toString()],
        }
      })

      console.log("Get user earnings for:", account)
      return earnings?.[0] as number || 0
    },
    queryKey: ["user-earnings", account?.address.toString()],
    enabled: !!account?.address.toString(),
  })
}

/**
 * Hook to withdraw earnings
 * TODO: Implement with Movement SDK
 */
export const useWithdrawEarnings = () => {
  const { account, signAndSubmitTransaction } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!account?.address.toString()) {
        throw new Error("Please connect your wallet first")
      }

      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${CONTRACT_ADDRESS}::sampled_marketplace::withdraw_earnings`,
          functionArguments: [
          ],
        }
      })
      const transactionRes = await aptos.waitForTransaction({ transactionHash: response.hash })
      return transactionRes


    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-earnings", account?.address.toString()] })
    },
    onError: () => {
      toast.error("Error", {
        className: "!bg-red-500 *:!text-white !border-0",
        description: "Failed to withdraw earnings",
        duration: 5000,
        icon: IoCloseCircleSharp({ size: 24 }),
      })
    },
  })
}
