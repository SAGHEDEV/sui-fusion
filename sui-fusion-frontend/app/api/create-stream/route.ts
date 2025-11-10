// app/api/create-stream/route.ts
import { NextResponse } from "next/server";
import { Livepeer } from "livepeer";

const livepeer = new Livepeer({
  apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, record } = body;

    // Create a new stream on Livepeer
    const stream = await livepeer.stream.create({
      name: name || "SuiFusion Stream",
      record: record ?? true,
      profiles: [
        {
          name: "720p",
          width: 1280,
          height: 720,
          bitrate: 3000000,
          fps: 30,
          quality: 23,
        },
        {
          name: "480p",
          width: 854,
          height: 480,
          bitrate: 1600000,
          fps: 30,
          quality: 23,
        },
      ],
    });

    return NextResponse.json(stream, { status: 200 });
  } catch (error: any) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create stream" },
      { status: 500 }
    );
  }
}
