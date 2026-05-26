import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar';
import { HeaderComponent } from './components/header/header';
import { NewTicketModalComponent } from './components/new-ticket-modal/new-ticket-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, NewTicketModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('sopport-app');
  protected readonly isCreateTicketModalOpen = signal(false);
  protected readonly isLoginPage = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage.set(event.urlAfterRedirects.includes('/login'));
    });
  }

  openCreateTicketModal() {
    this.isCreateTicketModalOpen.set(true);
  }

  closeCreateTicketModal() {
    this.isCreateTicketModalOpen.set(false);
  }
}
