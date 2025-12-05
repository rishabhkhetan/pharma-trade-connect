import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validate passwords match
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      name: this.formData.name,
      email: this.formData.email,
      password: this.formData.password,
      role: 'RETAILER' as const,
      isApproved: 'NO' as const
    };

    this.authService.signup(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Account created successfully! Please wait for admin approval before logging in.';
        
        // Reset form
        this.formData = {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        };

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Signup failed. Please try again.';
        console.error('Signup error:', error);
      }
    });
  }
}