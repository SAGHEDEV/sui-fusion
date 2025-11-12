"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectWalletModal from "@/components/connect-wallet-modal";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentAccount = useCurrentAccount();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Checking Wallet State */}
        {isChecking && (
          <motion.div
            key="checking"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.p
              className="text-gray-400 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Checking wallet connection...
            </motion.p>
          </motion.div>
        )}

        {/* Wallet Not Connected */}
        {!isChecking && !currentAccount && (
          <motion.div
            key="no-wallet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ConnectWalletModal open={true} setOpen={() => {}} />
            </motion.div>
          </motion.div>
        )}

        {/* Wallet Connected */}
        {!isChecking && currentAccount && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
