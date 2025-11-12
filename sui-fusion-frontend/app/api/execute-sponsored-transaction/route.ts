// app/api/execute-sponsored-transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnokiClient } from "@mysten/enoki";

const enokiClient = new EnokiClient({
    apiKey: process.env.NEXT_PUBLIC_ENOKI_PRIVATE_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { digest, signature } = await req.json();

        if (!digest || !signature) {
            return NextResponse.json(
                { error: "Missing digest or signature" },
                { status: 400 }
            );
        }

        // Execute the sponsored transaction with user's signature
        const result = await enokiClient.executeSponsoredTransaction({
            digest,
            signature,
        });

        return NextResponse.json({ 
            result: {
                digest: result.digest,
            }
        });
    } catch (error: any) {
        console.error("Execution error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to execute transaction" },
            { status: 500 }
        );
    }
}