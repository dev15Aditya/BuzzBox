// server.ts
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';
import { json } from 'body-parser';
import { PrismaClient, User } from '@prisma/client';
import { schema } from './graphql/schema';
import { Context } from './graphql/types';
import { AuthService } from './service/AuthService';

const prisma = new PrismaClient();

async function startServer() {
  // Create Express app
  const app = express();
  
  // Create HTTP server
  const httpServer = http.createServer(app);

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Create schema
  const executableSchema = schema;

  // Set up WebSocket server
  const serverCleanup = useServer({
    schema: executableSchema,
    context: async (ctx) => {
      // Handle WebSocket context
      const token = typeof ctx.connectionParams?.authorization === 'string' ? ctx.connectionParams.authorization.split(' ')[1] : null;
      const user = token ? await AuthService.verifyToken(token) : null;
      return { user, prisma };
    },
  }, wsServer);

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    schema: executableSchema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.status(200).send('OK');
  });

  // GraphQL endpoint
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        const token = req.headers.authorization?.split(' ')[1] || '';
          let user: User | null = null;
          
          if (token) {
            const verifiedUser = await AuthService.verifyToken(token);
            // Make sure verifiedUser matches the User interface
            if (verifiedUser) {
              user = verifiedUser as User;
            }
          }
        return {
          user,
          prisma
        };
      },
    })
  );

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // Start server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`
🚀 Server ready at http://localhost:${PORT}/graphql
🔉 Health check available at http://localhost:${PORT}/health
🔌 WebSocket server ready at ws://localhost:${PORT}/graphql
    `);
  });

  // Handle server shutdown
  const shutdown = async () => {
    console.log('\nShutting down server...');
    await server.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start server with error handling
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});