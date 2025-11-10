import { z } from "zod";

export const fusionAccountSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  avatar: z.string().url("Please upload a valid avatar image URL"),
  walletAddress: z.string().min(10, "Invalid wallet address"),
});

export type FusionAccountData = z.infer<typeof fusionAccountSchema>;
