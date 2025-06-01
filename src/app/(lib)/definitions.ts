import { z } from "zod";

export const SignupFormSchema = z.object({
  email: z.string().email({ message: "Insira um e-mail válido." }),
  username: z.string().min(1, { message: "Insira um nome de exibição." }),
  password: z
    .string()
    .min(8, { message: "Ter pelo menos oito caractéres" })
    .regex(/[a-zA-Z]/, { message: "Conter pelo menos uma letra." })
    .regex(/[0-9]/, { message: "Conter pelo menos um número." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Conter pelo menos um caractér especial (@, !, #).",
    })
    .trim(),
});

export const SignInSchema = z.object({
  email: z.string().email({ message: "Por favor insira um e-mail válido" }),
  password: z.string().min(8, { message: "Mínimo de oito caractéres" }),
});

export const RoomFormSchema = z.object({
  name: z.string().min(1, { message: "Insira um nome de sala." }),
  description: z.string().optional(),
});

export const NameModalSchema = z.object({
  username: z.string().min(1, { message: "Insira um nome de exibição." }),
  bio: z.string().optional(),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
        username?: string[];
        password?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type SignFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type RoomFormState =
  | {
      errors?: {
        name?: string[];
        description?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type profileModalState =
  | {
      errors?: {
        username?: string[];
        bio?: string[];
        image?: string[];
      };
      message?: string;
      data?: {
        success?: boolean;
      };
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export interface IUser {
  id: string;
  login: string;
  username: string;
  password: string;
}

export interface UserProfile {
  username: string;
  bio: string | null;
  image_url: string | null;
}

export interface IRoom {
  id: string;
  name: string;
  owner_id: string;
  created_at: Date;
  description: string | null;
  is_default_room: boolean;
}

export interface IMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

export interface CategorizedRooms {
  createdRooms: IRoom[];
  joinedRooms: IRoom[];
  otherRooms: IRoom[];
}
