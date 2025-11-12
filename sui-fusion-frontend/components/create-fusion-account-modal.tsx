"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useGetNsFromAddress } from "@/hooks/useGetAddressFromNs";
import { useCreateProfile } from "@/hooks/use-create-profile";
import { useUploadThumbnail } from "@/hooks/use-upload-thumbnail";

const fusionAccountSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username too long")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
    avatar: z.any().optional(), // Make it optional since we track file separately
    walletAddress: z.string().min(10, "Invalid wallet address"),
});

type FusionAccountData = z.infer<typeof fusionAccountSchema>;

interface CreateFusionAccountProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

function CreateFusionAccount({ open, setOpen }: CreateFusionAccountProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const currentAccount = useCurrentAccount();
    const { handleCreateProfile } = useCreateProfile();
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const { mutateAsync: uploadThumbnail, isPending: isUploading } = useUploadThumbnail();

    const { data: suinsData, isLoading } = useGetNsFromAddress(
        currentAccount?.address || "",
        {
            enabled: !!currentAccount?.address
        }
    );

    const form = useForm<FusionAccountData>({
        resolver: zodResolver(fusionAccountSchema),
        defaultValues: {
            username: "",
            avatar: undefined,
            walletAddress: "",
        },
    });

    // Auto-update wallet address when it becomes available
    useEffect(() => {
        if (currentAccount?.address) {
            form.setValue("walletAddress", currentAccount.address);
        }
    }, [currentAccount, form]);

    useEffect(() => {
        if (currentAccount?.address && suinsData) {
            // Pre-fill username if SuiNS name exists
            if (suinsData.name) {
                form.setValue("username", suinsData.name);
            }
        }
    }, [currentAccount?.address, suinsData, form]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
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

            // Set the file in state
            setProfileFile(file);
            
            // Create preview
            const url = URL.createObjectURL(file);
            setPreview(url);
            
            // Update form value (optional since we use profileFile state)
            form.setValue("avatar", file);
        }
    };

    const onSubmit = async (values: FusionAccountData) => {
        // Validate avatar separately before submission
        if (!profileFile) {
            toast.error("Please upload a profile avatar");
            return;
        }

        let thumbnailUrl: string | null = null;
        try {
            thumbnailUrl = await uploadThumbnail({ 
                file: profileFile, 
                storagePath: "profiles" 
            });
            
            if (!thumbnailUrl) {
                toast.error("Failed to upload thumbnail");
                return;
            }
            
            await handleCreateProfile.mutateAsync({
                name: values.username,
                avatarUrl: thumbnailUrl,
            }, {
                onSuccess: () => {
                    localStorage.setItem(
                        "suifusion_profile",
                        JSON.stringify({
                            address: currentAccount?.address,
                            name: values.username,
                            avatar_url: thumbnailUrl,
                            created_at: new Date().toISOString(),
                        })
                    );
                    
                    // Reset and close
                    form.reset();
                    setPreview(null);
                    setProfileFile(null);
                    setOpen(false);
                }
            });
        } catch (err: any) {
            console.error(err);
            toast.error("Error creating profile: " + err.message);
        } finally {
            setOpen(false)
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="sm:max-w-lg rounded-2xl border border-gray-700 backdrop-blur-xl bg-[rgba(20,20,20,0.75)] text-white shadow-[0_0_20px_rgba(0,0,0,0.4)]"
            >
                <DialogTitle className="hidden" />

                <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                        <h3 className="text-3xl font-extrabold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Create Your Fusion Account
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">
                            Upload your avatar and set your gamer identity.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
                            {/* Avatar Upload */}
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={() => (
                                    <FormItem className="flex flex-col items-center">
                                        <FormLabel className="text-gray-300">Profile Avatar</FormLabel>
                                        <FormControl>
                                            <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 border-dashed border-gray-600 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleAvatarChange}
                                                />
                                                {preview ? (
                                                    <Image
                                                        src={preview}
                                                        alt="Avatar Preview"
                                                        width={112}
                                                        height={112}
                                                        className="rounded-full object-cover border border-gray-600"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs text-center">
                                                        Click to upload
                                                    </span>
                                                )}
                                            </div>
                                        </FormControl>
                                        {!profileFile && form.formState.isSubmitted && (
                                            <p className="text-red-500 text-sm">Please upload a profile avatar</p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Username */}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username <span className="text-xs">(Default is your SuiNs if you have one)</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your gamer tag"
                                                {...field}
                                                className="bg-[rgba(255,255,255,0.05)] border border-gray-700 text-white placeholder:text-gray-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Wallet Address */}
                            <FormField
                                control={form.control}
                                name="walletAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wallet Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled
                                                className="bg-[rgba(255,255,255,0.05)] border border-gray-700 text-gray-400"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting || handleCreateProfile.isPending}
                                className="bg-linear-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition duration-300"
                            >
                                {handleCreateProfile.isPending ? "Creating Profile..." : "Create Account"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateFusionAccount;