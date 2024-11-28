import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from "../pages/chat/chat.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, ChatComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {

}
