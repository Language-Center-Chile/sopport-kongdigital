import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly agentService = inject(AgentService);

  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  async onSubmit() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await this.agentService.login(this.email(), this.password());
      this.isLoading.set(false);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.isLoading.set(false);
      this.errorMessage.set(e.message || 'Error de inicio de sesión.');
    }
  }
}
