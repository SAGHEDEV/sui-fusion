import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateProfile = () => {
    const { mutateAsync } = useSignAndExecuteTransaction();
    const suiClient = useSuiClient();
    const queryClient = useQueryClient();

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

            tx.setGasBudget(100000000); // adjust for heavier stream data
            const result = await mutateAsync({ transaction: tx });

            await suiClient.waitForTransaction({ digest: result.digest });

            return result;
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