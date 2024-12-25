"use client";

import Link from "next/link";
import { FiSearch, FiUser, FiBell } from "react-icons/fi";

const mockGroups = [
    {
        id: 1,
        name: "모임1",
        members: 4,
        recentActivity: "최근 활동 10분 전",
        color: "border-purple-500",
        backgroundColor: "bg-white text-black",
    },
    {
        id: 2,
        name: "모임2",
        members: 3,
        recentActivity: "최근 활동 20분 전",
        color: "border-transparent",
        backgroundColor: "bg-purple-500 text-white",
    },
    {
        id: 3,
        name: "모임3",
        members: 3,
        recentActivity: "최근 활동 30분 전",
        color: "border-transparent",
        backgroundColor: "bg-purple-500 text-white",
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">모임</h1>
                <div className="flex gap-4 items-center">
                    <button className="p-2">
                        <FiSearch size={24} className="text-gray-600" />
                    </button>
                    <button className="p-2">
                        <FiUser size={24} className="text-gray-600" />
                    </button>
                    <button className="p-2">
                        <FiBell size={24} className="text-gray-600" />
                    </button>
                </div>
            </header>

            {/* 모임 Section */}
            <section>
                <h2 className="text-gray-500 mb-4">
                    내 모임 <span className="text-blue-500">+2</span>
                </h2>
                <div className="flex flex-col gap-4">
                    {mockGroups.map((group) => (
                        <Link
                            href={`/moim/${group.id}`}
                            key={group.id}
                            className={`flex justify-between items-center p-4 rounded-lg shadow-md border ${group.color} ${group.backgroundColor}`}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{group.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex">
                                        {Array.from({ length: group.members }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className="w-6 h-6 bg-black rounded-full -ml-2 border-2 border-white"
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="text-sm">{group.members}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-400">{group.recentActivity}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Add Moim Button */}
            <div className="absolute bottom-4 right-4">
                <button
                    className="bg-purple-500 text-white text-base font-semibold px-6 py-3 rounded-full shadow-lg flex items-center justify-center">
                    + 모임 추가
                </button>
            </div>
        </div>
    );
}