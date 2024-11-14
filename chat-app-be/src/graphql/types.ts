import { PrismaClient } from "@prisma/client";

export interface User {
  id: number;
  name: string | null;
  username: string;
  phone: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Context type
export interface Context {
  user: User | null
  prisma: PrismaClient;
}

// Resolver argument types
export interface MutationRegisterArgs {
  username: string;
  phone: string;
  password: string;
}

export interface MutationLoginArgs {
  username: string;
  password: string;
}

// Response types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface MutationCreateChatRoomArgs {
  name?: string;
  participants: number[];
  isGroup: boolean;
}

export interface MutationSendMessageArgs {
  chatRoomId: string;
  content: string;
}
