import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ChatRoom } from '../models/room.model';
import { Message } from '../models/message.model';

const GET_CHAT_ROOMS = gql`
  query ChatRooms {
    chatRooms {
      id
      name
      isGroup
      participants {
        id
        username
        phone
      }
      messages {
        id
        content
        sender {
          id
          username
          phone
        }
        createdAt
      }
      createdAt
    }
  }
`;

const GET_MESSAGES = gql`
  query Messages($chatRoomId: ID!) {
    messages(chatRoomId: $chatRoomId) {
      id
      content
      sender {
        id
        username
        phone
      }
      createdAt
    }
  }
`;

const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($name: String, $participantIds: [ID!]!, $isGroup: Boolean!) {
    createChatRoom(name: $name, participantIds: $participantIds, isGroup: $isGroup) {
      id
      name
      isGroup
      participants {
        id
        username
        phone
      }
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatRoomId: ID!, $content: String!) {
    sendMessage(chatRoomId: $chatRoomId, content: $content) {
      id
      content
      sender {
        id
        username
        phone
      }
      createdAt
    }
  }
`;

const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription MessageSent {
    messageSent {
      id
      content
      sender {
        id
        username
        phone
      }
      createdAt
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  private chatRoomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  chatRooms$ = this.chatRoomsSubject.asObservable();

  constructor(private apollo: Apollo) {
    this.loadChatRooms();
    this.subscribeToMessages();
  }

  loadChatRooms() {
    this.apollo.query<{ chatRooms: ChatRoom[] }>({
      query: GET_CHAT_ROOMS
    }).subscribe(result => {
      this.chatRoomsSubject.next(result.data.chatRooms);
    });
  }

  getMessages(chatRoomId: string): Observable<Message[]> {
    return this.apollo.query<{ messages: Message[] }>({
      query: GET_MESSAGES,
      variables: { chatRoomId }
    }).pipe(
      map(result => result.data.messages)
    );
  }

  createChatRoom(name: string, participantIds: string[], isGroup: boolean): Observable<ChatRoom> {
    return this.apollo.mutate<{ createChatRoom: ChatRoom }>({
      mutation: CREATE_CHAT_ROOM,
      variables: { name, participantIds, isGroup }
    }).pipe(
      map(result => result.data!.createChatRoom as ChatRoom)
    );
  }

  sendMessage(chatRoomId: string, content: string): Observable<Message> {
    return this.apollo.mutate<{ sendMessage: Message }>({
      mutation: SEND_MESSAGE,
      variables: { chatRoomId, content }
    }).pipe(
      map(result => result.data!.sendMessage)
    );
  }

  private subscribeToMessages() {
    this.apollo.subscribe<{ messageSent: Message }>({
      query: MESSAGE_SENT_SUBSCRIPTION
    })
      .subscribe(result => {
        const chatRooms = this.chatRoomsSubject.value;
        const updatedChatRooms = chatRooms.map(chatRoom => {
          if (result.data && chatRoom.id === result.data.messageSent.chatRoom.id) {
            return {
              ...chatRoom,
              messages: [...chatRoom.messages, result.data.messageSent]
            };
          }
          return chatRoom;
        });
        this.chatRoomsSubject.next(updatedChatRooms);
      });
  }
}
