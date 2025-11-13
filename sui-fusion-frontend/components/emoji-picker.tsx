"use client";

import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "👏", "🎉", "💯"];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full z-50">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 hover:bg-gray-600 rounded-full"
        title="React"
      >
        <Smile size={18} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-full min-w-[300px] absolute bottom-14 left-0 bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-2xl backdrop-blur-lg"
          >
            <div className="w-full grid grid-cols-4 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onEmojiSelect(emoji);
                    setIsOpen(false);
                  }}
                  className="text-3xl hover:scale-125 transition-transform active:scale-95 p-2 rounded-lg hover:bg-gray-700 z-50"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}