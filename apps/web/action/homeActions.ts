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
    return str;
  } else {
    return "";
  }
}
export async function joinRoom(token : string) {
  const session = await getServerSession(authConfig);
  if (!session) {
    return;
  }


  const roomDetails = await prisma.arena.findUnique({
    where: {
      status: Status.ACTIVE,
      code: token,
    },
  });
  if (roomDetails) {
    return token;
  } else {
    return "";
  }
}