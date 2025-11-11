import { Livepeer } from "livepeer";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { playbackId: string } }
) {
    const resolvedParams = await params;
    const playbackId = resolvedParams.playbackId;

    const livepeer = new Livepeer({
        apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY!,
    });

    try {
        // Use the specific endpoint for getting stream by playback ID
        const response = await fetch(
            `https://livepeer.studio/api/stream/playback/${playbackId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_API_KEY}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch stream: ${response.statusText}`);
        }

        const stream = await response.json();

        return NextResponse.json({
            id: stream.id,
            name: stream.name,
            streamKey: stream.streamKey,
            playbackId: stream.playbackId,
            playbackUrl: `https://livepeercdn.com/hls/${stream.playbackId}/index.m3u8`,
            createdAt: stream.createdAt,
            isActive: stream.isActive,
        });
    } catch (error: any) {
        console.error("Error fetching stream:", error.message);
        return NextResponse.json(
            { error: "Failed to fetch stream details", details: error.message },
            { status: 500 }
        );
    }
}