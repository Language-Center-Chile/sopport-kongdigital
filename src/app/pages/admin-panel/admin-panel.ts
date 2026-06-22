import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, Agent } from '../../services/agent.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html'
})
export class AdminPanelComponent {
  readonly agentService = inject(AgentService);

  // Search & Filters
  searchQuery = signal('');

  // Modals state
  showAddModal = signal(false);
  showEditModal = signal(false);
  showPasswordReveal = signal(false);
  showDeleteConfirmModal = signal(false);

  // Form states
  formName = '';
  formEmail = '';
  formRole = 'Support Agent';
  selectedAgentId: string | null = null;
  errorMessage = '';
  generatedPassword = '';
  agentToDelete: Agent | null = null;

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

  openAddModal() {
    this.formName = '';
    this.formEmail = '';
    this.formRole = 'Support Agent';
    this.errorMessage = '';
    this.generatedPassword = '';
    this.showPasswordReveal.set(false);
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  copied = signal(false);

  closePasswordModal() {
    this.showPasswordReveal.set(false);
    this.generatedPassword = '';
    this.copied.set(false);
  }

  copyPassword() {
    if (this.generatedPassword && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.generatedPassword);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  async onAddAgentSubmit() {
    this.errorMessage = '';
    if (!this.formName || !this.formEmail || !this.formRole) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    try {
      const added = await this.agentService.addAgent(this.formName, this.formEmail, this.formRole);
      this.generatedPassword = added.password || '';
      this.showAddModal.set(false); // Close the creation modal
      this.showPasswordReveal.set(true); // Open the password modal
    } catch (e: any) {
      this.errorMessage = e.message || 'Error al crear el agente.';
    }
  }

  openEditModal(agent: Agent) {
    this.selectedAgentId = agent.id;
    this.formName = agent.name;
    this.formEmail = agent.email;
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

  openDeleteConfirm(agent: Agent) {
    if (agent.id === this.currentAgentId) {
      return; // Cannot delete self
    }
    this.agentToDelete = agent;
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirmModal.set(false);
    this.agentToDelete = null;
  }

  async onDeleteConfirm() {
    if (!this.agentToDelete) return;
    try {
      await this.agentService.deleteAgent(this.agentToDelete.id);
      this.closeDeleteConfirm();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar agente.');
    }
  }
}
