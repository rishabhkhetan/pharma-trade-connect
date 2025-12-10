// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup').then(m => m.SignupComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent),
    // Optional guard: canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // ⭐ NEW — Product Dashboard Route
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/product-dashboard/product-dashboard')
        .then(m => m.ProductDashboardComponent),
    canActivate: [authGuard]   // Only logged-in users can view products
  },

  {
    path: 'admin-approval',
    loadComponent: () =>
      import('./pages/admin-approval/admin-approval').then(m => m.AdminApprovalComponent),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '/login' }
];