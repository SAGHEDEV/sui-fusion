"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectWalletModal from "@/components/connect-wallet-modal";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentAccount = useCurrentAccount();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Give a brief moment to check wallet connection
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Show loading state while checking
    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-400">Checking wallet connection...</p>
                </div>
            </div>
        );
    }

    // If no wallet connected, show modal that cannot be closed
    if (!currentAccount) {
        return (
            <>
                <div className="min-h-screen bg-black" />
                <ConnectWalletModal 
                    open={true} 
                    setOpen={() => {}} // Prevent closing
                />
            </>
        );
    }

    // Wallet connected, show protected content
    return <>{children}</>;
}