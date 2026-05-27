import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html'
})
export class SettingsComponent {
  agentName = 'Alex Thompson';
  agentEmail = 'alex.thompson@supportdesk.com';
  agentRole = 'Lead Support Agent';
  
  notifications = {
    newTicket: true,
    urgentOnly: false,
    dailyReport: true
  };

  saved = signal(false);

  saveSettings() {
    // TODO: Implement actual save logic (API call)
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
