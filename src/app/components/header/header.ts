import { Component, Output, EventEmitter, inject } from '@angular/core';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html'
})
export class HeaderComponent {
  readonly ticketService = inject(TicketService);
  
  @Output() createTicket = new EventEmitter<void>();

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.ticketService.searchQuery.set(value);
  }

  onCreateTicketClick() {
    this.createTicket.emit();
  }
}
