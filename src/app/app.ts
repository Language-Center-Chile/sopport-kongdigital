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
    // #region debug-point D:initial-route
    if (typeof window !== 'undefined') { fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'project-not-showing', runId: 'pre-fix', hypothesisId: 'D', location: 'src/app/app.ts:constructor', msg: '[DEBUG] App bootstrapped', data: { pathname: window.location.pathname, href: window.location.href }, ts: Date.now() }) }).catch(() => {}); }
    // #endregion
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // #region debug-point A:navigation-end
      fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'project-not-showing', runId: 'pre-fix', hypothesisId: 'A', location: 'src/app/app.ts:navigation', msg: '[DEBUG] NavigationEnd received', data: { url: event.url, urlAfterRedirects: event.urlAfterRedirects }, ts: Date.now() }) }).catch(() => {});
      // #endregion
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
