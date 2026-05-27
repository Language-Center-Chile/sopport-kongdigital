import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

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
  private readonly supabase = inject(SupabaseService);

  // Base tickets matching the screenshot and some extra for interactivity
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

  // Core state signals
  readonly tickets = signal<Ticket[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('All');
  readonly sortBy = signal<'Newest' | 'Oldest'>('Newest');

  readonly stats = computed(() => {
    const list = this.tickets();
    
    // Count status from the active array
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

  constructor() {
    this.initSupabaseConnection();
  }

  private async initSupabaseConnection() {
    await this.loadTicketsFromDatabase();
  }

  // Load from Postgres and map to local structures
  private async loadTicketsFromDatabase() {
    try {
      const { data: dbTickets, error } = await this.supabase.client
        .from('tickets')
        .select(`
          id,
          subject,
          description,
          assigned_to,
          created_at,
          user:users(id, name, email, role),
          status:statuses(id, name),
          priority:priorities(id, name)
        `);

      if (error) {
        console.error('Error loading tickets from Supabase:', error);
        return;
      }

      // If database is completely empty, seed it with the mock data!
      if (!dbTickets || dbTickets.length === 0) {
        console.log('Postgres database is empty. Seeding initial tickets...');
        await this.seedDatabase();
        await this.loadTicketsFromDatabase();
        return;
      }

      const mapped: Ticket[] = dbTickets.map((t: any) => {
        const priorityName = t.priority?.name || 'Low';
        return {
          id: t.id,
          type: priorityName === 'Urgent' ? 'INC' : 'REQ',
          title: t.subject,
          description: t.description || 'No description provided.',
          customer: {
            name: t.user?.name || 'Unknown User',
            plan: t.user?.role || 'Growth Plan',
            initials: this.getInitials(t.user?.name || 'Unknown User')
          },
          status: t.status?.name || 'Open',
          priority: priorityName,
          activity: {
            time: 'Just now',
            description: `Assigned to ${t.assigned_to || 'None'}`
          },
          createdAt: new Date(t.created_at)
        };
      });

      this.tickets.set(mapped);
    } catch (e) {
      console.error('Failed to connect and sync with Supabase', e);
    }
  }

  // Seed the empty database with mock tickets and link them to categories
  private async seedDatabase() {
    try {
      const { data: statuses } = await this.supabase.client.from('statuses').select('*');
      const { data: priorities } = await this.supabase.client.from('priorities').select('*');
      const { data: users } = await this.supabase.client.from('users').select('*');

      if (!statuses || !priorities || !users || users.length === 0) {
        console.warn('Database dependencies missing for seed.');
        return;
      }

      const defaultUser = users[0];

      for (const t of this.initialTickets) {
        const statusId = statuses.find((s: any) => s.name === t.status)?.id;
        const priorityId = priorities.find((p: any) => p.name === t.priority)?.id;

        await this.supabase.client.from('tickets').insert({
          subject: t.title,
          description: t.description,
          user_id: defaultUser.id,
          assigned_to: 'Alex Thompson',
          status_id: statusId,
          priority_id: priorityId,
          created_at: t.createdAt.toISOString()
        });
      }
      console.log('Database successfully seeded!');
    } catch (e) {
      console.error('Error seeding database:', e);
    }
  }

  // Add a ticket
  async addTicket(newTicket: {
    title: string;
    description: string;
    customerName: string;
    customerPlan: string;
    status: Ticket['status'];
    priority: Ticket['priority'];
  }) {
    try {
      const { data: statuses } = await this.supabase.client.from('statuses').select('*');
      const { data: priorities } = await this.supabase.client.from('priorities').select('*');
      const { data: users } = await this.supabase.client.from('users').select('*');

      if (!statuses || !priorities || !users) return;

      // Find or create user
      let user = users.find((u: any) => u.name && u.name.trim().toLowerCase() === newTicket.customerName.trim().toLowerCase());
      if (!user) {
        if (users.length > 0) {
          user = users[0];
        } else {
          const { data: newUser } = await this.supabase.client
            .from('users')
            .insert({
              name: newTicket.customerName,
              email: `${newTicket.customerName.toLowerCase().replace(' ', '')}@example.com`,
              role: newTicket.customerPlan
            })
            .select()
            .single();
          user = newUser;
        }
      }

      // Safe fallback status
      let statusId = statuses.find((s: any) => s.name.trim().toLowerCase() === newTicket.status.trim().toLowerCase())?.id;
      if (!statusId && statuses.length > 0) {
        statusId = statuses[0].id;
      }

      // Safe fallback priority
      let priorityId = priorities.find((p: any) => p.name.trim().toLowerCase() === newTicket.priority.trim().toLowerCase())?.id;
      if (!priorityId && priorities.length > 0) {
        priorityId = priorities[0].id;
      }

      const { error } = await this.supabase.client.from('tickets').insert({
        subject: newTicket.title,
        description: newTicket.description,
        user_id: user?.id,
        status_id: statusId,
        priority_id: priorityId
      });

      if (error) {
        console.error('Failed to create ticket in Supabase:', error);
        throw error;
      }

      await this.loadTicketsFromDatabase();
    } catch (e) {
      console.error('Failed to add ticket to Supabase:', e);
      throw e;
    }
  }

  // Update status
  async updateStatus(id: string, status: Ticket['status']) {
    try {
      const { data: statuses } = await this.supabase.client.from('statuses').select('*');
      if (!statuses) return;

      const statusId = statuses.find((s: any) => s.name === status)?.id;
      
      const { error } = await this.supabase.client
        .from('tickets')
        .update({ status_id: statusId })
        .eq('id', id);

      if (error) {
        console.error('Failed to update status in Supabase:', error);
      }

      await this.loadTicketsFromDatabase();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  }

  // Update priority
  async updatePriority(id: string, priority: Ticket['priority']) {
    try {
      const { data: priorities } = await this.supabase.client.from('priorities').select('*');
      if (!priorities) return;

      const priorityId = priorities.find((p: any) => p.name === priority)?.id;

      const { error } = await this.supabase.client
        .from('tickets')
        .update({ priority_id: priorityId })
        .eq('id', id);

      if (error) {
        console.error('Failed to update priority in Supabase:', error);
      }

      await this.loadTicketsFromDatabase();
    } catch (e) {
      console.error('Failed to update priority:', e);
    }
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
