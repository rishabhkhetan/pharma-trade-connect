import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-approval.html',
  styleUrls: ['./admin-approval.css']
})
export class AdminApprovalComponent implements OnInit {
  pendingUsers: User[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.getPendingUsers().subscribe({
      next: (users) => {
        this.pendingUsers = users;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load pending users';
        this.loading = false;
      }
    });
  }

  approveUser(user: User): void {
    if (!user.id) return;

    if (confirm(`Approve user "${user.name}" (${user.email})?`)) {
      this.authService.approveUser(user.id).subscribe({
        next: () => {
          this.successMessage = `User "${user.name}" approved successfully!`;
          this.loadPendingUsers();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to approve user';
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (!user.id) return;

    if (confirm(`Delete user "${user.name}" (${user.email})? This action cannot be undone.`)) {
      this.authService.deleteUser(user.id).subscribe({
        next: () => {
          this.successMessage = `User "${user.name}" deleted successfully!`;
          this.loadPendingUsers();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete user';
        }
      });
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}