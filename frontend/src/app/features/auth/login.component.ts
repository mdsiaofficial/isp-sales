import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a routerLink="/" class="inline-flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/20">
            ⚡
          </div>
          <span class="text-2xl font-black tracking-tight text-white">SwiftFiber</span>
        </a>
        <h2 class="mt-6 text-2xl font-bold tracking-tight text-slate-100">Staff Portal Login</h2>
        <p class="mt-2 text-xs text-slate-400">Sign in to access your administrative or sales operations dashboard</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          <form (ngSubmit)="onLogin()" class="space-y-5">
            <div *ngIf="errorMessage()" class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ errorMessage() }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Username or Email</label>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username" 
                required 
                placeholder="admin or agent"
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Password</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required 
                placeholder="••••••••"
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading() || !username || !password"
              class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-98">
              {{ isLoading() ? 'Verifying Credentials...' : 'Sign In to Dashboard' }}
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <p class="font-semibold text-slate-300">Default Test Accounts:</p>
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span><strong>Admin:</strong> admin / Admin&#64;123</span>
              <button (click)="fillCredentials('admin', 'Admin@123')" class="text-blue-400 hover:underline">Autofill</button>
            </div>
            <div class="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span><strong>Agent:</strong> agent / Agent&#64;123</span>
              <button (click)="fillCredentials('agent', 'Agent@123')" class="text-blue-400 hover:underline">Autofill</button>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <a routerLink="/" class="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  fillCredentials(u: string, p: string): void {
    this.username = u;
    this.password = p;
  }

  onLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/agent']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please verify credentials.');
      }
    });
  }
}
