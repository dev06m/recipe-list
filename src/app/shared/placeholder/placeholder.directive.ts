import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
    selector: '[appPlaceholder]'
})

export class PlaceholderDirective {
    constructor(public viewContaineref: ViewContainerRef) { // this will allow you to get infirmation about the place where you use the diretive and as we said that will not just be coordonated
        // but the view caontainerref has useful methods for example for crreating a component in that place where it sits
        
    }
}