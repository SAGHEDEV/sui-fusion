"use client";

import { useState } from "react";
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

  const user =
    JSON.parse(localStorage.getItem("suifusion_profile")!) || "Guest";

  const shortAddr = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between">
      {/* Left - Hamburger + Search */}
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        <div className="lg:hidden flex items-center gap-4">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} >
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
                <Sidebar isMobile />
              </div>

              {/* User info bottom section */}
              {currentAccount && (
                <div className="border-t border-border p-4 bg-background flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold">
                      {(user.name || user).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {user.name || user}
                      </p>
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
          <Popover >
            <PopoverTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-bold">
                  {(user.name || user).slice(0, 2).toUpperCase()}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 border-blue-500 backdrop-blur-2xl" align="end">
              <div className="flex items-center gap-3 border-b border-border pb-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold">
                  {(user.name || user).slice(0, 2).toUpperCase()}{" "}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user.name || user}</p>
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
