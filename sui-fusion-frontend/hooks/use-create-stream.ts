import http from "@/lib/http";
import { useMutation } from "@tanstack/react-query";

interface StreamPayload {
    streamTitle: string;
    streamDescription: string;
    category: string;
    thumbnail?: File;
}

export const useCreateStream = () => {
  return useMutation({
    mutationFn: async (payload: StreamPayload) => {
      const body = {
        name: payload.streamTitle,
        record: true,
      };

      const { data } = await http.post("/api/create-stream", body);
      return data;
    },
  });
};
