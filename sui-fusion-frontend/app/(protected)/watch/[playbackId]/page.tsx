"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Player from "@livepeer/react/player";
import { getSrc } from "@livepeer/react/external";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Users, Loader2, VideoOff, Home, MessageCircle, X } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { useViewerCount } from "@/hooks/use-viewer-count";
import { FloatingEmoji } from "@/components/floating-emoji";
import { useReactions } from "@/hooks/use-reaction";
import { EmojiPicker } from "@/components/emoji-picker";

export default function WatchStreamPage() {
  const { playbackId } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamEnded, setStreamEnded] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [openTipStreamer, setOpenTipStreamer] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // Mobile chat toggle
  const viewerCount = useViewerCount(streamInfo?.stream_id || "");
  const { reactions, sendReaction } = useReactions(streamInfo?.stream_id || "" as string);

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

  const user = JSON.parse(localStorage.getItem("suifusion_profile")!) || "Guest";

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
            This stream may have ended or doesn't exist.
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
      {/* Stream Ended Overlay */}
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
                onClick={() => router.push("/explore")}
                className="bg-primary hover:bg-primary/90 mt-4"
              >
                <Home size={16} className="mr-2" />
                Browse Streams
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Section - Full width on mobile */}
      <motion.div
        className="flex-1 flex flex-col p-4 overflow-y-auto"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          className="w-full aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black relative"
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
            {!streamEnded && <FloatingEmoji reactions={reactions} />}
            <Player.Container className="z-10 relative">
              <Player.Video className="w-full h-full object-contain inset-0 z-10" />

              {/* Player Controls */}
              <Player.Controls className="w-full flex items-center justify-center flex-col-reverse gap-1 z-20">
                <div className="absolute bottom-0 flex justify-between items-center w-full px-3 pb-2">
                  <div className="flex items-center gap-4">
                    <Player.PlayPauseTrigger className="w-8 h-8 hover:scale-105 transition">
                      <Player.PlayingIndicator asChild matcher={false}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Player.PlayingIndicator>
                      <Player.PlayingIndicator asChild matcher={true}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      </Player.PlayingIndicator>
                    </Player.PlayPauseTrigger>

                    <Player.LiveIndicator className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-semibold text-white">LIVE</span>
                    </Player.LiveIndicator>
                  </div>

                  <div className="flex flex-row-reverse items-center gap-3">
                    <Player.FullscreenTrigger className="w-6 h-6 hover:scale-105 transition">
                      <Player.FullscreenIndicator asChild matcher={false}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </Player.FullscreenIndicator>
                      <Player.FullscreenIndicator asChild>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                        </svg>
                      </Player.FullscreenIndicator>
                    </Player.FullscreenTrigger>

                    <div className="flex items-center gap-2 group">
                      <Player.MuteTrigger className="w-6 h-6 hover:scale-105 transition">
                        <Player.VolumeIndicator asChild matcher={false}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                          </svg>
                        </Player.VolumeIndicator>
                        <Player.VolumeIndicator asChild matcher={true}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                          </svg>
                        </Player.VolumeIndicator>
                      </Player.MuteTrigger>

                      <Player.Volume className="w-16 transition-all duration-200 h-1 bg-white/20 rounded-full cursor-pointer relative">
                        <Player.Track className="bg-white/30 h-full relative w-full">
                          <Player.Range className="bg-primary h-full absolute" />
                        </Player.Track>
                        <Player.Thumb className="w-3 h-3 bg-white rounded-full absolute top-1/2 -translate-y-1/2" />
                      </Player.Volume>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 w-full">
                  <Player.Seek className="w-full h-1 bg-white/90 group cursor-pointer">
                    <Player.Track className="bg-white/30 h-full relative">
                      <Player.SeekBuffer className="absolute h-full bg-white/20" />
                      <Player.Range className="bg-primary h-full absolute" />
                    </Player.Track>
                  </Player.Seek>
                </div>
              </Player.Controls>

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

        {/* Emoji Picker - Better positioned for mobile */}
        {!streamEnded && (
          <div className="fixed bottom-20 left-4 z-50 lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2">
            <EmojiPicker onEmojiSelect={sendReaction} />
          </div>
        )}

        {/* Stream Info */}
        <motion.div
          className="mt-4 flex flex-col lg:flex-row justify-between gap-4"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {streamInfo?.name || "Live Stream"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {streamInfo?.description || "Watch and chat live!"}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
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

          {/* Action Buttons */}
          <div className="flex gap-2 items-start">
            <Button
              className="lg:hidden bg-gray-800 hover:bg-gray-700"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageCircle size={16} className="mr-2" />
              Chat
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setOpenTipStreamer(true)}
            >
              Tip Streamer
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Desktop Chat - Hidden on mobile */}
      <div className="hidden lg:block p-4 lg:p-0 rounded-xl overflow-hidden">
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
              {streamEnded ? "Chat disabled" : `Chat as ${user.name}`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile Chat Sidebar */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-[320px] border-l border-gray-800 bg-black/95 backdrop-blur-md flex flex-col z-50 lg:hidden"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-semibold text-lg">Live Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <motion.div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-8">
                  No messages yet.
                </p>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {msg.user?.[0] || "?"}
                    </div>
                    <div className="flex-1 bg-gray-800/50 p-2.5 rounded-lg">
                      <p className="text-xs font-semibold text-primary">
                        {msg.user}
                      </p>
                      <p className="text-sm text-gray-200 mt-0.5 wrap-break-words">{msg.text}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>

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
                {streamEnded ? "Chat disabled" : `Chat as ${user.name}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when mobile chat is open */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChatOpen(false)}
          />
        )}
      </AnimatePresence>

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