import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, Agent } from '../../services/agent.service';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agents.html'
})
export class AgentsComponent {
  readonly agentService = inject(AgentService);

  // Search & Filter
  searchQuery = signal('');
  
  // Modal states
  showAddModal = signal(false);
  showEditModal = signal(false);
  
  // Form fields
  formName = '';
  formEmail = '';
  formRole = 'Support Agent';
  selectedAgentId: string | null = null;
  errorMessage = '';

  // Filtered agents list
  get filteredAgents() {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.agentService.agents();
    if (!query) return list;
    return list.filter(a => 
      a.name.toLowerCase().includes(query) || 
      a.email.toLowerCase().includes(query) || 
      a.role.toLowerCase().includes(query)
    );
  }

  get currentAgentId() {
    return this.agentService.currentAgent()?.id || null;
  }

  // Active metrics
  get totalAgentsCount() {
    return this.agentService.agents().length;
  }

  get activeAgentsCount() {
    return this.agentService.agents().filter(a => a.status === 'Active').length;
  }

  get breakAgentsCount() {
    return this.agentService.agents().filter(a => a.status === 'On Break').length;
  }

  openAddModal() {
    this.formName = '';
    this.formEmail = '';
    this.formRole = 'Support Agent';
    this.errorMessage = '';
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  async onAddAgentSubmit() {
    this.errorMessage = '';
    if (!this.formName || !this.formEmail || !this.formRole) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    try {
      await this.agentService.addAgent(this.formName, this.formEmail, this.formRole);
      this.closeAddModal();
    } catch (e: any) {
      this.errorMessage = e.message || 'Error al agregar el agente.';
    }
  }

  openEditModal(agent: Agent) {
    this.selectedAgentId = agent.id;
    this.formName = agent.name;
    this.formEmail = agent.email; // Email is not editable
    this.formRole = agent.role;
    this.errorMessage = '';
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedAgentId = null;
  }

  async onEditAgentSubmit() {
    this.errorMessage = '';
    if (!this.formName || !this.formRole || !this.selectedAgentId) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    try {
      await this.agentService.editAgent(this.selectedAgentId, this.formName, this.formRole);
      this.closeEditModal();
    } catch (e: any) {
      this.errorMessage = e.message || 'Error al actualizar el agente.';
    }
  }
}
