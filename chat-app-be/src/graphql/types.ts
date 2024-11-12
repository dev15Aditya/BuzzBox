import { User } from "../models/user";


// Context type
export interface Context {
  user: User | null;
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
