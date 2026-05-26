import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-new-ticket-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-ticket-modal.html'
})
export class NewTicketModalComponent {
  private readonly ticketService = inject(TicketService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  // Form Fields
  subject = '';
  category = 'Select a category';
  description = '';
  priority = 'Low - General inquiry';
  customerName = 'Alex Thompson';
  customerPlan = 'Enterprise Plan';

  categories = ['Select a category', 'Bug Report', 'Feature Request', 'Technical Support', 'Billing Inquiry', 'Other'];
  priorities = ['Low - General inquiry', 'Medium - Standard issue', 'High - Critical problem'];

  onSubmit() {
    if (!this.subject) {
      return;
    }

    // Map the priority to the existing format
    let mappedPriority: 'Low' | 'Medium' | 'Urgent' = 'Medium';
    if (this.priority.includes('Low')) mappedPriority = 'Low';
    if (this.priority.includes('High')) mappedPriority = 'Urgent';

    this.ticketService.addTicket({
      title: this.subject,
      description: this.description || 'No description provided.',
      customerName: this.customerName,
      customerPlan: this.customerPlan,
      status: 'Open',
      priority: mappedPriority
    });

    this.resetForm();
    this.close.emit();
  }

  onCancel() {
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.subject = '';
    this.category = 'Select a category';
    this.description = '';
    this.priority = 'Low - General inquiry';
  }
}
