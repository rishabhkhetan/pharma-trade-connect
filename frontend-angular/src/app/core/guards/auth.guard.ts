import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function getStoredUser(): any | null {
  try {
    const s = localStorage.getItem('pt_user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export const authGuard: CanActivateFn = () => {
  const user = getStoredUser();
  if (user) return true;
  inject(Router).navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const user = getStoredUser();
  if (user && (user.role === 'ADMIN' || user.role === 'admin')) return true;
  inject(Router).navigate(['/login']);
  return false;
};
