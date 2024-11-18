import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { User } from '@prisma/client';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '24h';

  static generateToken(userId: number): string {
    return jwt.sign(
      { id: userId },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { id: number };
      return await UserModel.findById(decoded.id);
    } catch (error) {
      return null;
    }
  }

  static async register(username: string, phone: string, password: string) {
    // Check if user exists
    const exists = await UserModel.checkExisting(username, phone);
    console.log(exists);
    if (exists) {
      throw new Error('Username or phone number already exists');
    }

    // Create new user
    const user = await UserModel.create(username, phone, password);
    const token = this.generateToken(user.id);

    return { user: { id: user.id, username: user.username, phone: user.phone }, token };
  }

  static async login(username: string, password: string) {
    const user = await UserModel.verifyCredentials(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    return { user: { id: user.id, username: user.username, phone: user.phone }, token };
  }
}