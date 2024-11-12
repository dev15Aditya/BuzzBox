import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { Apollo, gql } from 'apollo-angular';

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $phone: String!, $password: String!) {
    register(username: $username, phone: $phone, password: $password) {
      token
      user {
        id
        username
        phone
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        phone
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private apollo: Apollo) {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(username: string, phone: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.apollo.mutate({
        mutation: REGISTER_MUTATION,
        variables: { username, phone, password }
      }).subscribe({
        next: ({data}: any) => {
          const { user, token } = data.register;
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', token);
          this.currentUserSubject.next(user);
          resolve(user);
        },
        error: (error) => {
          reject(error);
        }
      })
    });
  }

  login(username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.apollo.mutate({
        mutation: LOGIN_MUTATION,
        variables: {username, password}
      }).subscribe({
        next: ({data}: any) => {
          const {user, token} = data.login;

          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', token);
          this.currentUserSubject.next(user);
          resolve(user);
        },
        error: (error) => {
          reject(error);
        }
      })
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);

    this.apollo.client.resetStore();
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}