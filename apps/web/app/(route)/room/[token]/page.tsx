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
  arenaDetailsList?: any;
};
let alredyJoined = false;
export default async function Page({ params }: any) {
  const wait = await params;
  const token = wait.token
  const arenaByToken = await prisma.arena.findUnique({
    where: {
      code: token,
      status: "ACTIVE",
    },
    select: {
      id: true,
      host: {
        select: {
          name: true,
          id: true,
        },
      },
      ArenaDetails: {
        select: {
          player: true,
          playerId: true,
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
  ) {
    return;
  }
  // checking if the user is already joined or not
  arenaByToken?.ArenaDetails.forEach((e) => {
    if (e.playerId == Number(session?.user.id)) {
      alredyJoined = true;
    }
  });
  if (!alredyJoined) {
    const newJoinee = await prisma.arenaDetails.create({
      data: {
        playerId: Number(session?.user?.id),
        arenaId: arenaByToken.id,
      },
    });
  }

  const Roomdata: RoomDataType = {
    token: token,
    client: { id: Number(session?.user.id), name: session.user.name },
    host: {
      id: Number(arenaByToken?.host?.id),
      name: arenaByToken?.host?.name,
    },
    arenaDetailsList: arenaByToken.ArenaDetails,
  };

  //@ts-ignore
  return <Lobby roomData={Roomdata} />;
}
