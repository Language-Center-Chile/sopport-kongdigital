import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'On Break' | 'Offline';
  avatar: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly router = inject(Router);

  private readonly defaultAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Alex Thompson',
      email: 'alex@kong.cl',
      role: 'Admin',
      status: 'Offline',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      password: 'Admin1234567'
    },
    {
      id: 'agent-2',
      name: 'Sarah Connor',
      email: 'sarah.connor@kong.cl',
      role: 'Support Agent',
      status: 'Offline',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      password: 'Agent1234567'
    },
    {
      id: 'agent-3',
      name: 'Marcus Aurelius',
      email: 'marcus.aurelius@kong.cl',
      role: 'Support Agent',
      status: 'Offline',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
      password: 'Agent1234567'
    }
  ];

  readonly agents = signal<Agent[]>([]);
  readonly currentAgent = signal<Agent | null>(null);

  constructor() {
    this.initAgents();
  }

  private initAgents() {
    const isBrowser = typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
    
    // Load shared database from localStorage
    this.loadLocalAgents();

    if (isBrowser) {
      // Restore session from sessionStorage to enable multi-tab support
      const activeSessionId = sessionStorage.getItem('active_agent_id');
      if (activeSessionId) {
        const active = this.agents().find(a => a.id === activeSessionId);
        if (active) {
          this.currentAgent.set(active);
          if (active.status === 'Offline') {
            this.updateStatus(active.id, 'Active');
          }
        }
      }
    }
  }

  private loadLocalAgents() {
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    const local = isBrowser ? localStorage.getItem('support_agents') : null;
    if (local) {
      const parsed: Agent[] = JSON.parse(local);
      const migrated = parsed.map(a => {
        if (a.email === 'alex.thompson@kong.cl') {
          return { ...a, email: 'alex@kong.cl' };
        }
        return a;
      });
      if (!migrated.some(a => a.email === 'alex@kong.cl')) {
        migrated.push(this.defaultAgents[0]);
      }
      this.agents.set(migrated);
      this.saveLocalAgents();
    } else {
      this.agents.set(this.defaultAgents);
      this.saveLocalAgents();
    }
  }

  private saveLocalAgents() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('support_agents', JSON.stringify(this.agents()));
    }
  }

  generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async login(email: string, passwordInput: string): Promise<boolean> {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail.endsWith('@kong.cl')) {
      throw new Error('El correo debe pertenecer al dominio @kong.cl');
    }

    const agent = this.agents().find(a => a.email.toLowerCase() === cleanedEmail);
    if (!agent) {
      throw new Error('Agente no registrado.');
    }

    if (agent.password !== passwordInput) {
      throw new Error('Contraseña incorrecta.');
    }

    await this.updateStatus(agent.id, 'Active');
    this.currentAgent.set(agent);

    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('active_agent_id', agent.id);
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    return true;
  }

  async logout() {
    const current = this.currentAgent();
    if (current) {
      await this.updateStatus(current.id, 'Offline');
    }
    this.currentAgent.set(null);
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('active_agent_id');
      sessionStorage.removeItem('isLoggedIn');
    }
    this.router.navigate(['/login']);
  }

  async updateStatus(agentId: string, status: Agent['status']) {
    this.agents.update(prev => 
      prev.map(a => a.id === agentId ? { ...a, status } : a)
    );
    this.saveLocalAgents();

    const current = this.currentAgent();
    if (current && current.id === agentId) {
      this.currentAgent.set({ ...current, status });
    }

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const localStatusMap = JSON.parse(localStorage.getItem('agent_statuses') || '{}');
      localStatusMap[agentId] = status;
      localStorage.setItem('agent_statuses', JSON.stringify(localStatusMap));
    }
  }

  async addAgent(name: string, email: string, role: string): Promise<Agent> {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail.endsWith('@kong.cl')) {
      throw new Error('El correo del agente debe pertenecer al dominio @kong.cl');
    }

    if (this.agents().some(a => a.email.toLowerCase() === cleanedEmail)) {
      throw new Error('Ya existe un agente registrado con ese correo electrónico.');
    }

    const generatedPassword = this.generateRandomPassword();

    const newAgent: Agent = {
      id: 'agent-' + Date.now(),
      name: name.trim(),
      email: cleanedEmail,
      role,
      status: 'Offline',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      password: generatedPassword
    };

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const localPasswords = JSON.parse(localStorage.getItem('agent_passwords') || '{}');
      localPasswords[newAgent.id] = generatedPassword;
      localStorage.setItem('agent_passwords', JSON.stringify(localPasswords));
    }

    this.agents.update(prev => [...prev, newAgent]);
    this.saveLocalAgents();
    return newAgent;
  }

  async editAgent(agentId: string, name: string, role: string): Promise<void> {
    const current = this.currentAgent();
    if (current && current.id === agentId && current.role !== role) {
      throw new Error('No puedes cambiar tu propio rol.');
    }

    this.agents.update(prev => 
      prev.map(a => a.id === agentId ? { ...a, name, role } : a)
    );
    this.saveLocalAgents();

    if (current && current.id === agentId) {
      this.currentAgent.set({ ...current, name, role });
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    const current = this.currentAgent();
    if (current && current.id === agentId) {
      throw new Error('No puedes eliminar tu propia cuenta activa de administrador.');
    }

    this.agents.update(prev => prev.filter(a => a.id !== agentId));
    this.saveLocalAgents();

    // Clean up local maps
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const localStatusMap = JSON.parse(localStorage.getItem('agent_statuses') || '{}');
      delete localStatusMap[agentId];
      localStorage.setItem('agent_statuses', JSON.stringify(localStatusMap));

      const localPasswords = JSON.parse(localStorage.getItem('agent_passwords') || '{}');
      delete localPasswords[agentId];
      localStorage.setItem('agent_passwords', JSON.stringify(localPasswords));
    }
  }
}
