import authConfig from "../../../../auth-config";
import Lobby from "../../../../Components/Lobby";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export type RoomDataType = {
  token?: string;
  client?: {
    id: number;
    name: string;
  };
  host?: {
    name: string;
    id: number;
  };
};
export default async function Page({ params }: any) {
  const token = await params.token;
  const arenaByToken = await prisma.arena.findUnique({
    where: {
      code: token,
      status: "ACTIVE",
    },
    select: {
      host: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  const session = await getServerSession(authConfig);
  if (
    !session ||
    !session.user ||
    !session.user.name ||
    !arenaByToken?.host?.name
  )
    return;

  const Roomdata: RoomDataType = {
    token: token,
    client: { id: Number(session?.user.id), name: session.user.name },
    host: {
      id: Number(arenaByToken?.host?.id),
      name: arenaByToken?.host?.name,
    },
  };

  //@ts-ignore
  return <Lobby roomData={Roomdata} />;
}
