import { Livepeer } from "livepeer";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { streamId: string } }
) {
    const resolvedParams = await params;
    const streamId = resolvedParams.streamId;

    const livepeer = new Livepeer({
        apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY!,
    });

    console.log("Fetching stream info for:", streamId);

    try {
        // Try to get by stream ID first
        let streamInfo;
        try {
            streamInfo = await livepeer.stream.get(streamId);
        } catch (err) {
            // If that fails, try to get all streams and find by playbackId
            const allStreams = await livepeer.stream.getAll();
            const stream = allStreams.data?.find(
                (s) => s.playbackId === streamId || s.id === streamId
            );
            
            if (!stream) {
                throw new Error("Stream not found");
            }
            
            streamInfo = { stream };
        }

        console.log("Stream found:", streamInfo.stream?.name);

        return NextResponse.json({
            id: streamInfo.stream?.id,
            name: streamInfo.stream?.name,
            streamKey: streamInfo.stream?.streamKey,
            playbackId: streamInfo.stream?.playbackId,
            playbackUrl: `https://livepeercdn.com/hls/${streamInfo.stream?.playbackId}/index.m3u8`,
            createdAt: streamInfo.stream?.createdAt,
            isActive: streamInfo.stream?.isActive, // Add this for stream end detection
        });
    } catch (error: any) {
        console.error("Error fetching stream:", error.message);
        return NextResponse.json(
            { error: "Failed to fetch stream details", details: error.message },
            { status: 500 }
        );
    }
}