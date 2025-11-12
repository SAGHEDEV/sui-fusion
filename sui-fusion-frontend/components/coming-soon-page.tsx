"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, Rocket } from "lucide-react";

export default function ComingSoon({
    title = "Feature Coming Soon 🚀",
    subtitle = "We're still perfecting this feature. Stay tuned!",
}: {
    title?: string;
    subtitle?: string;
}) {
    return (
        <div className="flex flex-1 h-full flex-col items-center justify-center min-h-[80vh] bg-black text-white text-center p-8">
            {/* Floating icons animation */}
            <div className="relative w-32 h-32 mb-8">
                <motion.div
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/10 border border-primary/30"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Rocket className="w-10 h-10 text-primary" />
                </motion.div>

                <motion.div
                    className="absolute top-0 left-0 text-yellow-400"
                    animate={{
                        y: [0, -10, 0],
                        x: [0, 5, 0],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                    <Sparkles className="w-6 h-6" />
                </motion.div>

                <motion.div
                    className="absolute bottom-0 right-0 text-gray-400"
                    animate={{
                        y: [0, 10, 0],
                        x: [0, -5, 0],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                    <Clock className="w-6 h-6" />
                </motion.div>
            </div>

            {/* Text content */}
            <motion.h1
                className="text-3xl md:text-5xl font-extrabold mb-4 text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {title}
            </motion.h1>

            <motion.p
                className="text-gray-400 max-w-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {subtitle}
            </motion.p>

        </div>
    );
}
