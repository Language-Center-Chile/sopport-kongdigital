import { Injectable, signal, computed } from '@angular/core';

export interface Customer {
  name: string;
  plan: string;
  avatarUrl?: string;
  initials?: string;
}

export interface TicketActivity {
  time: string;
  description: string;
}

export interface Ticket {
  id: string;
  type: 'INC' | 'REQ';
  title: string;
  description: string;
  customer: Customer;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'Urgent';
  activity: TicketActivity;
  createdAt: Date;
  firstResponseAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly initialTickets: Omit<Ticket, 'id'>[] = [];

  readonly tickets = signal<Ticket[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('All');
  readonly sortBy = signal<'Newest' | 'Oldest'>('Newest');

  readonly stats = computed(() => {
    const list = this.tickets();
    
    const openInList = list.filter(t => t.status === 'Open').length;
    const progressInList = list.filter(t => t.status === 'In Progress').length;
    const urgentInList = list.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length;
    const resolvedInList = list.filter(t => t.status === 'Resolved').length;

    return {
      totalOpen: openInList,
      inProgress: progressInList,
      urgent: urgentInList,
      resolved: resolvedInList
    };
  });

  readonly filteredTickets = computed(() => {
    let result = [...this.tickets()];
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    if (query) {
      result = result.filter(ticket => 
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.customer.name.toLowerCase().includes(query) ||
        ticket.customer.plan.toLowerCase().includes(query) ||
        ticket.priority.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query) ||
        ticket.type.toLowerCase().includes(query)
      );
    }

    if (status !== 'All') {
      result = result.filter(ticket => ticket.status === status);
    }

    const sortOrder = this.sortBy();
    result.sort((a, b) => {
      if (sortOrder === 'Newest') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    });

    return result;
  });

  constructor() {
    this.loadLocalTickets();
    this.setupTabSync();
  }

  private setupTabSync() {
    if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'tickets_fallback') {
          this.loadLocalTickets();
        }
      });
    }
  }

  private loadLocalTickets() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Force clear old demo tickets once
      if (!localStorage.getItem('tickets_demo_cleaned_v1')) {
        localStorage.removeItem('tickets_fallback');
        localStorage.setItem('tickets_demo_cleaned_v1', 'true');
      }

      const local = localStorage.getItem('tickets_fallback');
      if (local) {
        const parsed = JSON.parse(local).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          firstResponseAt: t.firstResponseAt ? new Date(t.firstResponseAt) : undefined
        }));
        this.tickets.set(parsed);
        return;
      }
    }
    
    // Fallback/Default tickets setup
    const initialWithIds: Ticket[] = this.initialTickets.map((t, index) => ({
      ...t,
      id: `INC-${1000 + index}`
    }));
    this.tickets.set(initialWithIds);
    this.saveLocalTickets();
  }

  private saveLocalTickets() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('tickets_fallback', JSON.stringify(this.tickets()));
    }
  }

  async addTicket(newTicket: {
    title: string;
    description: string;
    customerName: string;
    customerPlan: string;
    status: Ticket['status'];
    priority: Ticket['priority'];
  }) {
    const generatedId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const addedTicket: Ticket = {
      id: generatedId,
      type: newTicket.priority === 'Urgent' ? 'INC' : 'REQ',
      title: newTicket.title,
      description: newTicket.description,
      customer: {
        name: newTicket.customerName,
        plan: newTicket.customerPlan,
        initials: this.getInitials(newTicket.customerName)
      },
      status: newTicket.status,
      priority: newTicket.priority,
      activity: {
        time: 'Just now',
        description: 'Ticket created'
      },
      createdAt: new Date(),
      firstResponseAt: newTicket.status !== 'Open' ? new Date() : undefined
    };

    this.tickets.update(prev => [addedTicket, ...prev]);
    this.saveLocalTickets();
  }

  async updateStatus(id: string, status: Ticket['status']) {
    this.tickets.update(prev =>
      prev.map(t => {
        if (t.id === id) {
          const firstResponseAt = (status !== 'Open' && !t.firstResponseAt) ? new Date() : t.firstResponseAt;
          return {
            ...t,
            status,
            firstResponseAt,
            activity: { time: 'Just now', description: `Status updated to ${status}` }
          };
        }
        return t;
      })
    );
    this.saveLocalTickets();
  }

  async updatePriority(id: string, priority: Ticket['priority']) {
    this.tickets.update(prev =>
      prev.map(t => t.id === id ? { ...t, priority, type: priority === 'Urgent' ? 'INC' : 'REQ', activity: { time: 'Just now', description: `Priority updated to ${priority}` } } : t)
    );
    this.saveLocalTickets();
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
