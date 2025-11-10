"use client"

const StreamerCard = ({
  name,
  category,
  viewers,
  live = true,
}: { name: string; category: string; viewers: string; live?: boolean }) => (
  <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
    <div className="flex items-start justify-between mb-2">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0"></div>
      {live && <span className="text-xs font-bold bg-primary text-white px-2 py-1 rounded">Live</span>}
    </div>
    <p className="text-xs font-bold truncate">{name}</p>
    <p className="text-xs text-muted-foreground truncate">{category}</p>
    <p className="text-xs text-muted-foreground mt-1">{viewers} viewers</p>
  </div>
)

export default function LiveStreamers() {
  return (
    <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Live Streamers</h3>
      <div className="space-y-3">
        <StreamerCard name="Habil Sherly" category="Valorant Pro Team" viewers="156.2k" />
        <StreamerCard name="Windith Hazazt" category="Valorant Ranked" viewers="89.5k" />
        <StreamerCard name="Shuvalte Singh" category="CSGO Tournament" viewers="67.3k" />
        <StreamerCard name="Hosep Udn" category="Valorant Finals" viewers="45.1k" />
      </div>
    </div>
  )
}
