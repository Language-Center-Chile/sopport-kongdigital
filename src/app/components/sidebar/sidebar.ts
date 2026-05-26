import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  @Output() createTicket = new EventEmitter<void>();

  onCreateTicketClick(event: Event) {
    event.preventDefault();
    this.createTicket.emit();
  }
}
