"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import {
  useConnectWallet,
  useCurrentAccount,
  useSuiClientQuery,
  useWallets,
} from "@mysten/dapp-kit";
import { toast } from "sonner";
import CreateFusionAccount from "./create-fusion-account-modal";
import { isEnokiWallet } from "@mysten/enoki";

function ConnectWalletModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [openCreateAccount, setOpenCreateAccount] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const wallets = useWallets();

  // Separate Enoki wallets from regular wallets
  const enokiWallets = wallets.filter(isEnokiWallet);
  const regularWallets = wallets.filter((wallet) => !isEnokiWallet(wallet));
  const googleWallet = enokiWallets.find(
    (wallet) => wallet.provider === "google"
  );

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

  const hasProfile = !!profileData?.data;

  // Handle Google zkLogin
  const handleGoogleLogin = async () => {
    if (!googleWallet) {
      toast.error("Google login not available. Check your Enoki setup.");
      return;
    }

    try {
      setIsConnecting(true);
      connect(
        { wallet: googleWallet },
        {
          onSuccess: () => {
            toast.success("Connected with Google! 🚀", {
              style: {
                background: "rgba(0, 200, 100, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 255, 120, 0.25)",
                color: "#00ff88",
              },
            });
            setIsConnecting(false);
          },
          onError: (error) => {
            console.error("Google login error:", error);
            toast.error("Failed to connect with Google!");
            setIsConnecting(false);
          },
        }
      );
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to connect with Google!");
      setIsConnecting(false);
    }
  };

  // Check profile after wallet connection
  useEffect(() => {
    if (currentAccount?.address && !isCheckingProfile) {
      if (hasProfile) {
        // Profile exists - save to localStorage and close modal
        const content = profileData?.data?.content;
        const profileContent =
          content && typeof content === "object" && "fields" in content
            ? (content as any).fields
            : undefined;
        const profile = profileContent?.value?.fields;
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
  }, [
    currentAccount?.address,
    hasProfile,
    isCheckingProfile,
    profileData,
    setOpen,
  ]);

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
              {/* Google zkLogin Button */}
              {googleWallet && (
                <div className="mb-4">
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isConnecting || isCheckingProfile}
                    className="w-full h-14 bg-white hover:bg-gray-100 text-gray-800 active:scale-95 transition duration-300 flex items-center justify-center gap-3 rounded-xl disabled:opacity-50 font-semibold"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isConnecting ? "Connecting..." : "Continue with Google"}
                  </Button>
                </div>
              )}

              {/* Divider - only show if we have both Google and regular wallets */}
              {googleWallet && regularWallets.length > 0 && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-xs text-gray-500 uppercase">Or</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>
              )}

              {/* Regular Wallet Options */}
              {regularWallets.length > 0 ? (
                <div className="w-full grid grid-cols-1 gap-3">
                  {regularWallets.map((wallet) => (
                    <Button
                      key={wallet.name}
                      onClick={() => {
                        setIsConnecting(true);
                        connect(
                          { wallet },
                          {
                            onSuccess: () => {
                              toast.success("Wallet connected! 🚀", {
                                style: {
                                  background: "rgba(0, 200, 100, 0.15)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(0, 255, 120, 0.25)",
                                  color: "#00ff88",
                                },
                              });
                              setIsConnecting(false);
                            },
                            onError: () => {
                              toast.error("Failed to connect wallet!");
                              setIsConnecting(false);
                            },
                          }
                        );
                      }}
                      disabled={isCheckingProfile || isConnecting}
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
              ) : !googleWallet ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium mt-3 mb-4">
                    ⚠️ No wallet detected. Please install a supported wallet to
                    continue.
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
              ) : null}

              {isCheckingProfile && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-400">Checking profile...</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateFusionAccount
        open={openCreateAccount}
        setOpen={setOpenCreateAccount}
      />
    </>
  );
}

export default ConnectWalletModal;
