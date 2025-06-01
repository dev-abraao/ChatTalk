"use server";

import { prisma } from "@/(lib)/db";

interface SaveMessageProps {
  content: string;
  roomId: string;
  userId: string;
  fileUrl?: string;
  type?: "text" | "image" | "video";
}

interface MessageWithUser {
  id: string;
  content: string;
  user_id: string;
  room_id: string;
  image_url: string | null;
  type: string;
  created_at: Date;
  user: {
    id: string;
    username: string;
    image_url: string | null;
  };
}

export async function saveMessage({
  content,
  roomId,
  userId,
  fileUrl,
  type = "text",
}: SaveMessageProps) {
  try {
    console.log("Saving message with data:", {
      content,
      roomId,
      userId,
      fileUrl,
      type,
    });

    const message = await prisma.messages.create({
      data: {
        content,
        room_id: roomId,
        user_id: userId,
        image_url: fileUrl || null,
        type: type,
      },
    });

    console.log("Mensagem salva:", message.id);
    return message;
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    throw error;
  }
}

export async function getMessagesByRoomId(roomId: string) {
  console.log("Buscando mensagens para sala:", roomId);

  try {
    const messages = await prisma.messages.findMany({
      where: {
        room_id: roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image_url: true, // Incluindo a URL da imagem do usuário
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
      take: 100,
    });

    console.log(`Encontradas ${messages.length} mensagens na sala ${roomId}`);

    return messages.map((message: MessageWithUser) => ({
      id: message.id,
      content: message.content,
      username: message.user.username,
      imageUrl: message.image_url,
      type: message.type,
      createdAt: message.created_at,
      userId: message.user_id,
      userImageUrl: message.user.image_url,
    }));
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
}

// Backward compatibility function
export async function saveMessageWithImageUrl({
  content,
  roomId,
  userId,
  imageUrl,
  type = "text",
}: {
  content: string;
  roomId: string;
  userId: string;
  imageUrl?: string;
  type?: "text" | "image" | "video";
}) {
  return saveMessage({ content, roomId, userId, fileUrl: imageUrl, type });
}
