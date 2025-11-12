"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import LiveStreamCard from "./miscellaneous/live-stream-card";

export default function RecommendationSection() {
  const { data: dynamicFields, isLoading: isLoadingFields } = useSuiClientQuery(
    "getDynamicFields",
    {
      parentId: process.env.NEXT_PUBLIC_STREAM_REGISTRY_TABLE_ID!,
    }
  );

  const streamIds =
    dynamicFields?.data
      ?.filter((field) => field.name.type === "0x1::string::String")
      ?.map((field) => field.objectId) || [];

  const { data: streams, isLoading: isLoadingStreams } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: streamIds,
      options: {
        showContent: true,
        showOwner: true,
      },
    },
    {
      enabled: streamIds.length > 0,
    }
  );

  const allStreamData =
    streams?.map((stream: any) => stream.data?.content?.fields.value.fields) || [];

  // Get only the active (live) streams
  const liveStreams = allStreamData.filter((s: any) => s.is_active === true);

  // Sort by timestamp (if available) or fallback to random shuffle
  const sortedStreams = liveStreams
    .sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0))
    .slice(0, 3); // Pick top 3

  const isLoading = isLoadingFields || isLoadingStreams;

  return (
    <motion.section
      className="px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-2xl font-bold mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        Recommended Live Streams
      </motion.h3>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          className="flex flex-col items-center justify-center py-20 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-400">Fetching live recommendations...</p>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && sortedStreams.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-20 gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-2">No Live Streams</h4>
            <p className="text-gray-400 text-sm">
              Nothing’s happening live right now — check back later 👀
            </p>
          </div>
        </motion.div>
      )}

      {/* Stream Grid */}
      {!isLoading && sortedStreams.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {sortedStreams.map((stream: any, index: number) => (
              <motion.div
                key={stream.stream_id || index}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <LiveStreamCard
                  title={stream.name || "Untitled Stream"}
                  owner={stream.owner || "Unknown"}
                  category={stream.categories?.[0] || "Gaming"}
                  viewers={0}
                  thumbnail={stream.thumbnail_url || "/default-thumbnail.jpeg"}
                  isLive={stream.is_active}
                  streamId={stream.stream_id}
                  playbackId={stream.playback_id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  );
}
