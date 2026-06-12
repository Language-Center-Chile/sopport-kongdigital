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
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly initialTickets: Omit<Ticket, 'id'>[] = [
    {
      type: 'INC',
      title: 'Unable to process payment via bank transfer',
      description: 'User is getting a 403 error during the final checkout stage when clicking on bank transfer payment option.',
      customer: {
        name: 'Sarah Miller',
        plan: 'Enterprise Plan',
        initials: 'SM'
      },
      status: 'Open',
      priority: 'Urgent',
      activity: {
        time: '12 mins ago',
        description: 'Updated by System'
      },
      createdAt: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      type: 'REQ',
      title: 'Request for data export (GDPR)',
      description: 'Compliance team needs full audit logs for the last quarter of data exports to fulfill their annual GDPR reporting requirement.',
      customer: {
        name: 'James D.',
        plan: 'Growth Plan',
        initials: 'JD'
      },
      status: 'In Progress',
      priority: 'Medium',
      activity: {
        time: '2 hours ago',
        description: 'Alex T. commented'
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      type: 'INC',
      title: 'Broken link in footer documentation',
      description: 'The "Privacy Policy" link in the footer leads to a 404 page. Needs updating across all system subdomains.',
      customer: {
        name: 'Linda Wu',
        plan: 'Free Plan',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
      },
      status: 'Resolved',
      priority: 'Low',
      activity: {
        time: '5 hours ago',
        description: 'Closed by System'
      },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      type: 'INC',
      title: 'API rate limits being hit prematurely',
      description: 'Customer reports hitting limits at 50% of their monthly allocated tier. Investigation needed on request counter sync.',
      customer: {
        name: 'Robert T.',
        plan: 'Enterprise Plus',
        initials: 'RT'
      },
      status: 'Open',
      priority: 'Urgent',
      activity: {
        time: 'Just now',
        description: 'New arrival'
      },
      createdAt: new Date()
    },
    {
      type: 'REQ',
      title: 'Billing tier upgrade request',
      description: 'Client wants to upgrade from Growth to Enterprise Plan starting next month. Billing details are verified.',
      customer: {
        name: 'Michael Chen',
        plan: 'Growth Plan',
        initials: 'MC'
      },
      status: 'In Progress',
      priority: 'Medium',
      activity: {
        time: '1 day ago',
        description: 'Support Agent assigned'
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      type: 'INC',
      title: 'Mobile app crash on dashboard refresh',
      description: 'Several Android users reporting crash on startup when dashboard feeds are loading.',
      customer: {
        name: 'Sofia Rodriguez',
        plan: 'Enterprise Plan',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      status: 'Resolved',
      priority: 'Urgent',
      activity: {
        time: '2 days ago',
        description: 'Hotfix deployed'
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

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
  }

  private loadLocalTickets() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const local = localStorage.getItem('tickets_fallback');
      if (local) {
        const parsed = JSON.parse(local).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
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
      createdAt: new Date()
    };

    this.tickets.update(prev => [addedTicket, ...prev]);
    this.saveLocalTickets();
  }

  async updateStatus(id: string, status: Ticket['status']) {
    this.tickets.update(prev =>
      prev.map(t => t.id === id ? { ...t, status, activity: { time: 'Just now', description: `Status updated to ${status}` } } : t)
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
