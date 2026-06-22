import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  const isBrowser = typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  const isLoggedIn = isBrowser && sessionStorage.getItem('isLoggedIn') === 'true';
  // #region debug-point B:auth-guard-check
  if (isBrowser) { fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'project-not-showing', runId: 'pre-fix', hypothesisId: 'B', location: 'src/app/services/auth.guard.ts:authGuard', msg: '[DEBUG] authGuard evaluated', data: { isLoggedIn, pathname: window.location.pathname }, ts: Date.now() }) }).catch(() => {}); }
  // #endregion
  
  if (isLoggedIn) {
    return true;
  }
  
  // Redirect to login page if not logged in
  if (isBrowser) {
    // #region debug-point A:auth-guard-redirect
    fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'project-not-showing', runId: 'pre-fix', hypothesisId: 'A', location: 'src/app/services/auth.guard.ts:redirect', msg: '[DEBUG] authGuard redirecting to login', data: { attemptedPath: window.location.pathname }, ts: Date.now() }) }).catch(() => {});
    // #endregion
    router.navigate(['/login']);
  }
  return false;
};
