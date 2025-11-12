"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";


async function uploadThumbnail({ file, storagePath }: { file: File, storagePath: string }): Promise<string> {
    if (!file) throw new Error("No file provided");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `stream-thumbnails/${fileName}`;

    console.log("Uploading thumbnail to Supabase at path:", filePath);

    const { data, error } = await supabase.storage
        .from(storagePath)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Supabase upload error:", error);
        throw new Error("Failed to upload thumbnail");
    }

    console.log("Supabase upload data:", data);

    const { data: publicUrlData } = supabase.storage
        .from(storagePath)
        .getPublicUrl(filePath);

    console.log("Supabase public URL data:", publicUrlData);

    return publicUrlData.publicUrl;
}

/**
 * React Query mutation hook for uploading thumbnails.
 */
export function useUploadThumbnail() {
    return useMutation({
        mutationFn: uploadThumbnail,
        onSuccess: (url) => {
            toast.success("Thumbnail uploaded successfully!");
            console.log("Uploaded thumbnail URL:", url);
        },
        onError: (error: any) => {
            console.error("Thumbnail upload failed:", error);
            toast.error(error.message || "Failed to upload thumbnail");
        },
    });
}
