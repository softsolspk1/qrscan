import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function ScanPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const doctor = await db.doctor.findUnique({
        where: { id },
    });

    if (!doctor) {
        notFound();
    }

    // Increment scan count directly in the database (Vercel-safe)
    try {
        await db.doctor.update({
            where: { id },
            data: {
                scans: { increment: 1 },
                lastScanned: new Date(),
            },
        });
    } catch (e) {
        console.error("Scan increment error:", e);
    }

    // Prepare Name - Using the requested "Dear {Name}" format
    const cleanName = doctor.name.replace(/^(Dr\.?\s*)+/i, "").trim();
    const formattedName = `Dear ${cleanName},`;

    return (
        <div className="min-h-screen bg-[#1a0b3a] flex items-center justify-center p-0 lg:p-4 overflow-hidden font-sans">
            {/* 
                Main Card Container 
                Locked to aspect ratio 1715/2228 to match 3.jpg exactly.
            */}
            <div
                className="relative w-full aspect-[1715/2228] max-w-[480px] bg-white overflow-hidden sm:rounded-[40px] shadow-2xl"
                style={{
                    backgroundImage: "url('/3.jpg')",
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                }}
            >
                {/* 
                  1. Doctor Photo Overlay 
                  Verified "Perfect" dimensions.
                */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 top-[11.67%] w-[33.5%] h-[20.8%]"
                >
                    <div className="w-full h-full bg-white rounded-full p-[4px] shadow-sm">
                        <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-white">
                            <Image
                                src={doctor.photoPath || "/placeholder-doctor.jpg"}
                                alt={doctor.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* 
                  2. Personalized Greeting Overlay 
                  Alignment confirmed as perfect at 37.5%.
                  Background strip/mask removed as per user request.
                */}
                <div
                    className="absolute left-0 right-0 top-[37.5%] -translate-y-1/2 px-4 text-center"
                >
                    <div className="relative inline-block">
                        <h2 className="relative z-10 text-white text-[1.1rem] sm:text-[1.25rem] font-bold leading-none tracking-tight">
                            {formattedName}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
