"use server";

import {
  SignupFormSchema,
  FormState,
  SignInSchema,
  SignFormState,
} from "@/(lib)/definitions";
import bcrypt from "bcryptjs";
import { prisma } from "@/(lib)/db";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function signup(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, username, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.findUnique({
    where: {
      login: email,
    },
  });

  if (user) {
    return {
      message: "Esse e-mail já está cadastrado!",
    };
  }

  try {
    const user = await prisma.user.create({
      data: {
        login: email,
        username: username,
        password: hashedPassword,
      },
    });

    if (!user) {
      return {
        message: "An error occurred while creating your account.",
      };
    }

    await createSession(user.id);
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      message: `Failed to create account: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
  redirect("/login");
}

export async function signin(state: SignFormState, formData: FormData) {
  const validatedFields = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findFirst({
    where: {
      login: email,
    },
  });

  if (!user) {
    // console.log(user);
    console.error("Erro: usuário não existe");
    return {
      errors: {
        email: ["Email ou senha incorretos!"],
      },
    };
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    console.error("Erro: senha incorreta");
    return {
      errors: {
        password: ["Email ou senha incorretos!"],
      },
    };
  }

  if (result) {
    await createSession(user.id);
    redirect("/chat");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
