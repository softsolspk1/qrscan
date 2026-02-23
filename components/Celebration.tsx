"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface CelebrationProps {
    name: string;
}

const AnimatedWords = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
    const words = text.split(" ");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: delay },
        },
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
        hidden: {
            opacity: 0,
            y: 10,
        },
    };

    return (
        <motion.div
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    style={{ marginRight: "0.25em" }}
                    key={index}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default function Celebration({ name }: CelebrationProps) {
    const [isClient, setIsClient] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setIsClient(true);

        const startPlayback = () => {
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.volume = 1.0;
                audioRef.current.play()
                    .then(() => {
                        console.log("Immediate Play SUCCESS");
                        cleanup();
                    })
                    .catch(e => {
                        console.warn("Autoplay blocked, waiting for interaction...");
                    });
            }
        };

        const events = ["click", "touchstart", "mousedown", "keydown", "scroll", "mousemove"];
        const cleanup = () => {
            events.forEach(e => window.removeEventListener(e, startPlayback, true));
        };

        events.forEach(e => window.addEventListener(e, startPlayback, { capture: true, passive: true }));

        // Try every 500ms for the first 2 seconds just in case
        const interval = setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
                clearInterval(interval);
                cleanup();
            } else {
                startPlayback();
            }
        }, 500);

        return () => {
            clearInterval(interval);
            cleanup();
        };
    }, []);

    if (!isClient) return null;

    return (
        <div className="absolute inset-0 z-[40] pointer-events-none">
            {/* 
                Hidden Audio 
                Using autoPlay and preload="auto" for the fastest possible load.
            */}
            <audio
                ref={audioRef}
                src="/sound.mp3"
                loop
                autoPlay
                muted={false}
                preload="auto"
                className="hidden"
            />

            {/* Confetti Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: ["#FFD700", "#FF69B4", "#00BFFF", "#32CD32", "#FF4500", "#FFFFFF"][i % 6],
                            left: `${Math.random() * 100}%`,
                            top: `-10px`,
                        }}
                        animate={{
                            y: ["0vh", "110vh"],
                            x: ["0px", `${(Math.random() - 0.5) * 150}px`],
                            rotate: [0, 360],
                            opacity: [1, 1, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            ease: "linear",
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* ONLY Animated Name Overlay */}
            <div className="absolute left-0 right-0 top-[37.5%] -translate-y-1/2 px-4 text-center pointer-events-auto">
                <AnimatedWords
                    text={name}
                    delay={0.2}
                    className="text-white text-[1.1rem] sm:text-[1.5rem] font-bold leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                />
            </div>

            {/* Burst effect on load */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`burst-${i}`}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: ["#FFF", "#FFD700", "#00BFFF"][i % 3] }}
                        initial={{ scale: 0 }}
                        animate={{
                            scale: [0, 1.5, 0],
                            x: (Math.random() - 0.5) * 400,
                            y: (Math.random() - 0.5) * 400,
                        }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                    />
                ))}
            </div>
        </div>
    );
}
