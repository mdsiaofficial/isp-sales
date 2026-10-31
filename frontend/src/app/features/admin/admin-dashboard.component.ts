import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import {
  DashboardStats,
  InternetPackage,
  CustomerOrder,
  CallbackRequest,
  FutureLead,
  User
} from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <!-- Navbar -->
      <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              ⚡
            </div>
            <span class="font-extrabold text-lg text-white">SwiftFiber Admin</span>
            <span class="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              System Control
            </span>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs text-slate-300 hidden sm:inline">
              Welcome, <strong class="text-white">{{ auth.currentUser()?.fullName }}</strong>
            </span>
            <a routerLink="/" class="text-xs text-slate-400 hover:text-white transition-colors">Public Site</a>
            <button 
              (click)="auth.logout()" 
              class="px-3 py-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-lg border border-slate-700 hover:border-red-800 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <!-- Subnavigation Tabs -->
      <div class="border-b border-slate-800 bg-slate-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-8 text-xs font-semibold">
          <button 
            (click)="activeTab.set('overview')" 
            [ngClass]="activeTab() === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            📊 Overview KPIs
          </button>
          <button 
            (click)="activeTab.set('orders')" 
            [ngClass]="activeTab() === 'orders' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            📦 Customer Orders
          </button>
          <button 
            (click)="activeTab.set('packages')" 
            [ngClass]="activeTab() === 'packages' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            🏷️ Packages
          </button>
          <button 
            (click)="activeTab.set('coverage')" 
            [ngClass]="activeTab() === 'coverage' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            🗺️ Coverage Areas
          </button>
          <button 
            (click)="activeTab.set('agents')" 
            [ngClass]="activeTab() === 'agents' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            👥 Sales Agents
          </button>
          <button 
            (click)="activeTab.set('callbacks')" 
            [ngClass]="activeTab() === 'callbacks' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            📞 Callbacks
          </button>
          <button 
            (click)="activeTab.set('leads')" 
            [ngClass]="activeTab() === 'leads' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            class="py-4 whitespace-nowrap transition-colors flex items-center gap-2">
            📍 Future Leads
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        <!-- 1. OVERVIEW KPIS -->
        <div *ngIf="activeTab() === 'overview'" class="space-y-8 animate-in fade-in duration-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <p class="mt-2 text-3xl font-extrabold text-white">{{ stats()?.totalOrders || 0 }}</p>
              <p class="text-xs text-slate-500 mt-1">All incoming connections</p>
            </div>

            <div class="bg-slate-900 border border-amber-500/20 rounded-2xl p-6">
              <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Orders</span>
              <p class="mt-2 text-3xl font-extrabold text-amber-300">{{ stats()?.pendingOrders || 0 }}</p>
              <p class="text-xs text-amber-500/70 mt-1">Awaiting dispatch/confirmation</p>
            </div>

            <div class="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6">
              <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Completed Connections</span>
              <p class="mt-2 text-3xl font-extrabold text-emerald-300">{{ stats()?.completedConnections || 0 }}</p>
              <p class="text-xs text-emerald-500/70 mt-1">Active live customers</p>
            </div>

            <div class="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6">
              <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Sales Agents</span>
              <p class="mt-2 text-3xl font-extrabold text-indigo-300">{{ stats()?.totalSalesAgents || 0 }}</p>
              <p class="text-xs text-indigo-500/70 mt-1">Active field/desk agents</p>
            </div>
          </div>

          <!-- Secondary Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Callback Requests</span>
                <p class="text-2xl font-bold text-white mt-1">{{ stats()?.totalCallbacks || 0 }} Requests</p>
                <p class="text-xs text-slate-500">Customers asking for phone follow-up</p>
              </div>
              <button (click)="activeTab.set('callbacks')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-indigo-400 border border-slate-700">
                View Requests →
              </button>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Future Expansion Leads</span>
                <p class="text-2xl font-bold text-white mt-1">{{ stats()?.totalFutureLeads || 0 }} Leads</p>
                <p class="text-xs text-slate-500">High-demand unserved locations</p>
              </div>
              <button (click)="activeTab.set('leads')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-emerald-400 border border-slate-700">
                View Expansion Map →
              </button>
            </div>
          </div>
        </div>

        <!-- 2. CUSTOMER ORDERS -->
        <div *ngIf="activeTab() === 'orders'" class="space-y-4 animate-in fade-in duration-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-white">All Customer Orders</h3>
            <button (click)="loadOrders()" class="text-xs text-indigo-400 hover:underline">Refresh</button>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th class="p-3.5">Order Ref</th>
                    <th class="p-3.5">Customer</th>
                    <th class="p-3.5">Contact & Location</th>
                    <th class="p-3.5">Package</th>
                    <th class="p-3.5">Status</th>
                    <th class="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr *ngFor="let ord of orders()" class="hover:bg-slate-800/30">
                    <td class="p-3.5 font-mono text-indigo-400 font-bold">{{ ord.orderNumber }}</td>
                    <td class="p-3.5">
                      <div class="font-semibold text-white">{{ ord.customerName }}</div>
                      <div class="text-[11px] text-slate-400">{{ ord.customerPhone }}</div>
                    </td>
                    <td class="p-3.5">
                      <div>{{ ord.coverageArea }}, {{ ord.city }}</div>
                      <div class="text-[11px] text-slate-400 max-w-xs truncate">{{ ord.customerAddress }}</div>
                    </td>
                    <td class="p-3.5">
                      <div class="font-semibold text-white">{{ ord.packageName }} ({{ ord.packageSpeed }}M)</div>
                      <div class="text-[11px] text-slate-400">৳{{ ord.packagePrice }}/mo</div>
                    </td>
                    <td class="p-3.5">
                      <span [ngClass]="{
                        'bg-amber-500/10 text-amber-400 border-amber-500/20': ord.status === 'PENDING',
                        'bg-blue-500/10 text-blue-400 border-blue-500/20': ord.status === 'CONFIRMED',
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': ord.status === 'CONNECTED',
                        'bg-red-500/10 text-red-400 border-red-500/20': ord.status === 'CANCELLED'
                      }" class="px-2.5 py-1 rounded-full text-[10px] font-bold border">
                        {{ ord.status }}
                      </span>
                    </td>
                    <td class="p-3.5 text-slate-400">{{ ord.createdAt | date:'short' }}</td>
                  </tr>
                  <tr *ngIf="orders().length === 0">
                    <td colspan="6" class="p-8 text-center text-slate-500">No customer orders recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. PACKAGES MANAGEMENT -->
        <div *ngIf="activeTab() === 'packages'" class="space-y-6 animate-in fade-in duration-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-white">Internet Packages</h3>
              <p class="text-xs text-slate-400">Manage customer broadband offerings and pricing</p>
            </div>
            <button 
              (click)="openNewPackageModal()" 
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-colors">
              + New Package
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let pkg of packages()" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-bold text-white text-base">{{ pkg.name }}</h4>
                  <span [ngClass]="pkg.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                    {{ pkg.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-2xl font-black text-indigo-400">৳{{ pkg.monthlyPrice }}</span>
                  <span class="text-xs text-slate-400">/ mo</span>
                  <span class="ml-auto text-xs font-semibold text-slate-300">{{ pkg.speedMbps }} Mbps</span>
                </div>
                <p class="text-xs text-slate-400 mb-4">{{ pkg.description }}</p>
              </div>

              <div class="flex gap-2 pt-3 border-t border-slate-800">
                <button (click)="editPackage(pkg)" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200">
                  Edit
                </button>
                <button (click)="deletePackage(pkg.id)" class="px-3 py-1.5 bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- New/Edit Package Dialog Form -->
          <div *ngIf="showPackageModal()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h4 class="text-base font-bold text-white">{{ editingPackageId ? 'Edit Package' : 'Create Internet Package' }}</h4>
              
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Package Name</label>
                <input type="text" [(ngModel)]="pkgForm.name" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Speed (Mbps)</label>
                  <input type="number" [(ngModel)]="pkgForm.speedMbps" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Monthly Price (৳)</label>
                  <input type="number" [(ngModel)]="pkgForm.monthlyPrice" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea [(ngModel)]="pkgForm.description" rows="3" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"></textarea>
              </div>
              <div *ngIf="editingPackageId" class="flex items-center gap-2">
                <input type="checkbox" id="pkgActive" [(ngModel)]="pkgForm.isActive" class="rounded text-indigo-600" />
                <label for="pkgActive" class="text-xs text-slate-300">Active for new subscriptions</label>
              </div>

              <div class="flex gap-2 pt-2">
                <button (click)="savePackage()" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg">
                  Save Package
                </button>
                <button (click)="showPackageModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. COVERAGE AREAS -->
        <div *ngIf="activeTab() === 'coverage'" class="space-y-6 animate-in fade-in duration-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-white">Coverage Area Management</h3>
              <p class="text-xs text-slate-400">Configure serviced cities and local distribution areas</p>
            </div>
            <div class="flex gap-2">
              <button (click)="promptNewCity()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700">
                + Add City
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let city of coverageCities()" class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-lg">🏙️</span>
                  <h4 class="font-extrabold text-white text-base">{{ city.name }}</h4>
                </div>
                <button (click)="openAddArea(city.id)" class="text-xs text-indigo-400 hover:underline font-semibold">
                  + Add Area
                </button>
              </div>

              <div class="space-y-2">
                <div *ngFor="let area of city.coverageAreas" class="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" [ngClass]="area.isActive ? 'bg-emerald-400' : 'bg-red-400'"></span>
                    <span class="text-xs font-semibold text-slate-200">{{ area.name }}</span>
                  </div>
                  <button (click)="deleteArea(area.id)" class="text-[11px] text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </div>
                <div *ngIf="city.coverageAreas?.length === 0" class="text-xs text-slate-500 py-2">
                  No areas added yet.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. SALES AGENTS -->
        <div *ngIf="activeTab() === 'agents'" class="space-y-6 animate-in fade-in duration-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-white">Sales Agents</h3>
              <p class="text-xs text-slate-400">Manage field and desk sales team credentials</p>
            </div>
            <button (click)="showAgentModal.set(true)" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow">
              + Add Sales Agent
            </button>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">Full Name</th>
                  <th class="p-3.5">Username</th>
                  <th class="p-3.5">Email</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5">Created</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr *ngFor="let agent of agents()" class="hover:bg-slate-800/30">
                  <td class="p-3.5 font-bold text-white">{{ agent.fullName }}</td>
                  <td class="p-3.5 font-mono text-indigo-400">{{ agent.username }}</td>
                  <td class="p-3.5 text-slate-400">{{ agent.email }}</td>
                  <td class="p-3.5">
                    <span [ngClass]="agent.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                      {{ agent.isActive ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="p-3.5 text-slate-400">{{ agent.createdAt | date:'mediumDate' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Create Agent Modal -->
          <div *ngIf="showAgentModal()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h4 class="text-base font-bold text-white">Create Sales Agent Account</h4>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input type="text" [(ngModel)]="agentForm.fullName" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                <input type="text" [(ngModel)]="agentForm.username" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input type="email" [(ngModel)]="agentForm.email" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                <input type="password" [(ngModel)]="agentForm.password" class="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              </div>

              <div class="flex gap-2 pt-2">
                <button (click)="createAgent()" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg">
                  Create Agent
                </button>
                <button (click)="showAgentModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. CALLBACK REQUESTS -->
        <div *ngIf="activeTab() === 'callbacks'" class="space-y-4 animate-in fade-in duration-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-white">Customer Callback Requests ("Talk to an Agent")</h3>
            <button (click)="loadCallbacks()" class="text-xs text-indigo-400 hover:underline">Refresh</button>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">Customer Name</th>
                  <th class="p-3.5">Phone Number</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5">Submitted At</th>
                  <th class="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr *ngFor="let cb of callbacks()" class="hover:bg-slate-800/30">
                  <td class="p-3.5 font-bold text-white">{{ cb.customerName }}</td>
                  <td class="p-3.5 font-mono text-indigo-400 text-sm font-semibold">
                    <a href="tel:{{ cb.customerPhone }}" class="hover:underline">{{ cb.customerPhone }}</a>
                  </td>
                  <td class="p-3.5">
                    <span [ngClass]="cb.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'" class="px-2.5 py-1 rounded-full text-[10px] font-bold border">
                      {{ cb.status }}
                    </span>
                  </td>
                  <td class="p-3.5 text-slate-400">{{ cb.createdAt | date:'short' }}</td>
                  <td class="p-3.5">
                    <button *ngIf="cb.status === 'PENDING'" (click)="markCallbackContacted(cb.id)" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold">
                      Mark Contacted
                    </button>
                  </td>
                </tr>
                <tr *ngIf="callbacks().length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-500">No pending callback requests.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7. FUTURE LEADS -->
        <div *ngIf="activeTab() === 'leads'" class="space-y-4 animate-in fade-in duration-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-white">Future Expansion Leads</h3>
              <p class="text-xs text-slate-400">Captured from customers whose neighborhoods are not yet covered</p>
            </div>
            <button (click)="loadLeads()" class="text-xs text-emerald-400 hover:underline">Refresh</button>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">Customer Name</th>
                  <th class="p-3.5">Phone Number</th>
                  <th class="p-3.5">City</th>
                  <th class="p-3.5">Requested Area</th>
                  <th class="p-3.5">Recorded At</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr *ngFor="let lead of leads()" class="hover:bg-slate-800/30">
                  <td class="p-3.5 font-bold text-white">{{ lead.customerName }}</td>
                  <td class="p-3.5 font-mono text-emerald-400 text-sm font-semibold">
                    <a href="tel:{{ lead.customerPhone }}" class="hover:underline">{{ lead.customerPhone }}</a>
                  </td>
                  <td class="p-3.5 text-slate-300">{{ lead.cityName }}</td>
                  <td class="p-3.5 font-semibold text-amber-300">📍 {{ lead.areaName }}</td>
                  <td class="p-3.5 text-slate-400">{{ lead.createdAt | date:'short' }}</td>
                </tr>
                <tr *ngIf="leads().length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-500">No unlisted area leads submitted yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  activeTab = signal<'overview' | 'orders' | 'packages' | 'coverage' | 'agents' | 'callbacks' | 'leads'>('overview');
  
  stats = signal<DashboardStats | null>(null);
  orders = signal<CustomerOrder[]>([]);
  packages = signal<InternetPackage[]>([]);
  coverageCities = signal<any[]>([]);
  agents = signal<User[]>([]);
  callbacks = signal<CallbackRequest[]>([]);
  leads = signal<FutureLead[]>([]);

  showPackageModal = signal<boolean>(false);
  editingPackageId: string | null = null;
  pkgForm = { name: '', speedMbps: 50, monthlyPrice: 800, description: '', isActive: true };

  showAgentModal = signal<boolean>(false);
  agentForm = { fullName: '', username: '', email: '', password: '' };

  ngOnInit(): void {
    this.loadStats();
    this.loadOrders();
    this.loadPackages();
    this.loadCoverage();
    this.loadAgents();
    this.loadCallbacks();
    this.loadLeads();
  }

  loadStats(): void {
    this.api.getAdminStats().subscribe(s => this.stats.set(s));
  }

  loadOrders(): void {
    this.api.getAdminOrders().subscribe(o => this.orders.set(o));
  }

  loadPackages(): void {
    this.api.getAdminPackages().subscribe(p => this.packages.set(p));
  }

  loadCoverage(): void {
    this.api.getAdminCoverage().subscribe(c => this.coverageCities.set(c));
  }

  loadAgents(): void {
    this.api.getAgents().subscribe(a => this.agents.set(a));
  }

  loadCallbacks(): void {
    this.api.getCallbacks().subscribe(cb => this.callbacks.set(cb));
  }

  loadLeads(): void {
    this.api.getLeads().subscribe(l => this.leads.set(l));
  }

  openNewPackageModal(): void {
    this.editingPackageId = null;
    this.pkgForm = { name: '', speedMbps: 50, monthlyPrice: 800, description: '', isActive: true };
    this.showPackageModal.set(true);
  }

  editPackage(pkg: InternetPackage): void {
    this.editingPackageId = pkg.id;
    this.pkgForm = { ...pkg };
    this.showPackageModal.set(true);
  }

  savePackage(): void {
    if (this.editingPackageId) {
      this.api.updatePackage(this.editingPackageId, this.pkgForm).subscribe(() => {
        this.showPackageModal.set(false);
        this.loadPackages();
      });
    } else {
      this.api.createPackage(this.pkgForm).subscribe(() => {
        this.showPackageModal.set(false);
        this.loadPackages();
      });
    }
  }

  deletePackage(id: string): void {
    if (confirm('Are you sure you want to delete/deactivate this package?')) {
      this.api.deletePackage(id).subscribe(() => this.loadPackages());
    }
  }

  promptNewCity(): void {
    const name = prompt('Enter city name (e.g. Sylhet):');
    if (name) {
      this.api.createCity(name).subscribe(() => this.loadCoverage());
    }
  }

  openAddArea(cityId: string): void {
    const name = prompt('Enter area name (e.g. Mirpur-10):');
    if (name) {
      this.api.createCoverageArea(cityId, name).subscribe(() => this.loadCoverage());
    }
  }

  deleteArea(id: string): void {
    if (confirm('Delete this coverage area?')) {
      this.api.deleteCoverageArea(id).subscribe(() => this.loadCoverage());
    }
  }

  createAgent(): void {
    this.api.createAgent(this.agentForm).subscribe({
      next: () => {
        this.showAgentModal.set(false);
        this.agentForm = { fullName: '', username: '', email: '', password: '' };
        this.loadAgents();
        this.loadStats();
      },
      error: (err) => alert(err.error?.message || 'Failed to create agent')
    });
  }

  markCallbackContacted(id: string): void {
    this.api.updateCallbackStatus(id, 'CONTACTED').subscribe(() => this.loadCallbacks());
  }
}
