import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly router = inject(Router);

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

    // TODO: Implement actual authentication logic here
    // Simulating API call
    setTimeout(() => {
      this.isLoading.set(false);
      // For now, allow any non-empty credentials
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}
