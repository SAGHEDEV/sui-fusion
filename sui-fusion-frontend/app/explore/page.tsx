'use client'

import LiveStreamCard from '@/components/miscellaneous/live-stream-card'
import { useSuiClientQuery } from '@mysten/dapp-kit';
import React, { useState, useMemo } from 'react'
import { Loader2 } from 'lucide-react';

type FilterType = "all" | "live" | "ended";

const ExploreLivePage = () => {
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    const { data: dynamicFields, isLoading: isLoadingFields } = useSuiClientQuery(
        "getDynamicFields",
        {
            parentId: process.env.NEXT_PUBLIC_STREAM_REGISTRY_TABLE_ID!,
        }
    );

    // Extract stream IDs from the dynamic fields
    const streamIds = dynamicFields?.data
        ?.filter(field => field.name.type === "0x1::string::String")
        ?.map(field => field.objectId) || [];

    // Then fetch each stream individually
    const { data: streams, isLoading: isLoadingStreams } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: streamIds?.map(id => id) as string[], // Array of stream object IDs
            options: {
                showContent: true,
                showOwner: true,
            },
        },
        {
            enabled: streamIds.length > 0,
        }
    );

    const allStreamData = streams?.map((stream: any) => stream.data?.content?.fields.value.fields) || [];

    // Filter streams based on active filter
    const filteredStreams = useMemo(() => {
        if (activeFilter === "all") return allStreamData;
        if (activeFilter === "live") return allStreamData.filter((stream: any) => stream.is_active === true);
        if (activeFilter === "ended") return allStreamData.filter((stream: any) => stream.is_active === false);
        return allStreamData;
    }, [allStreamData, activeFilter]);

    const liveCount = allStreamData.filter((s: any) => s.is_active === true).length;
    const endedCount = allStreamData.filter((s: any) => s.is_active === false).length;

    const isLoading = isLoadingFields || isLoadingStreams;

    return (
        <div className="px-8 py-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">Currently Live</h3>
                <div className="text-sm text-gray-400">
                    {allStreamData.length} total streams
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
                {[
                    { name: "All", key: "all" as FilterType, count: allStreamData.length },
                    { name: "Live", key: "live" as FilterType, count: liveCount },
                    { name: "Ended", key: "ended" as FilterType, count: endedCount }
                ].map((type) => (
                    <button
                        key={type.key}
                        onClick={() => setActiveFilter(type.key)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
                            activeFilter === type.key
                                ? "bg-primary text-white border-primary"
                                : "bg-muted/50 hover:bg-primary/30 text-muted-foreground hover:text-primary border-border hover:border-primary/50"
                        }`}
                    >
                        {type.name} ({type.count})
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-400">Loading streams...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredStreams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
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
                        <h4 className="text-xl font-semibold mb-2">No Streams Found</h4>
                        <p className="text-gray-400 text-sm">
                            {activeFilter === "live" && "No live streams at the moment. Check back later!"}
                            {activeFilter === "ended" && "No ended streams to show."}
                            {activeFilter === "all" && "No streams available yet."}
                        </p>
                    </div>
                </div>
            )}

            {/* Stream Grid */}
            {!isLoading && filteredStreams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStreams.map((stream: any, index: number) => (
                        <LiveStreamCard
                            key={stream.stream_id || index}
                            title={stream.name || "Untitled Stream"}
                            channel={stream.owner?.substring(0, 8) + "..." || "Unknown"}
                            category={stream.categories?.[0] || "Gaming"}
                            viewers={0}
                            thumbnail={"/default-thumbnail.jpeg"}
                            isLive={stream.is_active}
                            streamId={stream.stream_id}
                            playbackId={stream.playback_id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ExploreLivePage;