import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  @Output() createTicket = new EventEmitter<void>();

  readonly agentService = inject(AgentService);
  showStatusDropdown = signal(false);

  onCreateTicketClick(event: Event) {
    event.preventDefault();
    this.createTicket.emit();
  }

  toggleStatusDropdown(event: Event) {
    event.stopPropagation();
    this.showStatusDropdown.update(v => !v);
  }

  async setStatus(status: 'Active' | 'On Break' | 'Offline') {
    const current = this.agentService.currentAgent();
    if (current) {
      await this.agentService.updateStatus(current.id, status);
    }
    this.showStatusDropdown.set(false);
  }

  async logout() {
    await this.agentService.logout();
  }
}
