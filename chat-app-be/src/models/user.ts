import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


export interface User {
  id: number;
  username: string;
  phone: string;
  password?: string;
  created_at?: Date;
}

const prisma = new PrismaClient();

export class UserModel {
  static async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
  
    if (user) {
      return {
        ...user,
        password: user.password ?? undefined, 
      };
    }
  
    return null;
  }

  static async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
  
    if (user) {
      return {
        ...user,
        password: user.password ?? undefined,
      };
    }
  
    return null;
  }

  static async create(username: string, phone: string, password: string): Promise<User> {


    const hashedPassword = await bcrypt.hash(password, 10);
    
    return prisma.user.create({
      data: {
        username,
        phone,
        password:hashedPassword,
      },
      select: {id: true, username: true, phone: true, createdAt: true}
    })
  }

  static async verifyCredentials(username: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {username}
    })
    
    if (!user || !user.password) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async checkExisting(username: string, phone: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {username},
          {phone}
        ]
      }
    })
    return !!user;
  }
}