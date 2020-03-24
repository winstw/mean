import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from "./auth-data.model";
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url: string = "http://localhost:3000/api/user/";
  token: string;
  isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: NodeJS.Timer;

  constructor(
    private http: HttpClient,
    private router: Router) {}

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }
  createUser(email: string, password: string){
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post(this.url + 'signup', authData)
      .subscribe((response) => console.log(response));
  }

  login(email: string, password: string){
    console.log('in login');
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{token: string, expiresIn: number}>(this.url + 'login', authData)
      .subscribe( response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setTokenTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.token, expirationDate);
          this.router.navigate(['/']);
        }
      })
  }

  private setTokenTimer(seconds: number){
    this.tokenTimer = setTimeout(() => this.logout(), seconds * 1000);
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if (!authInformation){return;}
    const now = new Date();
    let expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0){
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setTokenTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }

  }

  private getAuthData(){
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate){ return ;}
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    };
  }

  getIsAuthenticated(){
    return this.isAuthenticated;
  }

  logout() {
    this.token = null;
    clearTimeout(this.tokenTimer);
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  getToken(){
    return this.token;
  }

  private saveAuthData(token: string, expirationDate: Date){
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }
}
