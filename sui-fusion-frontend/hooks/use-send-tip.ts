import { useMutation } from "@tanstack/react-query";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";

const STREAM_PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
const STREAM_REGISTRY_ID = process.env.NEXT_PUBLIC_STREAM_REGISTRY_ID!;
const TIP_POOL_ID = process.env.NEXT_PUBLIC_TIP_POOL_ID!;

interface SendTipParams {
    streamId: string;
    amount: number;
}

export function useSendTip() {
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    return useMutation({
        mutationFn: async ({ streamId, amount }: SendTipParams) => {
            const tx = new Transaction();

            // Split off a coin of the tip amount
            const [tipCoin] = tx.splitCoins(tx.gas, [
                tx.pure.u64(amount * 1_000_000_000),
            ]);

            // Call your Move function
            tx.moveCall({
                target: `${STREAM_PACKAGE_ID}::suifusion_contract::send_tip`,
                arguments: [
                    tx.object(STREAM_REGISTRY_ID),
                    tx.object(TIP_POOL_ID),
                    tx.pure.string(streamId),
                    tipCoin,
                ],
            });

            // Sign & execute
            const result = await signAndExecuteTransaction({
                transaction: tx,
            });

            console.log("Transaction Result:", result);
            return result;
        },
        onSuccess: (data, variables) => {
            toast.success(`Successfully tipped ${variables.amount} SUI! 🎉`, {
                style: {
                    background: "rgba(0, 200, 100, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 255, 120, 0.25)",
                    color: "#00ff88",
                },
            });
        },
        onError: (error: any) => {
            console.error("Tip transaction failed:", error);
            toast.error(error.message || "Failed to send tip");
        },
    });
}