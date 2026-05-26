import { Component } from '@angular/core';
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
    dailyReport: true,
    slackIntegration: false
  };

  saveSettings() {
    alert('Settings saved successfully!');
  }
}
