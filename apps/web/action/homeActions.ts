"use server"
import { PrismaClient, Status } from "@prisma/client";
import { getServerSession } from "next-auth";
import authConfig from "../auth-config";
const prisma = new PrismaClient();

export default async function createRoom() {
  const session = await getServerSession(authConfig);
  if (!session) {
    return;
  }
  console.log(session);
  const str = Math.random().toString(36).substring(2, 7);
  const roomDetails = await prisma.arena.create({
    data: {
      userId: Number(session.user.id),
      status: Status.ACTIVE,
      code: str,
      boardState: {}
    },
  });
  if (roomDetails) {
    console.log("Room created");
    return str;
  } else {
    return "";
  }
}
