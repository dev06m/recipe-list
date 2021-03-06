import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean; // ? bunun optional olduğunu gösterir
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    //user = new Subject<User>(); // this subject is a subject to which we can subscribe and we ll get info whenever new data emitted
    user = new BehaviorSubject<User>(null); // the difference is that behaviorsubject also give subscribers immediate access to the priviously emitted value
    // we are storing the token in a user   model which happens in JS only and which therefore happens in memory since we manage
    // we ll lose all that state whenever the application restarts because that memory gets cleared automatically
    //private _navItemSource = new BehaviorSubject<number>(1);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router) { }

    signup(email: string, password: string) {

        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC9-aUXEEcA2hi9nAdy8xZNZJQlG9Jkt5k',
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(resData => { // tap response data değiştirmeden kullanmanı sağlar
                // console.log('resData: ' + JSON.stringify(resData))
                this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
            })
            
        )
    }

    signin(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC9-aUXEEcA2hi9nAdy8xZNZJQlG9Jkt5k',
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(resData => { // tap response data değiştirmeden kullanmanı sağlar
                console.log('resData: ' + JSON.stringify(resData))
                this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
            })
        )
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth'])
        localStorage.removeItem('userData');
        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(exprirationDuation: number) {
        setInterval(() => {
            console.log(exprirationDuation/1000/60)
        }, 2000)
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, exprirationDuation)
    }

    private handleAuthentication(
        email: string, 
        userId: string,
        token: string,
        expiresIn: number
    )   {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate) // create user
        this.user.next(user); // emit it to our application
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user))
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMes = 'An unknown error occured!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMes)
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMes = "This email exists already"
                break;
            case 'EMAIL_NOT_FOUND':
                errorMes = 'This email does not exist.'
                break;
            case 'INVALID_PASSWORD':
                errorMes = 'This password is not correct.'
                break;
            default:
                errorMes = "you fucked up dude!"
        }
        console.log(errorRes)
        return throwError(errorMes)
    }

    autoLogin () {
        const userData: {
            emial: string,
            id: string,
            _token: string,
            _tokenExprationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        console.log(userData)
        if (!userData) {
            return;
        }
        const loadedUser = new User(userData.emial, userData.id, userData._token, new Date(userData._tokenExprationDate));

        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration = 
                new Date(userData._tokenExprationDate).getTime() - new Date().getTime()
            this.autoLogout(expirationDuration)
        }
    }

} 