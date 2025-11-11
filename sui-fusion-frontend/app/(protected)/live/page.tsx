"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStream, useStreamHooks } from "@/hooks/use-create-stream";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const goLiveSchema = z.object({
  streamTitle: z.string().min(3, "Title must be at least 3 characters"),
  streamDescription: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
});

type GoLiveValues = z.infer<typeof goLiveSchema>;

export default function CreateStreamPage() {
  const router = useRouter();
  const { mutateAsync: postCreateStream, isPending } = useCreateStream();
  const { handleCreateStreamMutation } = useStreamHooks()

  const form = useForm<GoLiveValues>({
    resolver: zodResolver(goLiveSchema),
    defaultValues: { streamTitle: "", streamDescription: "", category: "" },
  });

  const onSubmit = async (values: GoLiveValues) => {
    try {
      const res = await postCreateStream(values);
      const stream = res.stream;

      // Create chat for the stream in Firestore
      await setDoc(doc(db, "streams", stream.id, "chatInfo", "metadata"), {
        createdAt: serverTimestamp(),
      });

      console.log(stream)

      await handleCreateStreamMutation.mutateAsync({
        name: stream.name,
        description: values.streamDescription,
        playbackId: stream.playbackId,
        playbackUrl: `https://livepeercdn.com/hls/${stream.playbackId}/index.m3u8`,
        streamId: stream.id,
        streamKey: stream.streamKey,
        chatId: stream.id,
        categories: [values.category],
      });

      toast.success("Stream created and chat initialized!");
      router.push(`/live/${stream.id}`);
    } catch (err: any) {
      console.log(err)
      toast.error("Error creating stream: " + err.message);
    }
  };


  return (
    <div className="flex-1 h-full bg-black flex items-center justify-center text-white">
      <div className="bg-[#111318] p-10 rounded-xl border border-gray-800 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-primary">🎥 Go Live</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="streamTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your stream title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="streamDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What's your stream about?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fps">FPS</SelectItem>
                      <SelectItem value="moba">MOBA</SelectItem>
                      <SelectItem value="rpg">RPG</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending || handleCreateStreamMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {(isPending || handleCreateStreamMutation.isPending) ? "Setting up..." : "Go Live 🚀"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
