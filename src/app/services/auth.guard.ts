import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  // Use localStorage to check if the user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (isLoggedIn) {
    return true;
  }
  
  // Redirect to login page if not logged in
  router.navigate(['/login']);
  return false;
};
