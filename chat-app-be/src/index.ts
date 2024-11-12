import { ApolloServer } from '@apollo/server';
import express from 'express';
import {schema} from './graphql/schema'
import { Socket } from 'socket.io';
import { Context } from './graphql/types';
import { testConnection } from './config/database';
import cors from 'cors';
import {expressMiddleware} from '@apollo/server/express4';
import { AuthService } from './service/AuthService';

const app = express();

const server = new ApolloServer<Context>({
  schema,
})

// const http = require('http').createServer(app);


// const io = require('socket.io')(http, {
//   cors: {
//     origin: "http://localhost:4200",
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket: Socket) => {
//   console.log('User connected');

//   socket.on('message', (message: string) => {
//     io.emit('message', message);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

async function startServer() {
  await testConnection();
  await server.start();
  
  app.use(cors());
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => {
      const token = req.headers.authorization?.split(' ')[1] || '';
      const user = await AuthService.verifyToken(token);
      return { user };
    },
  }));

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);