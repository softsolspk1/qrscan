"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Loader2, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Doctor {
    id: string;
    name: string;
    city: string;
}

export default function QRManagementPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await fetch("/api/doctors");
            const data = await res.json();
            setDoctors(data);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selected.length === doctors.length) {
            setSelected([]);
        } else {
            setSelected(doctors.map(d => d.id));
        }
    };

    const downloadQR = async (doctor: Doctor) => {
        const link = document.createElement("a");
        link.href = `/api/qr/${doctor.id}`;
        link.download = `QR-${doctor.name.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadSelected = async () => {
        const toDownload = doctors.filter(d => selected.includes(d.id));
        for (const doc of toDownload) {
            await downloadQR(doc);
            // Small delay to prevent browser issues with multiple downloads
            await new Promise(r => setTimeout(r, 200));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 sm:px-0">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">QR Code Management</h1>
                    <p className="text-sm text-neutral-500 mt-1">Generated QRs redirect to personalized doctor messages.</p>
                </div>
                <div className="flex space-x-3">
                    {selected.length > 0 && (
                        <button
                            onClick={downloadSelected}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Selected ({selected.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="shadow overflow-hidden border-b border-neutral-200 sm:rounded-lg bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                                <button onClick={toggleSelectAll} className="text-neutral-500 hover:text-purple-600">
                                    {selected.length === doctors.length && doctors.length > 0 ? (
                                        <CheckSquare className="h-5 w-5" />
                                    ) : (
                                        <Square className="h-5 w-5" />
                                    )}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Doctor Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Target URL
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-neutral-500">
                                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                                </td>
                            </tr>
                        ) : doctors.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-neutral-500">
                                    No records found. Add doctors first.
                                </td>
                            </tr>
                        ) : (
                            doctors.map((doctor) => (
                                <tr key={doctor.id} className={cn(selected.includes(doctor.id) && "bg-purple-50")}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => toggleSelect(doctor.id)} className="text-neutral-500 hover:text-purple-600">
                                            {selected.includes(doctor.id) ? (
                                                <CheckSquare className="h-5 w-5 text-purple-600" />
                                            ) : (
                                                <Square className="h-5 w-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                        {doctor.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">
                                        /s/{doctor.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => downloadQR(doctor)}
                                            className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download QR
                                        </button>
                                        <a
                                            href={`/s/${doctor.id}`}
                                            target="_blank"
                                            className="text-neutral-400 hover:text-neutral-600 inline-flex items-center"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
