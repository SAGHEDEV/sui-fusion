"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { Copy, Check, Share2, X } from "lucide-react";
import { toast } from "sonner";

interface ShareStreamModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    streamUrl: string;
    streamTitle?: string;
}

const ShareStreamModal = ({ 
    open, 
    setOpen, 
    streamUrl,
    streamTitle = "Live Stream"
}: ShareStreamModalProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(streamUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!", {
                style: {
                    background: "rgba(0, 200, 100, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 255, 120, 0.25)",
                    color: "#00ff88",
                },
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg rounded-2xl border border-gray-700 backdrop-blur-lg bg-[rgba(20,20,20,0.7)] text-white shadow-2xl">
                <DialogTitle className="hidden" />

                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                            <Share2 className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-extrabold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                            Share Stream
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">
                            Share this stream with your friends
                        </p>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <QRCode
                            value={streamUrl}
                            size={200}
                            level="H"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 200 200`}
                        />
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                        Scan this QR code with your phone to open the stream
                    </p>

                    {/* Link Section */}
                    <div className="w-full space-y-3">
                        <label className="text-sm font-medium text-gray-300">
                            Stream Link
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="w-full bg-[rgba(255,255,255,0.05)] border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 overflow-hidden">
                                <p className="truncate max-w-[300px]">{streamUrl}</p>
                            </div>
                            <Button
                                onClick={handleCopyLink}
                                className="bg-primary hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 px-4"
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>Copy</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareStreamModal;