"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();  

  if (!session?.user?.name) return null;

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-950 shadow">
      <h1 className="text-lg text-white font-semibold">Hi, {(session.user.name).toLocaleUpperCase()}</h1>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
    </nav>
  );
}
