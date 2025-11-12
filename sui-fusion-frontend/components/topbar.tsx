"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { Search, Bell, Settings, Menu, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ConnectWalletModal from "./connect-wallet-modal";
import Sidebar from "./sidebar";

export default function TopBar() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [openConnect, setOpenConnect] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<
    string | { name: string; avatar_url: string }
  >("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("suifusion_profile");
      if (saved) setUser(JSON.parse(saved));
    }
  }, []);

  // normalized display name to avoid accessing `.name` on a string union
  const displayName = typeof user === "string" ? user : user?.name || "";
  const avatar = typeof user === "string" ? user : user?.avatar_url || "";

  const shortAddr = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between">
      {/* Left - Hamburger + Search */}
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        <div className="lg:hidden flex items-center gap-4">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-0 lg:hidden">
              <DrawerHeader className="border-b border-border flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/sui-icon.webp"
                    alt="Sui"
                    width={400}
                    height={400}
                    className="w-8 h-8"
                  />
                  <DrawerTitle className="text-base">SuiFusion</DrawerTitle>
                </div>
              </DrawerHeader>

              {/* Sidebar content inside drawer */}
              <div className="h-[85vh] overflow-y-auto">
                <Sidebar isMobile setOpen={setDrawerOpen} />
              </div>

              {/* User info bottom section */}
              {currentAccount && (
                <div className="border-t border-border p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={displayName}
                        className="w-10 h-10 rounded-full"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold">
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {shortAddr(currentAccount.address)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => disconnect()}
                  >
                    <LogOut size={16} className="mr-2" />
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search streams, games..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Center - Logo for mobile */}
      <div className="flex lg:hidden items-center gap-2">
        <Image
          src="/sui-icon.webp"
          alt="Sui"
          width={400}
          height={400}
          className="w-10 h-10"
        />
        <span className="font-bold text-sm">SuiFusion</span>
      </div>

      {/* Right - Icons or Connect button */}
      {currentAccount ? (
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
            <Bell size={18} className="text-primary" />
          </div>
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <Settings size={18} />
          </div>

          {/* Profile Popover */}
          <Popover>
            <PopoverTrigger asChild>
              {avatar ? (
                <Image
                  src={avatar}
                  alt={displayName}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-62 p-4 mr-5">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {shortAddr(currentAccount?.address)}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => disconnect()}
              >
                <LogOut size={16} className="mr-2" />
                Disconnect Wallet
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <button
          onClick={() => setOpenConnect(true)}
          className="px-7 py-2.5 rounded-full bg-primary hover:bg-secondary active:scale-95 transition"
        >
          Connect Wallet
        </button>
      )}

      <ConnectWalletModal open={openConnect} setOpen={setOpenConnect} />
    </div>
  );
}
