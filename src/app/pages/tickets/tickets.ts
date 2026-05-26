import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService, Ticket } from '../../services/ticket.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.html'
})
export class TicketsComponent {
  readonly ticketService = inject(TicketService);

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = 4;

  // Selected Tickets IDs
  readonly selectedTicketIds = signal<Set<string>>(new Set());

  // Reset page when search or status filters change
  constructor() {
    effect(() => {
      this.ticketService.searchQuery();
      this.ticketService.statusFilter();
      this.currentPage.set(1);
    });
  }

  // Paginated tickets
  readonly paginatedTickets = computed(() => {
    const list = this.ticketService.filteredTickets();
    const start = (this.currentPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  // Total pages
  readonly totalPages = computed(() => {
    const totalCount = this.ticketService.filteredTickets().length;
    return Math.max(1, Math.ceil(totalCount / this.pageSize));
  });

  // Pagination display range text
  readonly paginationRangeText = computed(() => {
    const totalCount = this.ticketService.filteredTickets().length;
    if (totalCount === 0) return 'Showing 0 to 0 of 0 results';
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, totalCount);
    // To match the UI layout numbers, let's keep the real counts or scale them
    // Let's output the real counts from the array
    return `Showing ${start} to ${end} of ${totalCount} results`;
  });

  // Toggle selection
  toggleSelect(ticketId: string) {
    this.selectedTicketIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  }

  // Toggle select all on current page
  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const pageTickets = this.paginatedTickets();
    
    this.selectedTicketIds.update(set => {
      const newSet = new Set(set);
      for (const t of pageTickets) {
        if (isChecked) {
          newSet.add(t.id);
        } else {
          newSet.delete(t.id);
        }
      }
      return newSet;
    });
  }

  isTicketSelected(ticketId: string): boolean {
    return this.selectedTicketIds().has(ticketId);
  }

  isAllOnPageSelected(): boolean {
    const pageTickets = this.paginatedTickets();
    if (pageTickets.length === 0) return false;
    return pageTickets.every(t => this.selectedTicketIds().has(t.id));
  }

  // Change Sort
  toggleSort() {
    this.ticketService.sortBy.update(s => s === 'Newest' ? 'Oldest' : 'Newest');
  }

  // Quick Filter status
  setFilter(status: string) {
    this.ticketService.statusFilter.set(status);
  }

  // Quick action status update
  updateTicketStatus(ticketId: string, status: Ticket['status']) {
    this.ticketService.updateStatus(ticketId, status);
  }

  // CSV Export (Mock)
  exportToCSV() {
    const list = this.ticketService.filteredTickets();
    if (list.length === 0) {
      alert('No tickets to export.');
      return;
    }

    const headers = ['ID', 'Type', 'Title', 'Customer', 'Plan', 'Status', 'Priority', 'Last Activity'];
    const rows = list.map(t => [
      t.id,
      t.type,
      t.title,
      t.customer.name,
      t.customer.plan,
      t.status,
      t.priority,
      `${t.activity.time} - ${t.activity.description}`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `support_tickets_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
