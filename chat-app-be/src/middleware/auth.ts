import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

export const authMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  next();
};