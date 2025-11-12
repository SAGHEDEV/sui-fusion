"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import type { SuiParsedData } from "@mysten/sui/client";
import ShareStreamModal from "@/components/share-stream-modal";
import { getIngest } from "@livepeer/react/external";
import { useStreamHooks } from "@/hooks/use-create-stream";
import TipCard from "@/components/miscellaneous/tip-card";
import { useViewerCount } from "@/hooks/use-viewer-count";

function BroadcastStatus({
  __scopeBroadcast,
}: Broadcast.BroadcastScopedProps<{}>) {
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

function EndStreamButton({
  onEnd,
  streamId,
  __scopeBroadcast,
}: {
  onEnd: () => void;
  streamId: string;
} & Broadcast.BroadcastScopedProps<{}>) {
  const [endStreamLoading, setEndStreamLoading] = useState(false);
  const context = useBroadcastContext("EndStreamButton", __scopeBroadcast);
  const { handleEndStreamMutation } = useStreamHooks();

  const handleEndStream = async () => {
    try {
      setEndStreamLoading(true);
      const currentState = context.store.getState();
      const mediaStream = currentState.mediaStream;
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());

      context.store.setState({ enabled: false, mediaStream: null });
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetch(`/api/stream/end/${streamId}`, { method: "POST" });
      await handleEndStreamMutation.mutateAsync({ streamId });

      onEnd();
      toast.success("Stream ended successfully!");
    } catch (err) {
      console.error("Error ending stream:", err);
      toast.error("Failed to end stream.");
    } finally {
      setEndStreamLoading(false);
    }
  };

  return (
    <Button
      disabled={endStreamLoading}
      variant="destructive"
      size="sm"
      onClick={handleEndStream}
    >
      {!endStreamLoading ? "End Stream" : "Ending stream..."}
    </Button>
  );
}

export default function BroadcastPage() {
  const { streamId } = useParams();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [openShareStream, setOpenShareStream] = useState(false);
  const viewerCount = useViewerCount(streamId as string || "")
  const {
    data: streamObject,
    isLoading,
    isError,
  } = useSuiClientQuery(
    "getDynamicFieldObject",
    {
      parentId: process.env.NEXT_PUBLIC_STREAM_REGISTRY_TABLE_ID!,
      name: { type: "0x1::string::String", value: streamId },
    },
    { enabled: !!streamId }
  );

  const streamFields = streamObject?.data?.content as
    | Extract<SuiParsedData, { dataType: "moveObject" }>
    | undefined;
  const streamField = streamFields?.fields as any | undefined;
  const streamData = streamField?.value?.fields;

  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, "streams", streamId as string, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [streamId]);


  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "streams", streamId as string, "messages"), {
        text: newMessage,
        user: "Streamer",
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  }

  useEffect(() => {
    if (isError) {
      toast.error("Stream not found or registry inaccessible.");
      router.push("/live");
    }
  }, [isError, router]);

  if (isLoading || !streamData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading stream info...
      </div>
    );
  }

  return (
    <>
      <Broadcast.Root ingestUrl={getIngest(streamData.stream_key)} audio>
        <BroadcastStatus />

        {/* Main Section */}
        <motion.div
          className="flex flex-col gap-4 h-full bg-black text-white relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-500 shrink-0"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="font-bold text-lg flex items-center gap-2">
              🎬 {streamData.name}
              <Broadcast.EnabledIndicator matcher={true}>
                <span className="text-green-500 text-sm animate-pulse">
                  LIVE
                </span>
              </Broadcast.EnabledIndicator>
              <Broadcast.EnabledIndicator matcher={false}>
                <span className="text-gray-500 text-sm">PREVIEW</span>
              </Broadcast.EnabledIndicator>
            </h1>

            <motion.div className="flex gap-2" whileHover={{ scale: 1.03 }}>
              <div className="px-4 py-2 rounded-md">
                {viewerCount.toLocaleString()} viewers
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenShareStream(true)}
              >
                <Share2 size={16} className="mr-1" /> Share
              </Button>
              <EndStreamButton
                streamId={streamData.stream_id}
                onEnd={() => router.push("/live")}
              />
            </motion.div>
          </motion.div>

          {/* Broadcast Container */}
          <motion.div
            className="relative bg-black flex justify-center items-center max-h-full h-fit mt-8 p-10 pb-20"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Broadcast.Container className="relative max-h-[800px] h-full w-auto m-auto bg-blue-700/10 rounded-lg overflow-hidden flex items-center justify-center p-4 shadow-lg shadow-primary/10">
              <Broadcast.Video
                className="w-auto h-full object-contain rounded-xl m-auto"
                width={1000}
                height={800}
              />
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
          </motion.div>

          {/* Animated Chat Panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat"
                className="fixed right-0 top-0 bottom-0 w-[320px] border-l border-gray-800 bg-black/70 backdrop-blur-md flex flex-col p-4 z-10"
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="flex justify-between items-center mb-3">
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
                  className="flex-1 overflow-y-auto space-y-3 custom-scrollbar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center mt-8">
                      No messages yet. Be the first!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm bg-white/10 px-3 py-2 rounded-lg w-fit max-w-[90%]"
                      >
                        <span className="font-semibold text-blue-300">
                          {msg.user}:{" "}
                        </span>
                        <span>{msg.text}</span>
                      </motion.div>
                    ))
                  )}
                </motion.div>

                <form onSubmit={sendMessage} className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-gray-900 text-sm px-3 py-2 rounded-lg border border-gray-700"
                  />
                  <Button size="sm" variant="secondary" type="submit">
                    Send
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 px-6 py-3 rounded-2xl border border-gray-700 backdrop-blur-sm z-10"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Broadcast.EnabledTrigger>
              <Button className="bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-2">
                <Broadcast.EnabledIndicator matcher={false}>
                  🎥 Go Live
                </Broadcast.EnabledIndicator>
                <Broadcast.EnabledIndicator matcher={true}>
                  ⏹ Stop Live
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
          </motion.div>
        </motion.div>
      </Broadcast.Root>

      {/* Tips Section */}
      <motion.div
        className="w-full p-4 flex flex-col gap-4 mt-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.7 }}
      >
        <div className="w-full p-5 rounded-lg bg-black/50 flex flex-col gap-4 border-t border-gray-800">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            About Stream:
          </h2>
          <p className="text-gray-400 text-sm">{streamData.description}</p>
        </div>

        <div className="w-full p-5 rounded-lg bg-black/50 flex flex-col gap-4 border-t border-gray-800">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            💸 Tips Received
          </h2>

          {!streamData?.tips || streamData.tips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm">
                No tips yet — your supporters are probably getting their SUI
                ready 👀
              </p>
            </div>
          ) : (
            <motion.div
              className="max-h-64 overflow-y-auto pr-1 custom-scrollbar w-full grid gap-3 grid-cols-3 items-center justify-center"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
              initial="hidden"
              animate="visible"
            >
              {streamData.tips.map((tip: any, i: number) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <TipCard tip={tip} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <ShareStreamModal
          open={openShareStream}
          setOpen={setOpenShareStream}
          streamUrl={`${window.location.origin}/watch/${streamData.playback_id}`}
          streamTitle={streamData.name}
        />
      </motion.div>
    </>
  );
}
