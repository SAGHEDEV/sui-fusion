// app/api/stream/end/[id]/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { streamId: string } }) {
    try {
        const { streamId } = await params;

        const res = await fetch(`https://livepeer.studio/api/stream/${streamId}/terminate`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.LIVEPEER_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: res.status });
        }

        return NextResponse.json({ message: "Stream terminated successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
