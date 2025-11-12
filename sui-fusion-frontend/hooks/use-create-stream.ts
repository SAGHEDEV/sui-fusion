import http from "@/lib/http";
import {
  useCurrentAccount,
  useSuiClient,
  useWallets,
  useSignTransaction,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isEnokiWallet } from "@mysten/enoki";
import { toB64 } from "@mysten/sui/utils";

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
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const wallets = useWallets();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const isUsingZkLogin = wallets.some(
    (w) =>
      isEnokiWallet(w) &&
      w.accounts.some((acc) => acc.address === currentAccount?.address)
  );

  const sponsorAndExecute = async (tx: Transaction) => {
    tx.setSender(currentAccount!.address);

    const transactionKindBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    // Sponsor transaction
    const sponsorResponse = await fetch("/api/sponsor-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionKindBytes: toB64(transactionKindBytes),
        sender: currentAccount!.address,
        network: "testnet",
      }),
    });

    if (!sponsorResponse.ok) {
      throw new Error("Failed to sponsor transaction");
    }

    const { digest, bytes } = await sponsorResponse.json();

    // Sign transaction
    const { signature } = await signTransaction({
      transaction: Transaction.from(bytes),
    });

    if (!signature) {
      throw new Error("Failed to sign transaction");
    }

    // Execute transaction
    const executeResponse = await fetch("/api/execute-sponsored-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digest, signature }),
    });

    if (!executeResponse.ok) {
      throw new Error("Failed to execute transaction");
    }

    const { result } = await executeResponse.json();
    await suiClient.waitForTransaction({ digest: result.digest });
    return result;
  };

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
      thumbnailUrl,
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

      if (isUsingZkLogin) {
        return await sponsorAndExecute(tx);
      } else {
        // ============ REGULAR WALLET FLOW ============
        tx.setGasBudget(100000000);
        const result = await signAndExecuteTransaction({ transaction: tx });
        await suiClient.waitForTransaction({ digest: result.digest });
        return result;
      }
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
    mutationFn: async ({ streamId }: { streamId: string }) => {
      const tx = new Transaction();

      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::end_stream`,
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_STREAM_REGISTRY_ID!),
          tx.pure.string(streamId),
        ],
      });

      if (isUsingZkLogin) {
        return await sponsorAndExecute(tx);
      } else {
        // ============ REGULAR WALLET FLOW ============
        tx.setGasBudget(100000000);
        const result = await signAndExecuteTransaction({ transaction: tx });
        await suiClient.waitForTransaction({ digest: result.digest });
        return result;
      }
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

  return { handleCreateStreamMutation, handleEndStreamMutation };
};