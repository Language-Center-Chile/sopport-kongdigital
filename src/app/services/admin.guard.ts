import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AgentService } from './agent.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const agentService = inject(AgentService);
  
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const current = agentService.currentAgent();
  
  if (current && current.role === 'Admin') {
    return true;
  }
  
  if (isBrowser) {
    router.navigate(['/dashboard']);
  }
  return false;
};
