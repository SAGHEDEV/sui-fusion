import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/lib/networkConfig";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";
import { stringToVector, stringArrayToVectorArray } from "@/lib/utils";

export const useCreateProfile = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const packageId = useNetworkVariable("PackageId");

  return useMutation({
    mutationFn: async ({ name, avatarUrl }: { name: string; avatarUrl: string }) => {
      if (!account) throw new Error("Wallet not connected");

      const tx = new Transaction();
      
      // Create profile using the smart contract
      tx.moveCall({
        target: `${packageId}::profile::create_profile`,
        arguments: [
          tx.pure.address(account.address),
          tx.pure.vector("u8", stringToVector(name)),
          tx.pure.vector("u8", stringToVector(avatarUrl)),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile created successfully!");
    },
    onError: (error) => {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile: " + error.message);
    },
  });
};

export const useCreateStream = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const packageId = useNetworkVariable("PackageId");

  return useMutation({
    mutationFn: async ({
      name,
      description,
      playbackId,
      playbackUrl,
      chatId,
      categories,
    }: {
      name: string;
      description: string;
      playbackId: string;
      playbackUrl: string;
      chatId: string;
      categories: string[];
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const tx = new Transaction();
      
      // Convert categories to vector<vector<u8>>
      const categoryVectors = stringArrayToVectorArray(categories);

      // Create stream using the smart contract
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

      const result = await signAndExecute({ transaction: tx });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream created successfully!");
    },
    onError: (error) => {
      console.error("Error creating stream:", error);
      toast.error("Failed to create stream: " + error.message);
    },
  });
};

export const useSendTip = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const packageId = useNetworkVariable("PackageId");

  return useMutation({
    mutationFn: async ({
      streamId,
      amount,
      categories,
    }: {
      streamId: number;
      amount: number;
      categories: string[];
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const tx = new Transaction();
      
      // Convert categories to vector<vector<u8>>
      const categoryVectors = stringArrayToVectorArray(categories);

      // Send tip using the smart contract
      tx.moveCall({
        target: `${packageId}::tip::send_tip`,
        arguments: [
          tx.pure.address(account.address),
          tx.pure.u64(streamId),
          tx.pure.u128(BigInt(amount)),
          tx.pure.vector("vector<u8>", categoryVectors),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tips"] });
      toast.success("Tip sent successfully!");
    },
    onError: (error) => {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip: " + error.message);
    },
  });
};

// Query hooks for fetching data
export const useGetProfile = (address: string) => {
  // This would typically fetch profile data from the blockchain
  // For now, we'll return a placeholder
  return useQuery({
    queryKey: ["profile", address],
    queryFn: async () => {
      // In a real implementation, you would query the blockchain for the profile object
      return null;
    },
    enabled: !!address,
  });
};

export const useGetStream = (streamId: number) => {
  // This would typically fetch stream data from the blockchain
  // For now, we'll return a placeholder
  return useQuery({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      // In a real implementation, you would query the blockchain for the stream object
      return null;
    },
    enabled: !!streamId,
  });
};