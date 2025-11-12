// hooks/useProfile.ts
import { useSuiClientQuery } from "@mysten/dapp-kit";

export function useProfile({ address }: { address: string }) {

    const { data: profileData, isLoading: isCheckingProfile, error } = useSuiClientQuery(
        "getDynamicFieldObject",
        {
            parentId: process.env.NEXT_PUBLIC_PROFILE_REGISTRY_TABLE_ID!,
            name: {
                type: "address",
                value: address || "",
            },
        },
        {
            enabled: !!address,
            select: (data) => {
                const content = data?.data?.content;
                const profileContent =
                    content && typeof content === "object" && "fields" in content ? (content as any).fields : undefined;
                const profile = profileContent?.value?.fields
                return profile;
            }
        }
    );

    return {
        profileData,
        isCheckingProfile,
        error,
        address: address
    };
}
