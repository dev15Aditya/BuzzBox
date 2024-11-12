import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  Context,
  MutationRegisterArgs,
  MutationLoginArgs,
  AuthResponse,
} from './types';
import { GraphQLResolveInfo } from 'graphql';
import { UserModel } from '../models/user';
import { AuthService } from '../service/AuthService';

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

  type Query {
    me: User
  }

  type Mutation {
    register(username: String!, phone: String!, password: String!): AuthResponse!
    login(username: String!, password: String!): AuthResponse!
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
`;

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
      if(!context.user) return [];
      return 
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
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
