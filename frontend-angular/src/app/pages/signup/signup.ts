import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as '' | 'RETAILER' | 'CLINIC' | 'ADMIN'
  };

  // File / license state (UI-only until backend supports upload)
  selectedFile: File | null = null;
  fileName: string | null = null;
  fileError: string | null = null;

  // UI state
  errorMessage = '';
  successMessage = '';
  loading = false;

  readonly MAX_BYTES = 2 * 1024 * 1024; // 2 MB

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Called when file input changes
  onFileSelected(event: Event) {
    this.fileError = null;
    this.selectedFile = null;
    this.fileName = null;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const f = input.files[0];

    // Mime type + size checks
    if (f.type !== 'application/pdf') {
      this.fileError = 'Only PDF files are allowed.';
      return;
    }
    if (f.size > this.MAX_BYTES) {
      this.fileError = 'File too large. Max 2 MB allowed.';
      return;
    }

    this.selectedFile = f;
    this.fileName = f.name;
  }

  // Helper used in template to disable submit if license missing
  requiresLicense(): boolean {
    return this.formData.role === 'RETAILER' || this.formData.role === 'CLINIC';
  }

  // Submit handler
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Basic client validations
    if (!this.formData.name || this.formData.name.trim().length < 3) {
      this.errorMessage = 'Please enter a valid name (min 3 characters).';
      return;
    }
    if (!this.formData.email) {
      this.errorMessage = 'Email is required.';
      return;
    }
    if (!this.formData.password || this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (!this.formData.role) {
      this.errorMessage = 'Please select a role.';
      return;
    }
    if (this.requiresLicense() && !this.selectedFile) {
      this.errorMessage = 'License PDF is required for this role.';
      return;
    }

    // Build payload for mock backend (json-server)
    // Important: include licenseUrl: null as placeholder for future real uploads
    const payload: any = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim(),
      password: this.formData.password, // mock; real backend will hash
      role: this.formData.role,
      isApproved: this.formData.role === 'ADMIN' ? 'YES' : 'NO',
      hasLicense: !!this.selectedFile,
      licenseUrl: null,                    // placeholder for real backend upload URL
      createdAt: new Date().toISOString()
    };

    this.loading = true;

    this.authService.signup(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (_res) => {
          this.successMessage = 'Account created successfully. Waiting for admin approval.';
          // reset local form state
          this.formData = { name: '', email: '', password: '', confirmPassword: '', role: '' };
          this.selectedFile = null;
          this.fileName = null;
          this.fileError = null;

          // redirect to login after a short delay
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          console.error('Signup error', err);
          // show backend message or generic fallback
          this.errorMessage = (err?.error && err?.error?.message) || err?.message || 'Signup failed. Please try again.';
        }
      });
  }
}