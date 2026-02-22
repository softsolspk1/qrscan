import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get("city");

        const doctors = await db.doctor.findMany({
            where: city ? { city } : {},
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(doctors);
    } catch (error) {
        console.error("GET doctors error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const city = formData.get("city") as string;
        const file = formData.get("photo") as File;

        if (!name || !city) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let photoPath = null;
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const filename = `${crypto.randomUUID()}-${file.name}`;
            const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
            await writeFile(uploadPath, buffer);
            photoPath = `/uploads/${filename}`;
        }

        const doctor = await db.doctor.create({
            data: {
                name,
                city,
                photoPath,
            },
        });

        return NextResponse.json(doctor);
    } catch (error) {
        console.error("POST doctor error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
