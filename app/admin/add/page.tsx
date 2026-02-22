"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AddDoctorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        city: "",
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("city", formData.city);
            if (photo) data.append("photo", photo);

            const res = await fetch("/api/doctors", {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to add record");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="mb-6">
                <Link href="/admin" className="text-purple-600 hover:text-purple-800 flex items-center text-sm font-medium">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">Add New Doctor Record</h3>
                    <p className="mt-1 text-sm text-neutral-500">Enter doctor details and upload their photo for the World Epilepsy Day portal.</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Doctor Name</label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-neutral-700">City</label>
                            <input
                                type="text"
                                id="city"
                                required
                                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700">Doctor Photo</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md relative group">
                                <div className="space-y-1 text-center">
                                    {preview ? (
                                        <div className="flex flex-col items-center">
                                            <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-full border-4 border-purple-100" />
                                            <button
                                                type="button"
                                                onClick={() => { setPhoto(null); setPreview(null); }}
                                                className="mt-2 text-xs text-red-600 hover:text-red-800"
                                            >
                                                Remove photo
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-12 w-12 text-neutral-400 group-hover:text-purple-500 transition-colors" />
                                            <div className="flex text-sm text-neutral-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-neutral-500">PNG, JPG up to 10MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Doctor Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
