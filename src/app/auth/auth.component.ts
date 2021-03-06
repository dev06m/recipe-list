import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  isLogin = false;
  @ViewChild(PlaceholderDirective, { static: false }) alertHost: PlaceholderDirective;

  private closeSub:Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private componentFactoryResolver: ComponentFactoryResolver
    ) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    console.log(this.isLoginMode)
  }

  ngOnInit() {
    console.log(this.isLoginMode)
  }

  onSubmit(form: NgForm) {
    if (!form.valid) { // submit butonu valid olmadığı sürece form gönderilemez
      // fakat devtool ile butonu able ederlerse gönderilebilir bu durum için if ekliyoruz
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    
    let authObs: Observable<AuthResponseData>;

    // for spinnin icon in case of ...
    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authService.signin(email, password)
    } else {
      authObs = this.authService.signup(email, password)
    }
    authObs.subscribe(
      resData => {
        // giriş onaylandığında 
        this.isLoading = false;
        this.router.navigate(['/recipes']);
        this.isLogin = true;
      },(errorMessage) => {
        this.error = errorMessage;
        this.showAlertError(errorMessage);
        this.isLoading = false;
      }
    )
    
    form.reset();
  }

  onHandleError() {
    this.error = null;
  }

  ngOnDestroy() {
    if ( this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  private showAlertError(message: string) {
    // const alertCmp = new AlertComponent(); // thıs ıs valıd ts code but not valid angular code 
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent) // this gives you access to a component factory as provided by angular
    const hostViewContainerRef = this.alertHost.viewContaineref;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);

    componentRef.instance.message = message;
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    })
  }

}
