"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Player from "@livepeer/react/player";
import { getSrc } from "@livepeer/react/external";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Users, Loader2, VideoOff, Home } from "lucide-react";
import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { db } from "@/lib/firebase"; // ✅ import your firebase instance
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import TipStreamerModal from "@/components/tip-streamer-modal";

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
  const [openTipStreamer, setOpenTipStreamer] = useState(false);

  const suiClient = useSuiClient();

  const { data: fields, isLoading: suiLoading } = useSuiClientQuery(
    "getDynamicFields",
    {
      parentId: process.env.NEXT_PUBLIC_STREAM_REGISTRY_TABLE_ID!,
    },
    { enabled: !!process.env.NEXT_PUBLIC_STREAM_REGISTRY_TABLE_ID }
  );

  /** ✅ Fetch Stream Info from On-chain (Sui) */
  useEffect(() => {
    const fetchStream = async () => {
      if (!fields?.data || !playbackId) return;

      setIsLoading(true);
      try {
        for (const f of fields.data) {
          const field = await suiClient.getDynamicFieldObject({
            parentId: process.env.NEXT_PUBLIC_STREAM_REGISTRY_TABLE_ID!,
            name: f.name,
          });

          const streamData =
            field?.data?.content && "fields" in field.data.content
              ? (field.data.content as any).fields?.value?.fields
              : null;

          if (streamData?.playback_id === playbackId) {
            setStreamInfo(streamData);
            setIsStreamActive(streamData?.is_active ?? true);
            setStreamEnded(!streamData?.is_active);
            break;
          }
        }
      } catch (err) {
        console.error("Error fetching stream info:", err);
        toast.error("Failed to fetch stream info from chain");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStream();
  }, [fields, playbackId, suiClient]);

  /** ✅ Fetch Messages from Firebase using chatId from streamInfo */
  useEffect(() => {
    if (!streamInfo?.chat_id) return;

    const q = query(
      collection(db, "streams", streamInfo.chat_id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [streamInfo?.chat_id]);

  /** ✅ Fake viewer count fluctuation */
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) =>
        isStreamActive
          ? Math.max(10, prev + Math.floor(Math.random() * 10) - 5)
          : Math.max(0, prev - Math.floor(Math.random() * 15))
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isStreamActive]);

  const user =
    JSON.parse(localStorage.getItem("suifusion_profile")!) || "Guest";

  /** ✅ Send message (local simulation for now) */
  const sendMessage = async () => {
    if (!message.trim()) return;
    if (streamEnded) {
      toast.error("Stream has ended. Cannot send messages.");
      return;
    }
    try {
      await addDoc(
        collection(db, "streams", streamInfo.chat_id as string, "messages"),
        {
          text: message.trim(),
          user: user.name || user,
          timestamp: serverTimestamp(),
        }
      );
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };
  /** ✅ Loading UI */
  if (isLoading || suiLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-400">Loading stream...</p>
        </div>
      </div>
    );
  }

  /** ✅ No Stream Found UI */
  if (!streamInfo) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Stream Not Found</h2>
          <p className="text-gray-400">
            This stream may have ended or doesn’t exist.
          </p>
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

  /** ✅ Main Player UI */
  return (
    <div className="flex flex-1 h-full flex-col lg:flex-row w-full bg-black text-white relative">
      {/* 🎥 Stream Ended Overlay */}
      {streamEnded && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-md px-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-700 flex items-center justify-center">
              <VideoOff size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white">Stream Ended</h2>
            <p className="text-gray-400">
              Thanks for watching! The broadcaster has ended this stream.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary hover:bg-primary/90 mt-4"
            >
              <Home size={16} className="mr-2" />
              Browse Streams
            </Button>
          </div>
        </div>
      )}

      {/* 🎬 Player */}
      <div className="lg:flex-1 flex flex-col p-4 overflow-y-auto">
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

              <Player.LoadingIndicator className="absolute inset-0 flex items-center justify-center bg-black/70">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </Player.LoadingIndicator>

              <Player.ErrorIndicator
                matcher="all"
                className="absolute inset-0 flex items-center justify-center bg-black/90"
              >
                <div className="text-center p-6">
                  <p className="text-red-500 font-semibold mb-2">
                    Stream Unavailable
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    The stream may have ended or is experiencing issues.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Refresh
                  </Button>
                </div>
              </Player.ErrorIndicator>
            </Player.Container>
          </Player.Root>
        </div>

        {/* Stream Info */}
        <div className="mt-4 flex justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {streamInfo?.name || "Live Stream"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {streamInfo?.description || "Watch and chat live!"}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                {streamInfo?.category || "General"}
              </span>
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={16} />
                <span>{viewerCount} watching</span>
              </div>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setOpenTipStreamer(true)}>
            Tip Streamer
          </Button>
        </div>
      </div>

      {/* 💬 Chat */}
      <div className="w-full lg:w-[350px] bg-gray-900/50 border-l border-gray-800 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Live Chat</h3>
          <p className="text-xs text-gray-500 mt-1">
            {messages.length} messages
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] lg:max-h-full overflow-auto">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                  {msg.user?.[0] || "?"}
                </div>
                <div className="flex-1 bg-gray-800/50 p-2.5 rounded-lg">
                  <p className="text-xs font-semibold text-primary">
                    {msg.user}
                  </p>
                  <p className="text-sm text-gray-200 mt-0.5">{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center mt-8">
              No messages yet.
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Input
              placeholder={streamEnded ? "Stream ended" : "Say something..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={streamEnded}
              className="flex-1 bg-gray-800/50 border-gray-700 text-white"
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || streamEnded}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {streamEnded
              ? "Chat disabled"
              : `Chat as Guest_${Math.floor(Math.random() * 1000)}`}
          </p>
        </div>
      </div>
      <TipStreamerModal
        streamId={streamInfo.stream_id}
        streamerAddress={streamInfo.owner}
        streamerName="Streamer"
        open={openTipStreamer}
        setOpen={setOpenTipStreamer}
      />
    </div>
  );
}
