import { Livepeer } from "livepeer";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { playbackId: string } }
) {
    const resolvedParams = await params;

    const playbackId = resolvedParams.playbackId;

    const livepeer = new Livepeer({
        apiKey: process.env.LIVEPEER_API_KEY!,
    });

    try {
        const playbackInfo = await livepeer.playback.get(playbackId);
        // console.log(playbackInfo.playbackInfo?.meta.source);

        return NextResponse.json({
            name: (playbackInfo?.playbackInfo?.meta as { name?: string })?.name || "Live Stream",
            description: (playbackInfo?.playbackInfo?.meta as { description?: string })?.description || "No description available",
            playbackUrl: `https://livepeercdn.com/hls/${playbackId}/index.m3u8`,
            createdAt: playbackInfo?.playbackInfo?.meta.attestation?.createdAt || null,
            meta: playbackInfo.playbackInfo?.meta || {},
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch stream details" },
            { status: 500 }
        );
    }
}
