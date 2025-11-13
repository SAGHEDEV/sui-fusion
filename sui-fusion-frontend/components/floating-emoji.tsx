// components/floating-emoji.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Reaction {
    id: string;
    emoji: string;
    x: number;
}

interface FloatingEmojiProps {
    reactions: Reaction[];
}

export function FloatingEmoji({ reactions }: FloatingEmojiProps) {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <AnimatePresence>
                {reactions.map((reaction) => (
                    <motion.div
                        key={reaction.id}
                        initial={{
                            bottom: "20%",
                            left: "50%",
                            x: "-50%",
                            opacity: 1,
                            scale: 0.3
                        }}
                        animate={{
                            bottom: "120%",
                            left: ["50%", `${45 + Math.random() * 10}%`], // Slight drift
                            opacity: [1, 1, 0.8, 0],
                            scale: [0.3, 1, 1.3, 1.5],
                            rotate: [0, -12, 12, -8, 0],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                            duration: 3,
                            ease: "easeOut",
                        }}
                        className="absolute text-6xl drop-shadow-2xl z-50"
                    >
                        {reaction.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}