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
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUploadThumbnail } from "@/hooks/use-upload-thumbnail";

const goLiveSchema = z.object({
  streamTitle: z.string().min(3, "Title must be at least 3 characters"),
  streamDescription: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
});

type GoLiveValues = z.infer<typeof goLiveSchema>;

export default function CreateStreamPage() {
  const router = useRouter();
  const { mutateAsync: postCreateStream, isPending } = useCreateStream();
  const { handleCreateStreamMutation } = useStreamHooks();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const { mutateAsync: uploadThumbnail, isPending: isUploading } = useUploadThumbnail();

  const form = useForm<GoLiveValues>({
    resolver: zodResolver(goLiveSchema),
    defaultValues: { streamTitle: "", streamDescription: "", category: "" },
  });


  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setThumbnailFile(file);
    }
  };



  const onSubmit = async (values: GoLiveValues) => {
    try {
      // Upload thumbnail first
      let thumbnailUrl = null;
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail({ file: thumbnailFile, storagePath: "thumbnails" });
        if (!thumbnailUrl) {
          toast.error("Failed to upload thumbnail");
          return;
        }
      }

      const res = await postCreateStream(values);
      const stream = res.stream;

      await setDoc(doc(db, "streams", stream.id, "chatInfo", "metadata"), {
        createdAt: serverTimestamp(),
      });

      await handleCreateStreamMutation.mutateAsync({
        name: stream.name,
        description: values.streamDescription,
        playbackId: stream.playbackId,
        playbackUrl: `https://livepeercdn.com/hls/${stream.playbackId}/index.m3u8`,
        streamId: stream.id,
        streamKey: stream.streamKey,
        chatId: stream.id,
        categories: [values.category],
        thumbnailUrl: thumbnailUrl || "", // Add thumbnail URL
      });

      toast.success("Stream created successfully!");
      router.push(`/live/${stream.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Error creating stream: " + err.message);
    }
  };



  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        easing: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="flex-1 h-full bg-black flex items-center justify-center text-white pt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-[#111318] p-10 rounded-xl border border-gray-800 w-full max-w-xl shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          className="text-2xl font-bold mb-6 text-primary"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          🎥 Go Live
        </motion.h1>

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants}>
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
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="streamDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's your stream about?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormItem>

                <FormLabel>Thumbnail</FormLabel>
                {!previewUrl ? (
                  <div
                    className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:bg-primary/5 transition cursor-pointer"
                    onClick={() =>
                      document.getElementById("thumbnailInput")?.click()
                    }
                  >

                    <input
                      id="thumbnailInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                    <p className="text-sm">Click to upload thumbnail</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                ) : (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-700 group">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setPreviewUrl(null);
                          (
                            document.getElementById(
                              "thumbnailInput"
                            ) as HTMLInputElement
                          ).value = "";
                        }}
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setPreviewUrl(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </FormItem>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  type="submit"
                  disabled={isPending || handleCreateStreamMutation.isPending || isUploading}
                  className="w-full bg-primary hover:bg-primary/90 transition-all"
                >
                  {isUploading
                    ? "Uploading thumbnail..."
                    : isPending
                      ? "Setting up..."
                      : handleCreateStreamMutation.isPending
                        ? "Awaiting transaction approval..."
                        : "Go Live 🚀"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        </Form>
      </motion.div>
    </motion.div>
  );
}
