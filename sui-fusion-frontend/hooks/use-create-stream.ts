import http from "@/lib/http";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface StreamPayload {
    streamTitle: string;
    streamDescription: string;
    category: string;
    thumbnail?: File;
}


export const useCreateStream = () => {
  return useMutation({
    mutationFn: async (payload: StreamPayload) => {
      const body = {
        name: payload.streamTitle,
        record: true,
      };

      const { data } = await http.post("/api/create-stream", body);
      return data;
    },
  });
};



export const useStreamHooks = () => {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  const handleCreateStreamMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      playbackId,
      playbackUrl,
      chatId,
      categories,
      streamId,
      streamKey,
      thumbnailUrl
    }: {
      name: string;
      description: string;
      playbackId: string;
      playbackUrl: string;
      streamId: string;
      chatId: string;
      categories: string[];
      streamKey: string;
      thumbnailUrl?: string;
    }) => {
      const tx = new Transaction();

      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::create_stream`,
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_STREAM_REGISTRY_ID!),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(thumbnailUrl || ""),
          tx.pure.string(playbackId),
          tx.pure.string(playbackUrl),
          tx.pure.string(streamId),
          tx.pure.string(streamKey),
          tx.pure.string(chatId),
          tx.pure.vector("string", categories),
        ],
      });

      tx.setGasBudget(100000000); // adjust for heavier stream data
      const result = await mutateAsync({ transaction: tx });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getStreams"] });
      toast.success("Stream created successfully! 🚀");
    },

    onError: (error: any) => {
      console.error("Error creating stream", error);
      toast.error("Failed to create stream. Check console for details.");
    },
  });

  
  const handleEndStreamMutation = useMutation({
    mutationFn: async ({
      streamId,
    }: {
      streamId: string;
    }) => {
      const tx = new Transaction();

      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::end_stream`,
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_STREAM_REGISTRY_ID!),
          tx.pure.string(streamId),
        ],  
      });

      tx.setGasBudget(100000000); // adjust for heavier stream data
      const result = await mutateAsync({ transaction: tx });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getStreams"] });
      toast.success("Stream ended successfully! 🚀");
    },

    onError: (error: any) => {
      console.error("Error ending stream", error);
      toast.error("Failed to end stream. Check console for details.");
    },
  });

  return {handleCreateStreamMutation, handleEndStreamMutation};
};

