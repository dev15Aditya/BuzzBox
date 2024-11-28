import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  uri = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) { }

  isLoggedIn() {
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = atob(token.split('.')[1]);
        const parsedPayload = JSON.parse(payload);
        return parsedPayload.exp > Date.now() / 1000;
      }
    }
    return false;
  }

  login(username: string, password: string) {
    return this.http.post(`${this.uri}/login`, { username, password })
  }

  register(username: string, phone: string, password: string) {
    return this.http.post(`${this.uri}/register`, { username, phone, password })
  }

  getAllUsers () {
    return this.http.get<{ message: string, users: any[] }>(`${this.uri}/users`)
      .pipe(map(response => response.users));
  }
}
