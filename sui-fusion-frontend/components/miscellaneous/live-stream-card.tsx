import { motion } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useViewerCount } from "@/hooks/use-viewer-count";

interface LiveStreamCardProps {
  title: string;
  category: string;
  viewers: number;
  thumbnail: string;
  streamId: string;
  isLive: boolean;
  playbackId: string;
  owner: string;
}

export function LiveStreamCardWithViewers(props: LiveStreamCardProps) {
  const viewerCount = useViewerCount(props.streamId);

  return (
    <LiveStreamCard
      {...props}
      viewers={viewerCount}
    />
  );
}

const LiveStreamCard = ({
  title,
  category,
  thumbnail,
  owner,
  streamId,
  isLive,
  playbackId,
}: LiveStreamCardProps) => {
  const currentAccount = useCurrentAccount();
  const { profileData, isCheckingProfile } = useProfile({ address: owner });
  const viewerCount = useViewerCount(streamId);
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-card rounded-lg overflow-hidden hover:border-primary/50 border border-border transition-all cursor-pointer group shadow-md hover:shadow-primary/20"
    >
      <div className="relative h-40 overflow-hidden bg-black">
        <img
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />

        {/* Live/Ended Badge */}
        {isLive ? (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600 px-2 py-1 rounded">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-white text-xs font-bold uppercase">LIVE</span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-gray-600 px-3 py-1 rounded">
            <span className="text-white text-xs font-bold uppercase">
              ENDED
            </span>
          </div>
        )}

        {/* Viewers Count */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-2">
          <p className="text-xs text-muted-foreground p-2 rounded-sm bg-primary/40 w-fit">
            {viewerCount.toLocaleString()} {isLive ? "viewers" : "Joined"}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Stream Title */}
        <h4 className="font-bold text-sm line-clamp-2 min-h-10">{title}</h4>

        {/* Channel and Action */}
        <div className="flex items-center gap-2">
          {profileData?.avatar_url ? (
            <Image
              src={profileData?.avatar_url}
              alt={profileData?.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/30 shrink-0"></div>
          )}
          <div className="flex-1 flex flex-row justify-between items-center min-w-0 gap-2">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <p className="text-xs font-medium truncate">
                {isCheckingProfile
                  ? "Loading..."
                  : profileData?.name || "Streamer"}
              </p>
              {/* Category Capsule */}
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                {category}
              </span>
            </div>

            {/* Watch Button */}
            {isLive ? (
              <Link
                href={`/watch/${playbackId}`}
                className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition whitespace-nowrap"
              >
                Watch Live
              </Link>
            ) : isLive && currentAccount?.address === owner ? (
              <Link
                href={`/live/${streamId}`}
                className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition whitespace-nowrap"
              >
                Continue Stream
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-1.5 text-sm rounded-md bg-gray-600 text-gray-400 cursor-not-allowed opacity-50 whitespace-nowrap"
              >
                Stream Ended
              </button>
            )}
          </div>
        </div>

        {/* Like and Comment Stats */}
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
    </motion.div>
  );
};

export default LiveStreamCard;
