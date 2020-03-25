import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const authToken = this.authService.getToken();
        const authRequest = req.clone({         // we have to clone the request to "stop" the original ?
            headers: req.headers.set('Authorization', "Bearer " + authToken)  // we can directly modify the request that we are copying
        });
        return next.handle(authRequest);
    }


}
