"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export interface User {
    name: string | null,
    id: number,
    admin: boolean,
}
export default function Lobby({ data }: { data: User[] }) {
    const session = useSession();
    return (
        <div className=" flex justify-center items-center min-h-screen" >
            <div className="max-w-[40rem] w-full" >
                <div className="flex flex-col flex-1 gap-2 backdrop-blur-xl border rounded-lg p-3 border-gray-500/20" >
                    <div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20" >
                        <div className="flex gap-2" >
                            Mayank
                        </div>
                    </div>
                    < div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20" >
                        <div className="flex gap-2" >
                            Mayank
                        </div>
                    </div>
                    < div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20" >
                        <div className="flex gap-2" >
                            Mayank
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
