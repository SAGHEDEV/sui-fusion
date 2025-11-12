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
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import TipStreamerModal from "@/components/tip-streamer-modal";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added for animations

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

  if (isLoading || suiLoading) {
    return (
      <motion.div
        className="flex items-center justify-center w-full h-screen bg-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ y: [10, 0, 10] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-400">Loading stream...</p>
        </motion.div>
      </motion.div>
    );
  }

  if (!streamInfo) {
    return (
      <motion.div
        className="flex items-center justify-center w-full h-screen bg-black text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Stream Not Found
          </motion.h2>
          <motion.p
            className="text-gray-400"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            This stream may have ended or doesn’t exist.
          </motion.p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 bg-primary hover:bg-primary/90"
          >
            <Home size={16} className="mr-2" />
            Go Home
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-1 h-full flex-col lg:flex-row w-full bg-black text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🎥 Stream Ended Overlay */}
      <AnimatePresence>
        {streamEnded && (
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center space-y-6 max-w-md px-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto rounded-full bg-gray-700 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <VideoOff size={48} />
              </motion.div>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎬 Player */}
      <motion.div
        className="lg:flex-1 flex flex-col p-4 overflow-y-auto"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          className="w-full h-full aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black"
          whileHover={{ scale: 1.01 }}
        >
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
                <motion.div
                  className="text-center p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
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
                </motion.div>
              </Player.ErrorIndicator>
            </Player.Container>
          </Player.Root>
        </motion.div>

        {/* Stream Info */}
        <motion.div
          className="mt-4 flex justify-between"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
                <motion.span
                  key={viewerCount}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewerCount} watching
                </motion.span>
              </div>
            </div>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setOpenTipStreamer(true)}
          >
            Tip Streamer
          </Button>
        </motion.div>
      </motion.div>

      {/* 💬 Chat */}
      <div className="p-4 lg:p-0 rounded-xl overflow-hidden">
      <motion.div
        className="w-full lg:w-[350px] bg-gray-900/50 border-l border-gray-800 flex flex-col min-h-screen lg:min-h-[600px] h-screen lg:h-full"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Live Chat</h3>
          <p className="text-xs text-gray-500 mt-1">{messages.length} messages</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
          <div className="flex flex-col gap-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <motion.div
          key={msg.id}
          className="flex items-start gap-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
            >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
            {msg.user?.[0] || "?"}
          </div>
          <div className="flex-1 bg-gray-800/50 p-2.5 rounded-lg">
            <p className="text-xs font-semibold text-primary">
              {msg.user}
            </p>
            <p className="text-sm text-gray-200 mt-0.5">{msg.text}</p>
          </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-8">
            No messages yet.
          </p>
        )}
          </div>
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
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || streamEnded}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Send size={16} />
          </Button>
        </motion.div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
        {streamEnded
          ? "Chat disabled"
          : `Chat as ${user.name}`}
          </p>
        </div>
      </motion.div>
      </div>

      <TipStreamerModal
        streamId={streamInfo.stream_id}
        streamerAddress={streamInfo.owner}
        streamerName="Streamer"
        open={openTipStreamer}
        setOpen={setOpenTipStreamer}
      />
    </motion.div>
  );
}
