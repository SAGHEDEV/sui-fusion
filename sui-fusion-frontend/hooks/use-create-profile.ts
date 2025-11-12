import { useCurrentAccount, useSuiClient, useWallets } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isEnokiWallet } from "@mysten/enoki";
import { toBase64 } from "@mysten/sui/utils";
import { useSignTransaction, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

export const useCreateProfile = () => {
    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();
    const queryClient = useQueryClient();
    const wallets = useWallets();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    // Check if user is using zkLogin
    const isUsingZkLogin = wallets.some(
        (w) =>
            isEnokiWallet(w) &&
            w.accounts.some((acc) => acc.address === currentAccount?.address)
    );

    const handleCreateProfile = useMutation({
        mutationFn: async ({
            name,
            avatarUrl,
        }: {
            name: string;
            avatarUrl: string;
        }) => {
            const tx = new Transaction();

            tx.moveCall({
                target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::create_profile`,
                arguments: [
                    tx.object(process.env.NEXT_PUBLIC_PROFILE_REGISTRY_ID!),
                    tx.pure.string(name),
                    tx.pure.string(avatarUrl),
                ],
            });

            if (isUsingZkLogin) {
                // SPONSORED TRANSACTION FLOW
                tx.setSender(currentAccount!.address);

                // Build transaction kind bytes
                const transactionKindBytes = await tx.build({
                    client: suiClient,
                    onlyTransactionKind: true,
                });

                // Call backend to sponsor transaction
                const sponsorResponse = await fetch("/api/sponsor-transaction", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transactionKindBytes: toBase64(transactionKindBytes),
                        sender: currentAccount!.address,
                        network: "testnet", // or "mainnet"
                    }),
                });

                if (!sponsorResponse.ok) {
                    throw new Error("Failed to sponsor transaction");
                }

                const { digest, bytes } = await sponsorResponse.json();

                // Sign the transaction on client side
                const { signature } = await signTransaction({
                    transaction: Transaction.from(bytes),
                });

                if (!signature) {
                    throw new Error("Failed to sign transaction");
                }

                // Execute sponsored transaction via backend
                const executeResponse = await fetch(
                    "/api/execute-sponsored-transaction",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ digest, signature }),
                    }
                );

                if (!executeResponse.ok) {
                    throw new Error("Failed to execute transaction");
                }

                const { result } = await executeResponse.json();
                await suiClient.waitForTransaction({ digest: result.digest });
                return result;
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
            toast.success("Fusion account created successfully!", {
                style: {
                    background: "rgba(0, 200, 100, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 255, 120, 0.25)",
                    color: "#00ff88",
                },
            });
        },

        onError: (error: any) => {
            console.error("Error creating profile", error);
            toast.error("Failed to create account. Check console for details.");
        },
    });

    return { handleCreateProfile };
};