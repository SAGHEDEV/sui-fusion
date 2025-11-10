"use client"

import { useCurrentAccount } from "@mysten/dapp-kit"
import { Search, Bell, Settings } from "lucide-react"
import ConnectWalletModal from "./connect-wallet-modal"
import { useState } from "react"

export default function TopBar() {
  const currentAccount = useCurrentAccount()
  const [openConnect, setOpenConnect] = useState(false)
  return (
    <div className="h-16 bg-card border-b border-border px-8 flex items-center justify-between">
      {/* Left - Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search streams, games..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Center - Navigation */}
      {/* <div className="flex items-center gap-6 mx-8">
        <span className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">Trending</span>
        <span className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">
          Explore Streamer
        </span>
        <span className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">Categories</span>
        <span className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">Subscription</span>
      </div> */}

      {/* Right - Icons */}
      {currentAccount ? <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
          <Bell size={18} className="text-primary" />
        </div>
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
          <Settings size={18} />
        </div>
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center cursor-pointer">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      </div> :
        <button onClick={() => setOpenConnect(true)} className="px-7 py-2.5 rounded-full bg-primary hover:bg-secondary active:scale-95 transition">
          Connect Wallet
        </button>}
      <ConnectWalletModal open={openConnect} setOpen={setOpenConnect} />
    </div>
  )
}
