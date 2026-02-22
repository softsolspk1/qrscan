import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import sharp from "sharp";
import QRCode from "qrcode";
import path from "path";
import fs from "fs/promises";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const doctor = await db.doctor.findUnique({
            where: { id },
        });

        if (!doctor) return new NextResponse("Not Found", { status: 404 });

        // 1. Load Background Template
        const templatePath = path.join(process.cwd(), "qrscan.jpg");
        const templateBuffer = await fs.readFile(templatePath);

        // 2. Generate QR Code for the scan URL
        const scanUrl = `${new URL(request.url).origin}/s/${doctor.id}`;
        const qrBuffer = await QRCode.toBuffer(scanUrl, {
            margin: 1,
            width: 220, // Perfectly sized for the 275x269 frame on the 1600x732 template
            color: {
                dark: "#ffffff",
                light: "#00000000",
            }
        });

        // 3. Composite QR onto Template
        const image = await sharp(templateBuffer)
            .composite([
                {
                    input: qrBuffer,
                    left: 871, // Precisely centered within the frame at 844-1119
                    top: 240,  // Precisely centered within the frame at 216-485
                }
            ])
            .png()
            .toBuffer();

        return new NextResponse(image as any, {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": `attachment; filename="QR-${doctor.name.replace(/\s+/g, "_")}.png"`,
            },
        });
    } catch (error) {
        console.error("QR Generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
