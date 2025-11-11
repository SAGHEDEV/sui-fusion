"use client";

import { useCreateProfile, useCreateStream, useSendTip } from "@/hooks/useSuiFusionContract";
import { Button } from "@/components/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";

export default function TestContract() {
  const account = useCurrentAccount();
  const { mutateAsync: createProfile, isPending: isCreatingProfile } = useCreateProfile();
  const { mutateAsync: createStream, isPending: isCreatingStream } = useCreateStream();
  const { mutateAsync: sendTip, isPending: isSendingTip } = useSendTip();

  const handleTestProfile = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await createProfile({
        name: "Test User",
        avatarUrl: "https://placehold.co/200x200",
      });
    } catch (error: any) {
      toast.error("Failed to create profile: " + error.message);
    }
  };

  const handleTestStream = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await createStream({
        name: "Test Stream",
        description: "This is a test stream",
        playbackId: "test-playback-id",
        playbackUrl: "https://test-stream-url.com",
        chatId: "test-chat-id",
        categories: ["gaming", "fps"],
      });
    } catch (error: any) {
      toast.error("Failed to create stream: " + error.message);
    }
  };

  const handleTestTip = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await sendTip({
        streamId: 1,
        amount: 1000000000, // 1 SUI in MIST
        categories: ["tip", "support"],
      });
    } catch (error: any) {
      toast.error("Failed to send tip: " + error.message);
    }
  };

  if (!account) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
        <p className="text-yellow-200">Please connect your wallet to test the contract</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Test Smart Contract Functions</h3>
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={handleTestProfile} 
          disabled={isCreatingProfile}
          variant="secondary"
        >
          {isCreatingProfile ? "Creating Profile..." : "Test Create Profile"}
        </Button>
        <Button 
          onClick={handleTestStream} 
          disabled={isCreatingStream}
          variant="secondary"
        >
          {isCreatingStream ? "Creating Stream..." : "Test Create Stream"}
        </Button>
        <Button 
          onClick={handleTestTip} 
          disabled={isSendingTip}
          variant="secondary"
        >
          {isSendingTip ? "Sending Tip..." : "Test Send Tip"}
        </Button>
      </div>
    </div>
  );
}