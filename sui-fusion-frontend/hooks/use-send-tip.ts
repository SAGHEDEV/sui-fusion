import { useMutation } from "@tanstack/react-query";
import {
    useCurrentAccount,
    useSuiClient,
    useWallets,
    useSignTransaction,
    useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";
import { isEnokiWallet } from "@mysten/enoki";
import { toBase64 } from "@mysten/sui/utils";

const STREAM_PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
const STREAM_REGISTRY_ID = process.env.NEXT_PUBLIC_STREAM_REGISTRY_ID!;
const TIP_POOL_ID = process.env.NEXT_PUBLIC_TIP_POOL_ID!;

interface SendTipParams {
    streamId: string;
    amount: number;
}

export function useSendTip() {
    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();
    const wallets = useWallets();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const isUsingZkLogin = wallets.some(
        (w) =>
            isEnokiWallet(w) &&
            w.accounts.some((acc) => acc.address === currentAccount?.address)
    );

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

            if (isUsingZkLogin) {
                // SPONSORED TRANSACTION FLOW (gas is sponsored, but tip comes from user)
                tx.setSender(currentAccount!.address);

                const transactionKindBytes = await tx.build({
                    client: suiClient,
                    onlyTransactionKind: true,
                });

                // Sponsor transaction (sponsor pays gas, user pays tip amount)
                const sponsorResponse = await fetch("/api/sponsor-transaction", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transactionKindBytes: toBase64(transactionKindBytes),
                        sender: currentAccount!.address,
                        network: "testnet",
                    }),
                });

                if (!sponsorResponse.ok) {
                    const error = await sponsorResponse.json();
                    throw new Error(error.error || "Failed to sponsor transaction");
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
                const executeResponse = await fetch(
                    "/api/execute-sponsored-transaction",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ digest, signature }),
                    }
                );

                if (!executeResponse.ok) {
                    const error = await executeResponse.json();
                    throw new Error(error.error || "Failed to execute transaction");
                }

                const { result } = await executeResponse.json();
                await suiClient.waitForTransaction({ digest: result.digest });
                return result;
            } else {
                // REGULAR WALLET FLOW - user pays everything
                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                await suiClient.waitForTransaction({ digest: result.digest });
                return result;
            }
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
            
            // Better error messages
            let errorMessage = "Failed to send tip";
            if (error.message?.includes("No valid gas coins")) {
                errorMessage = "You need SUI in your wallet to send tips. Please fund your account first.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        },
    });
}