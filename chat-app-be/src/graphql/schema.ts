import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  Context,
  MutationRegisterArgs,
  MutationLoginArgs,
  AuthResponse,
  MutationCreateChatRoomArgs,
  MutationSendMessageArgs,
} from './types';
import { GraphQLResolveInfo } from 'graphql';
import { UserModel } from '../models/user';
import { AuthService } from '../service/AuthService';
import { ChatRoomModel } from '../models/chatroom';
import { MessageModel } from '../models/message';
import { PrismaClient } from '@prisma/client';

import { PubSub } from 'graphql-subscriptions';

const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    phone: String!
    created_at: String
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    chatRoom: ChatRoom!
    createdAt: String!
  }

  type ChatRoom {
    id: ID!
    name: String
    isGroup: Boolean!
    participants: [User!]!
    messages: [Message!]!
    createdAt: String!
  }

  type Query {
    me: User
    chatRooms: [ChatRoom!]!
    messages(chatRoomId: ID!): [Message!]!
  }

  type Mutation {
    register(username: String!, phone: String!, password: String!): AuthResponse!
    login(username: String!, password: String!): AuthResponse!
    createChatRoom(name: String, participantIds: [ID!]!, isGroup: Boolean!): ChatRoom!
    sendMessage(chatRoomId: ID!, content: String!): Message!
  }

  type Subscription {
    messageSent: Message!
  }
`;

const pubsub = new PubSub();
const prisma = new PrismaClient()

const resolvers = {
  Query: {
    me: async (
      parent: undefined,
      args: {},
      context: Context,
      info: GraphQLResolveInfo
    ) => {
      if (!context.user) return null;
      return await UserModel.findById(context.user.id);
    },

    chatRooms: async (
      parent: undefined,
      args: {},
      context: Context,
      info: GraphQLResolveInfo
    ) => {
      if(!context.user) throw new Error('Unauthorized');

      return await ChatRoomModel.findMany(context.user.id)
    },

    messages: async (_: any, {chatRoomId}: {chatRoomId: string}, context: Context) => {
      if(!context.user) throw new Error('Unauthorized');

      const isMember = await prisma.chatRoom.findFirst({
        where: {
          id: chatRoomId,
          Participants: {
            some: {
              id: context.user.id
            }
          }
        }
      })

      if(!isMember) throw new Error('Not authorized to view these messages');

      return await MessageModel.findMany(chatRoomId)
    }
  },

  Mutation: {
    register: async (
      parent: undefined,
      args: MutationRegisterArgs,
      context: Context,
      info: GraphQLResolveInfo
    ): Promise<AuthResponse> => {
      const { username, phone, password } = args;
      return await AuthService.register(username, phone, password);
    },

    login: async (
      parent: undefined,
      args: MutationLoginArgs,
      context: Context,
      info: GraphQLResolveInfo
    ): Promise<AuthResponse> => {
      const { username, password } = args;
      return await AuthService.login(username, password);
    },

    createChatRoom: async (_: any, args: MutationCreateChatRoomArgs, context: Context) => {
      if(!context.user) throw new Error('Unauthorized');

      const {name, participants, isGroup} = args;

      // For non group chat only 2 participant
      if(!isGroup && participants.length !== 1) {
        throw new Error('Not a Group chat')
      }

      // adding current user 
      const allParticipants = [...new Set([...participants, context.user.id])];

      // check is non-group chat already exist between these users
      if(!isGroup) {
        const existingChat = await prisma.chatRoom.findFirst({
          where: {
            isGroup: false,
            Participants: {
              every: {
                id: {
                  in: allParticipants
                }
              }
            }
          }
        })

        if(existingChat) return existingChat;
      }

      return await ChatRoomModel.create(name, isGroup, participants)
    },

    sendMessage: async(_: any, args: MutationSendMessageArgs, context: Context) => {
      if(!context.user) throw new Error('Unauthorized');

      const { chatRoomId, content } = args;

      // verify user is participant of chat
      const isMember = await prisma.chatRoom.findFirst({
        where: {
          id: chatRoomId,
          Participants: {
            some: {
              id: context.user.id
            }
          }
        }
      })

      if(!isMember) throw new Error('Not authrorized to send message to this chat');

      const message = await MessageModel.create(content, chatRoomId, context.user.id)

      // Publish message for subscription
      pubsub.publish('MESSAGE_SENT', {messageSent: message});

      return message;
    }
  },

  Subscription: {
    messageSent: {
      subscribe: (_: any, __: any, context: Context) => {
        if(!context) throw new Error('Unauthenticated');

        return pubsub.asyncIterableIterator(['MESSAGE_SENT'])
      }
    }
  },

  // Types Resolver
  ChatRoom: {
    participants: (parent: any) => parent.Participants,
    messages: (parent: any) => parent.Messages
  },

  Message: {
    sender: (parent: any) => parent.Sender,
    chatRoom: (parent: any) => parent.ChatRoom
  }
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
