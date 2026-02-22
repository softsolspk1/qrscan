import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "World Epilepsy Day | Doctor Portal",
    description: "A tribute to healthcare excellence on World Epilepsy Day",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-neutral-50 dark:bg-neutral-950">
                <main>{children}</main>
            </body>
        </html>
    );
}
