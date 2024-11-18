import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  uri = 'http://localhost:3000/auth';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticatedSubject.next(this.isLoggedIn);
    }
  }
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  // login method, save token in local storage
  login(username: string, password: string) {
    return this.http.post(`${this.uri}/login`, { username, password })
      .subscribe((res: any) => {
        console.log(res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.isAuthenticatedSubject.next(true);
      });
  }

  register(username: string, phone: string, password: string) {
    return this.http.post(`${this.uri}/register`, { username, phone, password })
      .subscribe((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.isAuthenticatedSubject.next(true);
      })
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
  }

  get token() {
    return localStorage.getItem('token');
  }

  get isLoggedIn() {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  getAllUsers () {
    return this.http.get<{ message: string, users: any[] }>(`${this.uri}/users`)
      .pipe(map(response => response.users));
  }
}
