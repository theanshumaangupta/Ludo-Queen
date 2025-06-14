"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoomDataType } from "../app/(route)/room/[token]/page";
import { exitRoom } from "../action/homeActions";

export default function Lobby({ roomData }: { roomData: RoomDataType }) {
  const [players, setPlayers] = useState<
    { player: { id: number; name: string } }[]
  >(roomData.arenaDetailsList);

  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  if (!roomData) return;
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("Connected ...");

      // ✅ Move this inside "open"
      if (roomData.client && roomData.token) {
        socket.send(
          JSON.stringify({
            type: "join",
            room: roomData.token,
            user: {
              player: {
                id: roomData.client.id,
                name: roomData.client.name,
              },
            },
          })
        );
      }

      // ✅ Listen to messages
      socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "user_joined") {
          setPlayers((prev) => {
            const exists = prev.find(
              (p) => p.player.id === data.user.player.id
            );
            if (exists) return prev;
            return [...prev, data.user];
          });
        }
        if (data.type === "user_left") {
          setPlayers((prev) => {
            const exists = prev.find(
              (p) => p.player.id === data.user.player.id
            );
            if (!exists) return prev;
            const arr = prev.filter(item => item.player.id !== data.user.player.id )
            return [...arr];
          });
        }
      });
    });

    socket.addEventListener("close", () => {
      console.log("Disconnected ...");
    });

    return () => socket.close();
  }, []);

  async function exitAction() {
    if (roomData.token && socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "leave",
          room: roomData.token,
          user: { player: roomData.client },
        })
      );
      await exitRoom(roomData.token);
      router.push("/");
      socketRef.current.close();
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-wide text-white">
            Room Code: <span className="text-yellow-400">{roomData.token}</span>
          </h1>
        </div>

        <div className="flex flex-col gap-3 backdrop-blur-xl border rounded-xl p-4 border-gray-500/20 bg-[#111111] shadow-lg">
          {players.map((e: any) => {
            const isHost = e.player.id === roomData?.host?.id;
            const isYou = e.player.id === roomData?.client?.id;
            return (
              <div
                key={e.player.id}
                className="border border-gray-500/20 rounded-lg px-5 py-3 bg-[#1a1a1a] flex justify-between items-center transition-transform hover:scale-[1.01]"
              >
                <div className="text-white font-medium">
                  {e.player.name.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400 font-semibold tracking-wide">
                  {isHost && "(HOST)"} {isYou && "(YOU)"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={exitAction}
            className="bg-red-900 text-white tracking-wide px-6 py-3 rounded-lg border border-gray-500/20 transition-transform hover:scale-105"
          >
            Exit Room
          </button>
        </div>
      </div>
    </div>
  );
}
