// app/api/sponsor-transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnokiClient } from "@mysten/enoki";

const enokiClient = new EnokiClient({
    apiKey: process.env.NEXT_PUBLIC_ENOKI_PRIVATE_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { transactionKindBytes, sender, network } = await req.json();

        if (!transactionKindBytes || !sender || !network) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Whitelist allowed move call targets for your app
        const allowedTargets = [
            `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::create_profile`,
            `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::create_stream`,
            `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::end_stream`,
            `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suifusion_contract::send_tip`,
        ];

        // Create sponsored transaction with allowed targets
        const sponsoredResponse = await enokiClient.createSponsoredTransaction({
            network: network as "mainnet" | "testnet",
            transactionKindBytes,
            sender,
            // Specify allowed targets in the API call (not portal)
            allowedMoveCallTargets: allowedTargets,
            // Dynamically allow this specific sender
            allowedAddresses: [sender],
        });

        return NextResponse.json({
            digest: sponsoredResponse.digest,
            bytes: sponsoredResponse.bytes,
        });
    } catch (error: any) {
        console.error("Sponsorship error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to sponsor transaction" },
            { status: 500 }
        );
    }
}