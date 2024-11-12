import { User } from "./user.model";

export interface Room {
    id: string;
    name: string;
    users: User[]
}