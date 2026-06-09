import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user$ = new BehaviorSubject<User | null>(this.storedUser);

  readonly user$ = this._user$.asObservable();
  readonly isLoggedIn$ = new BehaviorSubject<boolean>(!!this.getToken());

  private get storedUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('access_token', res.access_token);
          this.isLoggedIn$.next(true);
          this.fetchMe();
        })
      );
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, { name, email, password });
  }

  fetchMe(): void {
    this.http.get<User>(`${environment.apiUrl}/auth/me`).subscribe({
      next: user => {
        localStorage.setItem('user', JSON.stringify(user));
        this._user$.next(user);
      },
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this._user$.next(null);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }
}