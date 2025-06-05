"use client"
import { useState } from "react";
import createRoom from "../action/homeActions"

export default function Home() {
    const [arenaCode, setArenaCode] = useState("");
    return (
        < div className="w-full h-full flex flex-col justify-center min-h-screen items-center" >
            <div className="w-full max-w-[35rem] flex flex-col p-6 items-center justify-center" >
                <h1 className="text-7xl my-8 kanit-black ">LUDO QUEEN</h1>
                <div className="flex flex-col gap-2 w-full rounded-md" >
                    <input type="text" placeholder="Room Code Here" value={arenaCode} onChange={(e) => setArenaCode(e.target.value)
                    } className="w-full text-center outline-none bg-transparent  border-b p-2" />
                    <button
                        className={`relative bg-black text-white border border-gray-500/20 transition-200 my-2 px-4 py-3 rounded-lg flex-1`}>
                        Join Arena
                    </button>
                </div>
                < div className="parition bg-gray-800 h-[2px] w-[80px] my-[2px]" >
                </div>
                < button onClick={createRoom}
                    className={`relative text-white w-full bg-black border border-gray-500/20 rounded-xl transition-200 my-2 px-4 py-3`}>
                    Create Arena
                </button>
            </div>
        </div>
    )
}
