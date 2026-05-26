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
  // Base tickets matching the screenshot and some extra for interactivity
  private readonly initialTickets: Ticket[] = [
    {
      id: 'INC-4921',
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
      id: 'REQ-2083',
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
      id: 'INC-4919',
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
      id: 'INC-4925',
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
      id: 'REQ-2084',
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
      id: 'INC-4918',
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

  // Core state signals
  readonly tickets = signal<Ticket[]>(this.initialTickets);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('All');
  readonly sortBy = signal<'Newest' | 'Oldest'>('Newest');

  // Stats offset to match image exactly (Total Open = 1284, In Progress = 432, Urgent = 18, Resolved = 85)
  // Our initial list has:
  // Open: 2, In Progress: 2, Urgent: 3, Resolved: 2
  // We'll offset dynamically
  readonly stats = computed(() => {
    const list = this.tickets();
    
    // Count status from the active array
    const openInList = list.filter(t => t.status === 'Open').length;
    const progressInList = list.filter(t => t.status === 'In Progress').length;
    const urgentInList = list.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length;
    const resolvedInList = list.filter(t => t.status === 'Resolved').length;

    // Apply offset based on target:
    // Target open = 1284 -> offset = 1284 - 2 = 1282
    // Target progress = 432 -> offset = 432 - 2 = 430
    // Target urgent = 18 -> offset = 18 - 2 = 16 (only count open/in progress urgent)
    // Target resolved = 85 -> offset = 85 - 2 = 83
    return {
      totalOpen: 1282 + openInList,
      inProgress: 430 + progressInList,
      urgent: 16 + urgentInList,
      resolved: 83 + resolvedInList
    };
  });

  // Filtered and sorted tickets
  readonly filteredTickets = computed(() => {
    let result = [...this.tickets()];
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    // 1. Search Query Filter
    if (query) {
      result = result.filter(ticket => 
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.customer.name.toLowerCase().includes(query) ||
        ticket.customer.plan.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter
    if (status !== 'All') {
      result = result.filter(ticket => ticket.status === status);
    }

    // 3. Sorting
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

  // Add a ticket
  addTicket(newTicket: {
    title: string;
    description: string;
    customerName: string;
    customerPlan: string;
    status: Ticket['status'];
    priority: Ticket['priority'];
  }) {
    // Generate new ticket ID based on count
    const ticketCount = this.tickets().length;
    const isInc = newTicket.priority === 'Urgent' || Math.random() > 0.5;
    const prefix = isInc ? 'INC' : 'REQ';
    const id = `${prefix}-${4925 + ticketCount}`;

    const created: Ticket = {
      id,
      type: isInc ? 'INC' : 'REQ',
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
        description: 'New arrival'
      },
      createdAt: new Date()
    };

    this.tickets.update(t => [created, ...t]);
  }

  // Update status
  updateStatus(id: string, status: Ticket['status']) {
    this.tickets.update(list => 
      list.map(t => t.id === id ? { 
        ...t, 
        status,
        activity: {
          time: 'Just now',
          description: `Status updated to ${status}`
        }
      } : t)
    );
  }

  // Update priority
  updatePriority(id: string, priority: Ticket['priority']) {
    this.tickets.update(list => 
      list.map(t => t.id === id ? { 
        ...t, 
        priority,
        activity: {
          time: 'Just now',
          description: `Priority updated to ${priority}`
        }
      } : t)
    );
  }

  private getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
