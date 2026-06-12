import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  readonly ticketService = inject(TicketService);
  readonly agentService = inject(AgentService);

  // Dynamic CSAT and resolve metrics based on real tickets
  satisfactionRate = computed(() => {
    const list = this.ticketService.tickets();
    const resolved = list.filter(t => t.status === 'Resolved').length;
    if (resolved === 0) return 92.5; // Baseline
    // Compute a mock satisfaction rating based on resolved tickets
    return Math.min(98.5, Math.max(90, 92 + (resolved * 0.5)));
  });

  avgResponseTime = computed(() => {
    const list = this.ticketService.tickets();
    const urgentCount = list.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length;
    // Lower load means faster response times
    const minutes = Math.max(8, 12 + urgentCount * 3);
    return `${minutes}m`;
  });

  avgResolveTime = computed(() => {
    const list = this.ticketService.tickets();
    const openCount = list.filter(t => t.status === 'Open').length;
    const hours = Math.max(1, 1 + Math.floor(openCount / 3));
    const mins = (openCount * 12) % 60;
    return `${hours}h ${mins}m`;
  });

  activeAgents = computed(() => {
    // Only show agents that are not Offline
    return this.agentService.agents().filter(a => a.status !== 'Offline').map(a => {
      // Count resolved tickets or baseline resolved count
      const userResolved = this.ticketService.tickets().filter(t => t.status === 'Resolved').length;
      const baseResolved = a.role === 'Admin' ? 22 : (a.role.includes('Lead') ? 18 : 12);
      return {
        ...a,
        resolved: baseResolved + userResolved
      };
    });
  });
}
