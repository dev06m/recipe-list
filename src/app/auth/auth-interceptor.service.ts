import { Injectable } from "@angular/core";
import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http'
import { AuthService } from "./auth.service";
import { exhaustMap, take } from "rxjs/operators";


@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        
        return this.authService.user.pipe(  
            take(1), // what this tells rxjs is that i only want to take one value from that observable ant thereafter,
            // it should automatically unsubscribe. so this manages the subscription for me gives me the latest user and unsubscribe 
            // and i am nit getting future users because i just want to get them on demand when fetch recipes called so whenever 
            //this code executed i dont want to set up an ongoing subscription which gives me users at a point of time i dont need them anymore
            exhaustMap(user => { // it waits for the first observable for the user observable to complete which will happen 
                // after we took the latest user. thereafter it gaves us that user, so in exhaustMap we pass in function
                // there we get the data from that previous observable and now we return a new observable in there which 
                // will then replace our previous obserable in that entire obsevable chain. 
                if (!user) {
                    return next.handle(req)
                }
                const modifiedReq = req.clone({
                    params: new HttpParams().set('auth', user.token)
                })
                return next.handle(modifiedReq); // this interceptor should add the token to all outgoing requests 
            }))  
        // the advantage of interceptor now of course is that this also automatically works for storing recipes 
        // because this uses the same interceptor automatically 
    }
}