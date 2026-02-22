"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { Search, MapPin, Eye, Trash2, Plus } from "lucide-react";

interface Doctor {
    id: string;
    name: string;
    city: string;
    scans: number;
    lastScanned: string | null;
    createdAt: string;
}

export default function AdminDashboard() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");

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

    const deleteDoctor = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        try {
            await fetch(`/api/doctors/${id}`, { method: "DELETE" });
            setDoctors(doctors.filter(d => d.id !== id));
        } catch (error) {
            alert("Failed to delete record");
        }
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(search.toLowerCase());
        const matchesCity = cityFilter === "" || doctor.city === cityFilter;
        return matchesSearch && matchesCity;
    });

    const cities = Array.from(new Set(doctors.map(d => d.city)));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 sm:px-0">
                <h1 className="text-2xl font-semibold text-neutral-900">Doctor Records</h1>
                <Link
                    href="/admin/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Record
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 px-4 sm:px-0">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-neutral-400" />
                    </div>
                    <select
                        className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-neutral-200 sm:rounded-lg bg-white">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Doctor Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            City
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Scans
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Last Scan
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500">
                                                Loading records...
                                            </td>
                                        </tr>
                                    ) : filteredDoctors.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500">
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDoctors.map((doctor) => (
                                            <tr key={doctor.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-neutral-900">{doctor.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-neutral-500">{doctor.city}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                        doctor.scans > 0 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-800"
                                                    )}>
                                                        {doctor.scans}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                    {doctor.lastScanned ? formatDate(new Date(doctor.lastScanned)) : "Never"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                    <Link href={`/s/${doctor.id}`} target="_blank" className="text-purple-600 hover:text-purple-900 inline-flex items-center">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Preview
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteDoctor(doctor.id)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
