"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSendTip } from "@/hooks/use-send-tip";

interface TipStreamerModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    streamerAddress: string;
    streamerName: string;
    streamId: string;
    onTipSent?: () => void;
}

const PREDEFINED_AMOUNTS = [
    { value: 1, label: "1 SUI" },
    { value: 5, label: "5 SUI" },
    { value: 10, label: "10 SUI" },
    { value: 25, label: "25 SUI" },
    { value: 50, label: "50 SUI" },
    { value: 100, label: "100 SUI" },
];

const TipStreamerModal = ({
    open,
    setOpen,
    streamerAddress,
    streamerName,
    streamId,
    onTipSent,
}: TipStreamerModalProps) => {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [isSending, setIsSending] = useState(false);

    const { mutateAsync: sendTip, isPending: sendTipPending } = useSendTip()

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

    const handleSendTip = async () => {
        if (!finalAmount || finalAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        setIsSending(true);
        try {
            await sendTip({ streamId, amount: finalAmount });
            toast.success(`Successfully tipped ${finalAmount} SUI! 🎉`, {
                style: {
                    background: "rgba(0, 200, 100, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 255, 120, 0.25)",
                    color: "#00ff88",
                },
            });

            // Reset state
            setSelectedAmount(null);
            setCustomAmount("");
            setOpen(false);

            // Call callback if provided
            onTipSent?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to send tip");
        } finally {
            setIsSending(false);
        }
    };

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount(""); // Clear custom amount when selecting predefined
    };

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value);
        setSelectedAmount(null); // Clear selected amount when typing custom
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg rounded-2xl border border-gray-700 backdrop-blur-lg bg-[rgba(20,20,20,0.7)] text-white shadow-2xl">
                <DialogTitle className="hidden" />

                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    disabled={(isSending || sendTipPending)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                            <Coins className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-extrabold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                            Tip Streamer
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">
                            Support <span className="text-primary font-semibold">{streamerName}</span> with a tip
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatAddress(streamerAddress)}
                        </p>
                    </div>

                    {/* Predefined Amount Cards */}
                    <div className="w-full">
                        <label className="text-sm font-medium text-gray-300 mb-3 block">
                            Select Amount
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {PREDEFINED_AMOUNTS.map((amount) => (
                                <button
                                    key={amount.value}
                                    onClick={() => handleAmountSelect(amount.value)}
                                    disabled={(isSending || sendTipPending)}
                                    className={`
                                        relative py-4 px-3 rounded-lg border-2 transition-all
                                        flex flex-col items-center justify-center gap-1
                                        hover:scale-105 active:scale-95
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                        ${selectedAmount === amount.value
                                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                            : "border-gray-700 bg-[rgba(255,255,255,0.03)] hover:border-primary/50"
                                        }
                                    `}
                                >
                                    <Coins
                                        className={`w-5 h-5 ${selectedAmount === amount.value
                                            ? "text-primary"
                                            : "text-gray-400"
                                            }`}
                                    />
                                    <span
                                        className={`text-sm font-bold ${selectedAmount === amount.value
                                            ? "text-primary"
                                            : "text-white"
                                            }`}
                                    >
                                        {amount.label}
                                    </span>
                                    {selectedAmount === amount.value && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-700"></div>
                        <span className="text-xs text-gray-500 uppercase">or</span>
                        <div className="flex-1 h-px bg-gray-700"></div>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="w-full space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Custom Amount
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="Enter custom amount"
                                value={customAmount}
                                onChange={(e) => handleCustomAmountChange(e.target.value)}
                                disabled={(isSending || sendTipPending)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-gray-700 text-white placeholder:text-gray-500 pr-12 focus:border-primary"
                                min="0"
                                step="0.1"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                SUI
                            </span>
                        </div>
                    </div>

                    {/* Total Display */}
                    {finalAmount && finalAmount > 0 && (
                        <div className="w-full bg-primary/10 border border-primary/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Total Amount:</span>
                                <span className="text-2xl font-bold text-primary">
                                    {finalAmount} SUI
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Send Tip Button */}
                    <Button
                        onClick={handleSendTip}
                        disabled={!finalAmount || finalAmount <= 0 || (isSending || sendTipPending)}
                        className="w-full bg-linear-to-r from-primary to-secondary text-white font-semibold py-6 rounded-lg hover:opacity-90 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {(isSending || sendTipPending) ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Sending Tip...
                            </>
                        ) : (
                            <>
                                <Coins className="w-5 h-5 mr-2" />
                                Send {finalAmount || 0} SUI Tip
                            </>
                        )}
                    </Button>

                    {/* Info Text */}
                    <p className="text-xs text-center text-gray-500 max-w-sm">
                        Tips are sent directly to the streamer's wallet. Transaction fees may apply.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TipStreamerModal;