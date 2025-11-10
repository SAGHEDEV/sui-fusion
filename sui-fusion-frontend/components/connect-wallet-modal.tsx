"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CreateFusionAccount from "./create-fusion-account-modal";

function ConnectWalletModal({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [openCreateAccount, setOpenCreateAccount] = useState(false)
    // const router = useRouter();
    const { mutateAsync: handleConnectWallet } = useConnectWallet();
    const wallets = useWallets();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="
          sm:max-w-lg 
          rounded-2xl 
          border border-gray-700 
          backdrop-blur-lg 
          bg-[rgba(20,20,20,0.7)] 
          text-white 
          shadow-2xl
        "
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
                            <div className="w-full grid grid-cols-1  gap-3 mt-4 justify-center items-center">
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
                                                setOpen(false);
                                                setTimeout(() => {
                                                    setOpenCreateAccount(true)
                                                }, 500);
                                            } catch (error) {
                                                toast.error("Failed to connect wallet!");
                                            }
                                        }}
                                        className="w-full h-14 bg-[rgba(255,255,255,0.05)]  border border-gray-600  hover:bg-[rgba(255,255,255,0.15)]  active:scale-95  transition  duration-300  flex  items-center  justify-center  gap-2 rounded-xl"
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
                            <p className="text-sm text-center text-gray-500 font-medium mt-3">
                                ⚠️ No wallet detected. Please install a supported wallet to continue.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
            <CreateFusionAccount open={openCreateAccount} setOpen={setOpenCreateAccount} />
        </Dialog>
    );
}

export default ConnectWalletModal;
