import { Component, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketService, Ticket } from '../../services/ticket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html'
})
export class HeaderComponent {
  readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);
  
  @Output() createTicket = new EventEmitter<void>();

  showNotifications = signal(false);
  showHelp = signal(false);

  // Notifications: New / Open tickets
  newTickets = computed(() => {
    return this.ticketService.tickets().filter(t => t.status === 'Open');
  });

  openTicketsCount = computed(() => {
    return this.newTickets().length;
  });

  // Contextual help based on current route URL
  helpContent = computed(() => {
    const url = this.router.url;
    if (url.includes('/dashboard')) {
      return {
        title: 'Ayuda: Dashboard Central',
        description: 'Aquí puedes monitorear el rendimiento general de la mesa de ayuda. Visualiza la satisfacción del cliente, tiempos promedios de respuesta y los agentes activos de Kong Digital en tiempo real.'
      };
    } else if (url.includes('/tickets')) {
      return {
        title: 'Ayuda: Bandeja de Tickets',
        description: 'Muestra todos los incidentes (INC) y requerimientos (REQ). Utiliza el buscador inteligente en la cabecera para encontrar tickets por ID o texto. Puedes reasignar prioridades y actualizar estados en la tabla.'
      };
    } else if (url.includes('/agents')) {
      return {
        title: 'Ayuda: Directorio de Agentes',
        description: 'Directorio público con la disponibilidad (Online, En Pausa, Offline) de todo el personal de soporte. Comunícate o revisa el rol de tus compañeros de equipo.'
      };
    } else if (url.includes('/admin-panel')) {
      return {
        title: 'Ayuda: Panel de Administración',
        description: 'Acceso restringido para administradores. Agrega nuevos agentes generando contraseñas seguras, edita roles y revisa claves de acceso. No puedes degradar tu propio rol activo desde tu sesión.'
      };
    } else if (url.includes('/settings')) {
      return {
        title: 'Ayuda: Ajustes de Perfil',
        description: 'Configura tus datos básicos de agente, tales como nombre y rol visualizado en el sistema.'
      };
    } else {
      return {
        title: 'Ayuda: Portal de Soporte',
        description: 'Gestiona tickets, atiende solicitudes de clientes y mantén al día el estado de tu disponibilidad en el portal de soporte corporativo.'
      };
    }
  });

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.ticketService.searchQuery.set(value);
  }

  onCreateTicketClick() {
    this.createTicket.emit();
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showHelp.set(false);
    this.showNotifications.update(v => !v);
  }

  toggleHelp(event: Event) {
    event.stopPropagation();
    this.showNotifications.set(false);
    this.showHelp.update(v => !v);
  }

  closePopovers() {
    this.showNotifications.set(false);
    this.showHelp.set(false);
  }
}
