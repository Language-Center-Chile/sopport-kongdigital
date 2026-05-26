import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  readonly ticketService = inject(TicketService);

  // Additional mock dashboard details
  satisfactionRate = 94.6;
  avgResponseTime = '18m';
  avgResolveTime = '2h 15m';
  activeAgents = [
    { name: 'Alex Thompson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', status: 'Active', resolved: 42 },
    { name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', status: 'Active', resolved: 31 },
    { name: 'Marcus Aurelius', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', status: 'On Break', resolved: 28 }
  ];
}
