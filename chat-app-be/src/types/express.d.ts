import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


export interface WebSocketMessage {
  type: string;
  data: any;
}