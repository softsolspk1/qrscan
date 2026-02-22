import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const doctor = await db.doctor.update({
            where: { id },
            data: {
                scans: {
                    increment: 1,
                },
                lastScanned: new Date(),
            },
        });

        return NextResponse.json({ success: true, scans: doctor.scans });
    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
