"use client";

import { useEffect, useState } from "react";
import * as Broadcast from "@livepeer/react/broadcast";
import { useBroadcastContext } from "@livepeer/react/broadcast";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    MicOff,
    Mic,
    MonitorUp,
    MonitorX,
    MessageCircle,
    Settings,
    Share2,
    X,
} from "lucide-react";

function BroadcastStatus({ __scopeBroadcast }: Broadcast.BroadcastScopedProps<{}>) {
    const context = useBroadcastContext("BroadcastStatus", __scopeBroadcast);
    const { status } = Broadcast.useStore(context.store, (s) => ({
        status: s.status,
    }));

    useEffect(() => {
        if (status === "live") toast.success("🎥 You're now LIVE!");
        else if (status === "idle") toast.info("🟡 Stream stopped.");
    }, [status]);

    return null;
}

export default function BroadcastPage() {
    const { streamId } = useParams();
    const router = useRouter();
    const [streamData, setStreamData] = useState<any>(null);
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                const res = await fetch(`/api/stream/live/${streamId}`);
                if (!res.ok) throw new Error("Failed to fetch stream info");
                const data = await res.json();
                setStreamData(data);
            } catch (err) {
                toast.error("Failed to load stream info");
                router.push("/live");
            }
        };
        fetchStream();
    }, [streamId, router]);

    if (!streamData) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                Loading stream info...
            </div>
        );
    }

    return (
        <Broadcast.Root ingestUrl={`https://livepeer.studio/webrtc/${streamData.streamKey}`} audio>
            <BroadcastStatus />
            <div className="flex-1 flex flex-col h-full bg-black text-white">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        🎬 {streamData.name || ""}
                        <Broadcast.EnabledIndicator matcher={true}>
                            <span className="text-green-500 text-sm">LIVE</span>
                        </Broadcast.EnabledIndicator>
                        <Broadcast.EnabledIndicator matcher={false}>
                            <span className="text-gray-500 text-sm">PREVIEW</span>
                        </Broadcast.EnabledIndicator>
                    </h1>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const url = `${window.location.origin}/watch/${streamData.playbackId}`;
                                navigator.clipboard.writeText(url);
                                toast.success("Stream link copied!");
                            }}
                        >
                            <Share2 size={16} className="mr-1" />
                            Share
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                fetch(`/api/stream/end/${streamData.id}`, { method: "POST" });
                                toast.success("Stream ended");
                                router.push("/live");
                            }}
                        >
                            End Stream
                        </Button>
                    </div>
                </div>

                {/* Broadcast Container */}
                <div className="flex-1 relative bg-black flex justify-center items-center">
                    <Broadcast.Container className="relative h-full bg-black rounded-lg overflow-hidden flex items-center justify-center p-4">
                        <Broadcast.Video className="w-full h-full object-contain" />
                        <Broadcast.LoadingIndicator className="absolute inset-0 flex items-center justify-center bg-black/50">
                            Connecting...
                        </Broadcast.LoadingIndicator>
                        <Broadcast.ErrorIndicator
                            matcher="all"
                            className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500"
                        >
                            Failed to connect. Please retry.
                        </Broadcast.ErrorIndicator>
                    </Broadcast.Container>

                    {/* Chat Panel */}
                    {chatOpen && (
                        <div className="absolute right-0 top-0 bottom-0 w-[320px] border-l border-gray-800 bg-black/70 backdrop-blur-md flex-1 flex flex-col p-4 z-10">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-lg">Live Chat</h3>
                                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3">
                                <p className="text-gray-300 text-sm bg-white/10 p-2 rounded">
                                    Welcome to the stream!
                                </p>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    toast.success("Message sent!");
                                }}
                                className="flex gap-2 mt-3"
                            >
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-900 text-sm px-3 py-2 rounded-lg border border-gray-700"
                                />
                                <Button size="sm" variant="secondary">
                                    Send
                                </Button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 px-6 py-3 rounded-2xl border border-gray-700 backdrop-blur-sm z-10">
                    <Broadcast.EnabledTrigger>
                        <Button className="bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-2">
                            <Broadcast.EnabledIndicator matcher={false}>
                                <>🎥 Go Live</>
                            </Broadcast.EnabledIndicator>
                            <Broadcast.EnabledIndicator matcher={true}>
                                <>⏹ Stop Live</>
                            </Broadcast.EnabledIndicator>
                        </Button>
                    </Broadcast.EnabledTrigger>

                    <Broadcast.ScreenshareTrigger className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md">
                        <Broadcast.ScreenshareIndicator asChild matcher={false}>
                            <MonitorUp size={18} />
                        </Broadcast.ScreenshareIndicator>
                        <Broadcast.ScreenshareIndicator asChild matcher={true}>
                            <MonitorX size={18} className="text-red-500" />
                        </Broadcast.ScreenshareIndicator>
                    </Broadcast.ScreenshareTrigger>

                    <Broadcast.AudioEnabledTrigger className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md">
                        <Broadcast.AudioEnabledIndicator asChild matcher={false}>
                            <MicOff size={18} className="text-red-500" />
                        </Broadcast.AudioEnabledIndicator>
                        <Broadcast.AudioEnabledIndicator asChild matcher={true}>
                            <Mic size={18} className="text-green-400" />
                        </Broadcast.AudioEnabledIndicator>
                    </Broadcast.AudioEnabledTrigger>

                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                    >
                        <MessageCircle size={18} />
                    </button>

                    <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </Broadcast.Root >
    );
}
