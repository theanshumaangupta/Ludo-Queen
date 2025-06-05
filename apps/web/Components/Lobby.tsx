"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RoomDataType } from "../app/(route)/room/[token]/page";
export default function Lobby({ roomData }: { roomData: RoomDataType }) {
  return (
    <div className=" flex justify-center items-center min-h-screen">
      <div className="max-w-[40rem] w-full">
        <div className="flex flex-col flex-1 gap-2 backdrop-blur-xl border rounded-lg p-3 border-gray-500/20">
          <div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20">
            <div className="flex gap-2">
              {roomData.host?.name.toLocaleUpperCase()} (HOST)
            </div>
          </div>

          {roomData.host?.name !== roomData.client?.name && (
            <div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20">
              <div className="flex gap-2">
                {roomData.client?.name.toLocaleUpperCase()}
              </div>
            </div>
          )}
          {roomData.arenaDetailsList.map((e : any) => {
            if(e.player.id==roomData?.host?.id)return

            return (
              (<div key={e} className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20">
                <div className="flex gap-2">{e.player.name}</div>
              </div>)
            );
          })}

          {/* <div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20">
            <div className="flex gap-2">Mayank</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
