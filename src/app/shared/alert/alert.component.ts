import { Component, Input, Output, EventEmitter } from "@angular/core";


@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.css']
})

export class AlertComponent {
    @Input() message: string;
    @Output() close = new EventEmitter<void>(); // eventemitte could transport some data but here we ll actually add void as a type 
    // becuause we wont emit any data we ll just emit the "hey this was closed" event   

    onClose() {
        this.close.emit();
    }
}