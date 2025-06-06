"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { RoomDataType } from "../app/(route)/room/[token]/page";
import { exitRoom } from "../action/homeActions";

export default function Lobby({ roomData }: { roomData: RoomDataType }) {
  function exitAction() {
    if(roomData.token){
      exitRoom(roomData.token)
      redirect("/")
      return
    }else{
      return
    }

  }
  return (
    <div className=" flex justify-center items-center min-h-screen">
      <div className="max-w-[40rem] w-full">
        <div className="flex flex-col flex-1 gap-2 backdrop-blur-xl border rounded-lg p-3 border-gray-500/20">
          <div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20">
            <div className="flex gap-2">
              {roomData.host?.name.toLocaleUpperCase()} (HOST)
            </div>
          </div>
          <div className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20">
            <div className="flex gap-2">
              {roomData.client?.name.toLocaleUpperCase()} (You)
            </div>
          </div>
          {roomData.arenaDetailsList.map((e: any) => {
            if (e.player.id == roomData?.host?.id || e.player.id == roomData?.client?.id) return;

            return (
              <div
                key={e.player.id}
                className="border flex justify-between hover:scale-x-[1.01] transition-all rounded-lg px-6 py-3 bg-[#111111] border-gray-500/20"
              >
                <div className="flex gap-2">{e.player.name}</div>
              </div>
            );
          })}
        </div>
        <div className="border flex tracking-wider justify-center bg-red-900 hover:scale-x-[1.01] transition-all rounded-lg px-6 mt-10 py-3 border-gray-500/20">
          <div className="flex gap-2 tracking-wider" onClick={()=>exitAction()}>Exit Room</div>
        </div>
      </div>
    </div>
  );
}
