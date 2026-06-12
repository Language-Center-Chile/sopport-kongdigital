import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  const isBrowser = typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  const isLoggedIn = isBrowser && sessionStorage.getItem('isLoggedIn') === 'true';
  
  if (isLoggedIn) {
    return true;
  }
  
  // Redirect to login page if not logged in
  if (isBrowser) {
    router.navigate(['/login']);
  }
  return false;
};
