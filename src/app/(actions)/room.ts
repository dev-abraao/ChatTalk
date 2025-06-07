"use server";
import { prisma } from "@/(lib)/db";
import { RoomFormSchema, RoomFormState } from "@/(lib)/definitions";
import { getUserId } from "@/(actions)/user";

export default async function createRoom(
  state: RoomFormState,
  formData: FormData
) {
  const result = RoomFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const userIdObj = await getUserId();

  if (!userIdObj) {
    throw new Error("User ID not found in session");
  }

  const userId = userIdObj.toString();

  await prisma.rooms.create({
    data: {
      name: result.data.name,
      description: result.data.description,
      owner_id: userId,
      created_at: new Date(),
    },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hasCreatedRoom: true,
    },
  })
}

export async function getRooms() {
  const rooms = await prisma.rooms.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  return rooms;
}

export async function getDefaultRoomId() {
  const room = await prisma.rooms.findFirst({
    where: {
      is_default_room: true,
    },
  });
  if (!room) {
    throw new Error("No default room found");
  }
  return room.id;
}

export async function joinRoom(roomId: string) {
  const userIdObj = await getUserId();
  
  if (!userIdObj) {
    throw new Error("User ID not found in session");
  }
  
  const userId = userIdObj.toString();

  const room = await prisma.rooms.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  await prisma.userInRoom.upsert({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
    update: {},
    create: {
      userId,
      roomId,
    },
  });
}

export async function getRoomMembers(roomId: string) {
  const members = await prisma.userInRoom.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return members.map((member: {
    user: { id: string; username: string };
    joinedAt: Date;
  }) => ({
    id: member.user.id,
    username: member.user.username,
    joinedAt: member.joinedAt
  }));
}

export async function getRoomsByCategory() {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const createdRooms = await prisma.rooms.findMany({
    where: {
      owner_id: userId
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const joinedRooms = await prisma.rooms.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      },
      NOT: {
        owner_id: userId
      }
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const otherRooms = await prisma.rooms.findMany({
    where: {
      NOT: {
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      }
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return {
    createdRooms,
    joinedRooms,
    otherRooms
  };
}

export async function deleteRoom(roomId: string) {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const room = await prisma.rooms.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.owner_id !== userId) {
    throw new Error("You are not the owner of this room");
  }

  await prisma.rooms.delete({
    where: { id: roomId },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hasCreatedRoom: false,
    },
  })
}

export async function getRoomById(roomId: string) {
  const room = await prisma.rooms.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      name: true,
      description: true,
      created_at: true,
      owner_id: true,
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}
