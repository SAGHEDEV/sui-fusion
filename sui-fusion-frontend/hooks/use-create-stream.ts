import { useCreateStream as useCreateStreamContract } from "./useSuiFusionContract";
import http from "@/lib/http";
import { useMutation } from "@tanstack/react-query";

interface StreamPayload {
    streamTitle: string;
    streamDescription: string;
    category: string;
    thumbnail?: File;
}

export const useCreateStream = () => {
  const { mutateAsync: createStreamOnChain } = useCreateStreamContract();
  
  return useMutation({
    mutationFn: async (payload: StreamPayload) => {
      // First create the stream on Livepeer
      const body = {
        name: payload.streamTitle,
        record: true,
      };

      const { data: livepeerData } = await http.post("/api/create-stream", body);
      
      // Then create the stream on-chain
      if (livepeerData?.stream?.id && livepeerData?.stream?.playbackId) {
        await createStreamOnChain({
          name: payload.streamTitle,
          description: payload.streamDescription,
          playbackId: livepeerData.stream.playbackId,
          playbackUrl: `https://livepeercdn.com/hls/${livepeerData.stream.playbackId}/index.m3u8`,
          chatId: livepeerData.stream.id, // Using stream ID as chat ID for now
          categories: [payload.category],
        });
      }
      
      return livepeerData;
    },
  });
};
