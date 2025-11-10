import { Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const LiveStreamCard = ({ title, channel, category, viewers, thumbnail, streamId }: any) => (
  <div className="bg-card rounded-lg overflow-hidden hover:border-primary/50 border border-border transition-all cursor-pointer group">
    <div className="relative h-40 overflow-hidden bg-black">
      <img
        src={thumbnail || "/placeholder.svg"}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">LIVE</div>
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-2">
        <p className="text-xs text-muted-foreground p-2 rounded-sm bg-primary/40 w-fit">{viewers} viewers</p>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <h4 className="font-bold text-sm line-clamp-2">{title}</h4>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/30"></div>
        <div className="flex-1 flex flex-row justify-between items-center min-w-0">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium truncate">{channel}</p>
            <p className="text-xs text-muted-foreground truncate">{category}</p>
          </div>
          <Link href={`/watch/${streamId || "123456789"}`} className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-secondary active:scale-95 transition">
            Watch Live
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Heart size={14} />
          <span>12.5k</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle size={14} />
          <span>2.3k</span>
        </button>
      </div>
    </div>
  </div>
)

export default LiveStreamCard