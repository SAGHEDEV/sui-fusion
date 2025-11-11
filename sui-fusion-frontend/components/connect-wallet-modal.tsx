"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useConnectWallet, useCurrentAccount, useSuiClientQuery, useWallets } from "@mysten/dapp-kit";
import { toast } from "sonner";
import CreateFusionAccount from "./create-fusion-account-modal";

function ConnectWalletModal({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [openCreateAccount, setOpenCreateAccount] = useState(false);
    const currentAccount = useCurrentAccount();
    const { mutateAsync: handleConnectWallet } = useConnectWallet();
    const wallets = useWallets();

    const { data: profileData, isLoading: isCheckingProfile } = useSuiClientQuery(
        "getDynamicFieldObject",
        {
            parentId: process.env.NEXT_PUBLIC_PROFILE_REGISTRY_TABLE_ID!,
            name: {
                type: "address",
                value: currentAccount?.address || "",
            },
        },
        {
            enabled: !!currentAccount?.address,
        }
    );
    console.log(profileData)

    const hasProfile = !!profileData?.data;

    // Check profile after wallet connection
    useEffect(() => {
        if (currentAccount?.address && !isCheckingProfile) {
            if (hasProfile) {
                // Profile exists - save to localStorage and close modal
                const content = profileData?.data?.content;
                const profileContent =
                    content && typeof content === "object" && "fields" in content ? (content as any).fields : undefined;
                    const profile = profileContent?.value?.fields
                localStorage.setItem(
                    "suifusion_profile",
                    JSON.stringify({
                        address: currentAccount.address,
                        name: profile?.name,
                        avatar_url: profile?.avatar_url,
                        created_at: profile?.created_at,
                    })
                );
                toast.success("Welcome back! 🎮", {
                    style: {
                        background: "rgba(0, 200, 100, 0.15)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(0, 255, 120, 0.25)",
                        color: "#00ff88",
                    },
                });
                setOpen(false);
            } else {
                // No profile - open create account modal
                setOpen(false);
                setTimeout(() => {
                    setOpenCreateAccount(true);
                }, 300);
            }
        }
    }, [currentAccount?.address, hasProfile, isCheckingProfile, profileData, setOpen]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="sm:max-w-lg rounded-2xl border border-gray-700 backdrop-blur-lg bg-[rgba(20,20,20,0.7)] text-white shadow-2xl"
                    onEscapeKeyDown={(e) => {
                        if (setOpen.toString() === "() => {}") {
                            e.preventDefault();
                        }
                    }}
                    onPointerDownOutside={(e) => {
                        if (setOpen.toString() === "() => {}") {
                            e.preventDefault();
                        }
                    }}
                >
                    <DialogTitle className="hidden" />

                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="text-center">
                            <h3 className="text-3xl font-extrabold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                                Connect Your Wallet
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Link your wallet to jump into the SuiFusion gaming world.
                            </p>
                        </div>

                        <div className="w-full">
                            {Array.isArray(wallets) && wallets.length > 0 ? (
                                <div className="w-full grid grid-cols-1 gap-3 mt-4 justify-center items-center">
                                    {wallets.map((wallet) => (
                                        <Button
                                            key={wallet.name}
                                            onClick={async () => {
                                                try {
                                                    await handleConnectWallet({ wallet });
                                                    toast.success("Wallet connected! 🚀", {
                                                        style: {
                                                            background: "rgba(0, 200, 100, 0.15)",
                                                            backdropFilter: "blur(10px)",
                                                            border: "1px solid rgba(0, 255, 120, 0.25)",
                                                            color: "#00ff88",
                                                        },
                                                    });
                                                    // Profile check happens in useEffect after connection
                                                } catch (error) {
                                                    toast.error("Failed to connect wallet!");
                                                }
                                            }}
                                            disabled={isCheckingProfile}
                                            className="w-full h-14 bg-[rgba(255,255,255,0.05)] border border-gray-600 hover:bg-[rgba(255,255,255,0.15)] active:scale-95 transition duration-300 flex items-center justify-center gap-2 rounded-xl disabled:opacity-50"
                                        >
                                            <Image
                                                src={wallet.icon}
                                                alt={wallet.name}
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                            <span className="font-semibold text-sm text-gray-200">
                                                {wallet.name}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 font-medium mt-3 mb-4">
                                        ⚠️ No wallet detected. Please install a supported wallet to continue.
                                    </p>
                                    <div className="flex flex-col gap-2 text-xs text-gray-400">
                                        <p>Supported wallets:</p>
                                        <ul className="list-disc list-inside">
                                            <li>Sui Wallet</li>
                                            <li>Suiet</li>
                                            <li>Ethos Wallet</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {isCheckingProfile && (
                                <div className="text-center mt-4">
                                    <p className="text-sm text-gray-400">Checking profile...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            <CreateFusionAccount open={openCreateAccount} setOpen={setOpenCreateAccount} />
        </>
    );
}

export default ConnectWalletModal;