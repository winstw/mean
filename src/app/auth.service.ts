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
  private userId: string;

  constructor(
    private http: HttpClient,
    private router: Router) {}

  getToken(){
    return this.token;
  }

  getUserId(){
    return this.userId;
  }

  getIsAuthenticated(){
    return this.isAuthenticated;
  }

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
    this.http.post<{token: string, expiresIn: number, userId: string}>(this.url + 'login', authData)
      .subscribe( response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setTokenTimer(expiresInDuration);
          this.userId = response.userId;
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      })
  }

  logout() {
    this.token = null;
    clearTimeout(this.tokenTimer);
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setTokenTimer(seconds: number){
    this.tokenTimer = setTimeout(() => this.logout(), seconds * 1000);
  }

  /* LOCAL STORAGE */

  private getAuthData(){
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate){ return ;}
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string){
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if (!authInformation){return;}
    const now = new Date();
    let expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0){
      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.isAuthenticated = true;
      this.setTokenTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

}
