"use client";

import { useParams, useRouter } from "next/navigation";
import { Send, Users, Loader2, VideoOff, Home } from "lucide-react";
import { useSendTip } from "@/hooks/useSuiFusionContract";
import { useState } from "react";

export default function WatchStreamPage() {
    const { playbackId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [streamInfo, setStreamInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewerCount, setViewerCount] = useState(0);
    const [streamEnded, setStreamEnded] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(true);
    const [showTipModal, setShowTipModal] = useState(false);
    const [tipAmount, setTipAmount] = useState("");
    console.log(streamInfo)

    const { mutateAsync: sendTip, isPending: isTipping } = useSendTip();

    const fetchStreamData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/stream/${playbackId}`);
            if (!res.ok) throw new Error("Failed to fetch stream info");
            const data = await res.json();
            setStreamInfo(data);

            // Check if stream is active
            if (data.isActive === false) {
                setStreamEnded(true);
                setIsStreamActive(false);
            }

            // Simulate viewer count
            setViewerCount(Math.floor(Math.random() * 500) + 50);
        } catch (err) {
            console.error(err);
            toast.error("Unable to fetch stream info");
        } finally {
            setIsLoading(false);
        }
    };

    // Poll stream status periodically
    useEffect(() => {
        if (playbackId) {
            fetchStreamData();

            // Check stream status every 10 seconds
            const statusInterval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/stream/${playbackId}`);
                    const data = await res.json();

                    // If stream becomes inactive, show ended message
                    if (data.isActive === false && isStreamActive) {
                        setStreamEnded(true);
                        setIsStreamActive(false);
                        toast.info("Stream has ended");
                    }
                } catch (err) {
                    console.error("Failed to check stream status:", err);
                }
            }, 10000);

            return () => clearInterval(statusInterval);
        }
    }, [playbackId, isStreamActive]);

    useEffect(() => {
        setMessages([
            { id: 1, user: "Admin", text: "Welcome to the stream!" },
            { id: 2, user: "Viewer_42", text: "This is dope 🔥" },
            { id: 3, user: "GamerPro", text: "Nice gameplay!" },
        ]);

        // Simulate viewer count updates
        const interval = setInterval(() => {
            if (isStreamActive) {
                setViewerCount((prev) => Math.max(10, prev + Math.floor(Math.random() * 10) - 5));
            } else {
                // Gradually decrease viewers after stream ends
                setViewerCount((prev) => Math.max(0, prev - Math.floor(Math.random() * 20)));
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isStreamActive]);

    const sendMessage = () => {
        if (!message.trim()) return;
        if (streamEnded) {
            toast.error("Stream has ended. Cannot send messages.");
            return;
        }
        const newMsg = {
            id: Date.now(),
            user: "Guest_" + Math.floor(Math.random() * 1000),
            text: message.trim(),
        };
        setMessages((prev) => [...prev, newMsg]);
        setMessage("");
        toast.success("Message sent!");
    };

    const handleSendTip = async () => {
        if (!tipAmount || isNaN(Number(tipAmount)) || Number(tipAmount) <= 0) {
            toast.error("Please enter a valid tip amount");
            return;
        }

        try {
            // In a real implementation, you would get the actual stream ID
            // For now, we'll use a placeholder value
            const streamId = 1;
            
            await sendTip({
                streamId,
                amount: Number(tipAmount) * 1000000000, // Convert to MIST (assuming 1 SUI = 1,000,000,000 MIST)
                categories: [streamInfo?.category || "General"],
            });
            
            setShowTipModal(false);
            setTipAmount("");
        } catch (error: any) {
            toast.error("Failed to send tip: " + error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-400">Loading stream...</p>
                </div>
            </div>
        );
    }

    if (!streamInfo) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-black text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Stream Not Found</h2>
                    <p className="text-gray-400">This stream may have ended or doesn't exist.</p>
                    <Button
                        onClick={() => router.push("/")}
                        className="mt-4 bg-primary hover:bg-primary/90"
                    >
                        <Home size={16} className="mr-2" />
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col md:flex-row w-full h-screen bg-black text-white overflow-hidden relative">
            {/* Stream Ended Overlay */}
            {streamEnded && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center">
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 max-w-md px-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                            <VideoOff size={48} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-3">Stream Ended</h2>
                            <p className="text-gray-400 text-lg">
                                Thanks for watching! The broadcaster has ended this stream.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                                <p className="text-sm text-gray-400 mb-1">Stream Title</p>
                                <p className="font-semibold text-white">{streamInfo?.name || "Live Stream"}</p>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span>{viewerCount} viewers</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={() => router.push("/")}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Home size={16} className="mr-2" />
                                Browse Streams
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="border-gray-700 hover:bg-gray-800"
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎥 Video Player */}
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black">
                    <Player.Root
                        src={getSrc({
                            type: "hls",
                            url: `https://livepeercdn.com/hls/${playbackId}/index.m3u8`,
                        })}
                        playbackId={playbackId as string}
                        autoPlay
                    >
                        <Player.Container>
                            <Player.Video className="w-full h-full object-contain" />

                            {/* Loading State */}
                            <Player.LoadingIndicator className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    <p className="text-white">Loading stream...</p>
                                </div>
                            </Player.LoadingIndicator>

                            {/* Error State - Enhanced to detect stream end */}
                            <Player.ErrorIndicator
                                matcher="all"
                                className="absolute inset-0 flex items-center justify-center bg-black/90"
                            >
                                <div className="text-center p-6">
                                    <p className="text-red-500 text-lg font-semibold mb-2">
                                        Stream Unavailable
                                    </p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        The stream may have ended or is experiencing technical difficulties.
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            onClick={() => {
                                                // setStreamEnded(true);
                                                fetchStreamData();
                                            }}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            Check Status
                                        </Button>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            variant="outline"
                                            className="border-gray-700"
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            </Player.ErrorIndicator>

                            {/* Controls */}
                            <Player.Controls className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Player.PlayPauseTrigger className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition">
                                            <Player.PlayingIndicator asChild matcher={false}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </Player.PlayingIndicator>
                                            <Player.PlayingIndicator asChild matcher={true}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                </svg>
                                            </Player.PlayingIndicator>
                                        </Player.PlayPauseTrigger>

                                        <Player.MuteTrigger className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition">
                                            <Player.VolumeIndicator asChild matcher={false}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                                </svg>
                                            </Player.VolumeIndicator>
                                            <Player.VolumeIndicator asChild matcher={true}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
                                                </svg>
                                            </Player.VolumeIndicator>
                                        </Player.MuteTrigger>

                                        <Player.Time className="text-sm text-white/90 font-medium" />
                                    </div>

                                    <Player.FullscreenTrigger className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                        </svg>
                                    </Player.FullscreenTrigger>
                                </div>

                                {/* Progress Bar */}
                                <Player.Seek className="mt-2 w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group">
                                    <Player.Track className="h-full bg-white/40 relative">
                                        <Player.Range className="absolute h-full bg-primary" />
                                    </Player.Track>
                                </Player.Seek>
                            </Player.Controls>

                            {/* Live Badge */}
                            {isStreamActive ? (
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    <span className="text-white text-xs font-bold uppercase">LIVE</span>
                                </div>
                            ) : (
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-gray-600 px-3 py-1.5 rounded-full">
                                    <span className="text-white text-xs font-bold uppercase">OFFLINE</span>
                                </div>
                            )}
                        </Player.Container>
                    </Player.Root>
                </div>

                {/* Stream Info */}
                <div className="mt-4 w-full flex justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white">
                                {streamInfo?.name || "Live Stream"}
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                {streamInfo?.description || "Watch and chat live!"}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-sm">
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-medium">
                                    {streamInfo?.category || "General"}
                                </span>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users size={16} />
                                    <span className="font-medium">{viewerCount} watching</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowTipModal(true)}
                        className="px-5 py-2 rounded-full h-fit bg-primary hover:bg-secondary active:scale-95 transition"
                    >
                        Tip Streamer
                    </button>
                </div>

                {/* 💬 Chat Section */}
                <div className="w-full md:w-[350px] bg-gray-900/50 border-l border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-700 bg-black/30">
                        <h3 className="text-lg font-semibold">Live Chat</h3>
                        <p className="text-xs text-gray-500 mt-1">{messages.length} messages</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length > 0 ? (
                            messages.map((msg) => (
                                <div key={msg.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                        {msg.user[0]}
                                    </div>
                                    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm p-2.5 rounded-lg">
                                        <p className="text-xs font-semibold text-primary">{msg.user}</p>
                                        <p className="text-sm text-gray-200 mt-0.5">{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center mt-8">
                                No messages yet. Be the first to say something!
                            </p>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-700 bg-black/30">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder={streamEnded ? "Stream has ended" : "Say something..."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                disabled={streamEnded}
                                className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary disabled:opacity-50"
                            />
                            <Button
                                variant="secondary"
                                onClick={sendMessage}
                                disabled={!message.trim() || streamEnded}
                                className="bg-primary hover:bg-primary/90 text-white px-3 disabled:opacity-50"
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            {streamEnded ? "Chat disabled" : `Chat as Guest_${Math.floor(Math.random() * 1000)}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tip Modal */}
            {showTipModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Tip Streamer</h3>
                        <p className="text-gray-400 mb-2">Enter the amount of SUI you'd like to tip</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Amount (SUI)</label>
                            <input
                                type="number"
                                value={tipAmount}
                                onChange={(e) => setTipAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTipModal(false)}
                                className="flex-1 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendTip}
                                disabled={isTipping || !tipAmount}
                                className="flex-1 py-2 rounded-lg bg-primary hover:bg-secondary transition disabled:opacity-50"
                            >
                                {isTipping ? "Sending..." : "Send Tip"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}