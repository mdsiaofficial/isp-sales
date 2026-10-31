import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { CustomerOrder } from '../../core/models';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <!-- Navbar -->
      <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
              ⚡
            </div>
            <span class="font-extrabold text-lg text-white">SwiftFiber Agent Portal</span>
            <span class="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Field & Sales Operations
            </span>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs text-slate-300 hidden sm:inline">
              Agent: <strong class="text-white">{{ auth.currentUser()?.fullName }}</strong>
            </span>
            <button 
              (click)="auth.logout()" 
              class="px-3 py-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-lg border border-slate-700 hover:border-red-800 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <!-- Main Operational Board -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        <!-- Header & Quick Filter Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-xl font-bold text-white">Customer Connection Queue</h2>
            <p class="text-xs text-slate-400">Review connection requests, verify installation addresses, and transition statuses.</p>
          </div>

          <!-- Status Filters -->
          <div class="flex items-center gap-2 overflow-x-auto">
            <button 
              (click)="setFilter('')" 
              [ngClass]="selectedFilter() === '' ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 transition-colors">
              All Orders
            </button>
            <button 
              (click)="setFilter('PENDING')" 
              [ngClass]="selectedFilter() === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-amber-400 hover:bg-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 transition-colors">
              Pending
            </button>
            <button 
              (click)="setFilter('CONFIRMED')" 
              [ngClass]="selectedFilter() === 'CONFIRMED' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-blue-400 hover:bg-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 transition-colors">
              Confirmed
            </button>
            <button 
              (click)="setFilter('CONNECTED')" 
              [ngClass]="selectedFilter() === 'CONNECTED' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-emerald-400 hover:bg-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 transition-colors">
              Connected
            </button>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-4">Order ID</th>
                  <th class="p-4">Customer</th>
                  <th class="p-4">Contact & Location</th>
                  <th class="p-4">Chosen Package</th>
                  <th class="p-4">Current Status</th>
                  <th class="p-4">Update Status Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr *ngFor="let ord of orders()" class="hover:bg-slate-800/30">
                  <td class="p-4 font-mono font-bold text-indigo-400">{{ ord.orderNumber }}</td>
                  <td class="p-4">
                    <div class="font-bold text-white text-sm">{{ ord.customerName }}</div>
                    <div class="text-xs text-slate-400 font-mono mt-0.5">
                      <a href="tel:{{ ord.customerPhone }}" class="text-emerald-400 hover:underline">📞 {{ ord.customerPhone }}</a>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="font-semibold text-slate-200">📍 {{ ord.coverageArea }}, {{ ord.city }}</div>
                    <div class="text-slate-400 mt-1 max-w-sm">{{ ord.customerAddress }}</div>
                  </td>
                  <td class="p-4">
                    <div class="font-bold text-white">{{ ord.packageName }}</div>
                    <div class="text-xs text-blue-400 font-semibold">{{ ord.packageSpeed }} Mbps • ৳{{ ord.packagePrice }}/mo</div>
                  </td>
                  <td class="p-4">
                    <span [ngClass]="{
                      'bg-amber-500/10 text-amber-400 border-amber-500/20': ord.status === 'PENDING',
                      'bg-blue-500/10 text-blue-400 border-blue-500/20': ord.status === 'CONFIRMED',
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': ord.status === 'CONNECTED',
                      'bg-red-500/10 text-red-400 border-red-500/20': ord.status === 'CANCELLED'
                    }" class="px-3 py-1 rounded-full text-[11px] font-bold border inline-block">
                      {{ ord.status }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <select 
                        [ngModel]="ord.status" 
                        (ngModelChange)="changeStatus(ord.id, $event)"
                        class="p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CONNECTED">CONNECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="orders().length === 0">
                  <td colspan="6" class="p-10 text-center text-slate-500">
                    No orders matching this status filter.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `
})
export class AgentDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  orders = signal<CustomerOrder[]>([]);
  selectedFilter = signal<string>('');

  ngOnInit(): void {
    this.loadOrders();
  }

  setFilter(status: string): void {
    this.selectedFilter.set(status);
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.getAgentOrders(this.selectedFilter()).subscribe({
      next: (res) => this.orders.set(res),
      error: (err) => console.error(err)
    });
  }

  changeStatus(id: string, newStatus: string): void {
    this.api.updateOrderStatus(id, newStatus).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => alert(err.error?.message || 'Failed to update order status')
    });
  }
}
