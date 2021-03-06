import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { map, tap, take } from 'rxjs/operators';

@Injectable({providedIn: "root"})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot, 
        router: RouterStateSnapshot
    ): 
        boolean 
        | UrlTree
        | Promise<boolean | UrlTree> 
        | Observable<boolean | UrlTree>{

        return this.authService.user.pipe(
            take(1),
            map(user => { // we essentially set up an ongoing subscription here though. This user subject of course 
                // can emit data more than once and I don't want that here, this can lead to strange side effects if our 
                // guard keeps on listening to that subject, instead we want to look inside the user value for one time 
                // only and then not care about it anymore unless we run the guard again and therefore here just as in 
                // other places too, we should use take one to make sure that we always just take the latest user value
                // and then unsubscribe for this guard execution so that we don't have an ongoing listener to that which
                // we really don't need and therefore here, you need to import the take operator, the take rxjs/operator
                // and add it here in front of map so that we don't have an ongoing user subscription. With that if you
                // save that, you see I can still visit recipes here after reloading, so the guard generally
                // still seems to work but now I have a logout and I try to access recipes, we fail as we should, if I now login 
                // again, we succeed. So the guard now still works as before but now, we avoid nasty bugs which could occur due 
                // to us rerunning the logic in the guard when we really don't want to rerun it.
                /* ******************** ********** ********** ********** */ 
                const isAuth = !!user; // this is a trick which convert a true-ish value, like an 
                // object so anything that is not null or undifined
                // yani true ya da false ceviriecek
                if (isAuth) {
                    return true;
                }
                return this.router.createUrlTree(['/auth'])
            }),
            // tap(isAuth => {
            //     if (!isAuth) {
            //         this.router.navigate(['/auth'])
            //     }
            // })
        )
    }

}