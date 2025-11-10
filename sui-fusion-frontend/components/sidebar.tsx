"use client"

import { Home, TrendingUp, Gamepad2, VideoIcon } from "lucide-react"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ConnectWalletModal from "./connect-wallet-modal";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import Image from "next/image";

const SidebarItem = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => {
  const active = usePathname() === href;
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

const UserItem = ({ name, initials }: { name: string; initials: string }) => (
  <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold">
      {initials}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{name}</p>
      <p className="text-xs text-muted-foreground">Online</p>
    </div>
    <span className="text-xs bg-muted/50 px-2 py-1 rounded">5.5k</span>
  </div>
)

export default function Sidebar() {

  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const [openConnect, setOpenConnect] = useState(false)
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/sui-icon.webp" alt="Sui" width={400} height={400} className="w-10 h-10" />
          <span className="font-bold text-sm">SuiFusion</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 border-b border-border">
        <SidebarItem icon={Home} label="Home" href="/" />
        <SidebarItem icon={VideoIcon} label="Explore Live" href="/explore" />
        <SidebarItem icon={TrendingUp} label="Trending" href="/trending" />
        <SidebarItem icon={Gamepad2} label="Games" href="/games" />
        {/* <SidebarItem icon={Music} label="Music" /> */}
        {/* <SidebarItem icon={Palette} label="Creators" /> */}
      </nav>

      {/* Users Section */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase px-2 py-2 mb-2">Top Streamers</div>
        <div className="space-y-2">
          <UserItem name="AcesFold" initials="AF" />
          <UserItem name="SJArneus Mu..." initials="SM" />
          <UserItem name="Arizonah" initials="AZ" />
          <UserItem name="Arizentski R..." initials="AR" />
          <UserItem name="Arizentski" initials="AZ" />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-border">
        <div className="bg-linear-to-br from-primary to-accent/50 rounded-lg p-4 text-center">
          <p className="text-sm font-bold mb-3">Unlock Your Streaming Journey</p>
          <button onClick={() => {
            if (!currentAccount) {
              setOpenConnect(true)
            } else {
              router.push('/live')
            }
          }} className="w-full bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95">
            Go Live
          </button>
        </div>
      </div>
      <ConnectWalletModal open={openConnect} setOpen={setOpenConnect} />
    </div>
  )
}
