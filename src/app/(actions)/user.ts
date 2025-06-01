"use server";

import { IUser, profileModalState, UserProfile } from "@/(lib)/definitions";
import { decrypt } from "@/(lib)/session";
import { cookies } from "next/headers";
import { prisma } from "@/(lib)/db";
import { NameModalSchema } from "@/(lib)/definitions";
import { uploadProfileImage } from "@/(actions)/minio";

export async function getUserId() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    console.log("Sessão não encontrada");
    return null;
  }

  try {
    const payload = await decrypt(session);
    const userId = payload?.userId;

    if (!userId) {
      console.error("UserID não encontrado no payload da sessão");
      return null;
    }

    return userId;
  } catch (error) {
    console.error("Erro ao decodificar a sessão:", error);
    return null;
  }
}

export async function getUser(userId: string): Promise<IUser | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  console.log("User:", user);

  if (!user) {
    console.error("User not found");
    return null;
  }

  return user;
}

export async function fetchUsername(): Promise<string | undefined | null> {
  const userId = await getUserId();
  if (!userId) {
    return null;
  }

  const user = await getUser(userId.toString());
  return user?.username;
}

export async function getProfile(): Promise<UserProfile | null> {
  const userId = await getUserId();
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    select: { username: true, bio: true, image_url: true },
  });

  if (!user) {
    return null;
  }

  return {
    username: user.username,
    bio: user.bio || "",
    image_url: user.image_url || "",
  };
}

export async function getProfileByUsername(
  username: string
): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { username: username },
      select: { username: true, bio: true, image_url: true },
    });

    if (!user) {
      return null;
    }

    return {
      username: user.username,
      bio: user.bio || "",
      image_url: user.image_url || "",
    };
  } catch (error) {
    console.error("Erro ao buscar perfil por username:", error);
    return null;
  }
}

export async function updateProfile(
  state: profileModalState,
  formData: FormData
): Promise<profileModalState> {
  try {
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;
    const imageFile = formData.get("image") as File | null;

    const result = NameModalSchema.safeParse({
      username,
      bio,
      image_url: "",
    });

    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }
    const userId = await getUserId();
    if (!userId) {
      throw new Error("User ID is null or undefined");
    }

    // Fazer upload da imagem se fornecida
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const fileData = {
          buffer,
          originalname: imageFile.name,
          mimetype: imageFile.type,
          size: imageFile.size,
        };
        const uploadResult = await uploadProfileImage(
          fileData,
          userId as string
        );
        imageUrl = uploadResult.fileUrl;
      } catch (uploadError) {
        console.error("Erro no upload da imagem:", uploadError);
        return {
          errors: { image: ["Erro ao fazer upload da imagem"] },
        };
      }
    }

    // Atualizar perfil no banco
    const updateData: any = {
      username: username,
      bio: bio || null,
    };

    // Só atualizar image_url se uma nova imagem foi enviada
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    const usedName = await prisma.user.findUnique({
      where: {
        username: updateData.username,
      },
    });

    if (usedName && usedName.id !== userId) {
      return {
        errors: { username: ["Este nome de usuário já está em uso"] },
      };
    }

    await prisma.user.update({
      where: {
        id: userId as string,
      },
      data: updateData,
    });
    return {
      data: { success: true },
    };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return {};
  }
}

export async function hasUserCreatedRoom() {
  const userId = await getUserId();

  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    select: { hasCreatedRoom: true },
  });

  return user?.hasCreatedRoom ?? false;
}
