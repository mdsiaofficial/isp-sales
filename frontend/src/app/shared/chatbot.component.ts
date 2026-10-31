import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { InternetPackage, CityCoverage } from '../core/models';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { label: string; action: string }[];
  isPackageCards?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <button 
        (click)="toggleChat()"
        class="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300">
        <svg *ngIf="!isOpen()" class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
        <svg *ngIf="isOpen()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span *ngIf="!isOpen()">Chat with Us</span>
        <span *ngIf="isOpen()">Close</span>
      </button>

      <!-- Chat Window Dialog -->
      <div 
        *ngIf="isOpen()" 
        class="absolute bottom-16 right-0 w-[380px] sm:w-[420px] max-w-[95vw] h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg backdrop-blur-sm border border-white/30">
                ⚡
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 class="font-bold text-base tracking-tight">ISP Assistant</h3>
              <p class="text-xs text-blue-100 flex items-center gap-1">
                <span>●</span> Online • Typically replies instantly
              </p>
            </div>
          </div>
          <button (click)="toggleChat()" class="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Chat Messages Feed -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
          <div *ngFor="let msg of messages()" class="space-y-2">
            <!-- Bot or User Bubble -->
            <div [ngClass]="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div 
                [ngClass]="msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] text-sm shadow-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[88%] text-sm shadow-sm'">
                <p class="whitespace-pre-line leading-relaxed">{{ msg.text }}</p>
                <span class="block text-[10px] mt-1 text-right" [ngClass]="msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'">
                  {{ msg.time }}
                </span>
              </div>
            </div>

            <!-- Optional Quick Reply Action Pills -->
            <div *ngIf="msg.options && msg.options.length > 0" class="flex flex-wrap gap-2 pt-1 pl-1">
              <button 
                *ngFor="let opt of msg.options" 
                (click)="handleAction(opt.action)"
                class="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-blue-500/30 text-blue-600 hover:bg-blue-50 hover:border-blue-500 shadow-sm transition-all duration-200">
                {{ opt.label }}
              </button>
            </div>

            <!-- Package Cards inside Chat -->
            <div *ngIf="msg.isPackageCards" class="grid grid-cols-1 gap-2.5 pt-2">
              <div *ngFor="let pkg of packages()" class="bg-white border border-blue-100 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-all">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold text-gray-900 text-sm">{{ pkg.name }}</h4>
                    <p class="text-xs text-blue-600 font-semibold">{{ pkg.speedMbps }} Mbps High-Speed</p>
                  </div>
                  <span class="text-sm font-bold text-gray-900">৳{{ pkg.monthlyPrice }}<span class="text-[10px] text-gray-500 font-normal">/mo</span></span>
                </div>
                <p class="text-xs text-gray-500 mt-1.5">{{ pkg.description }}</p>
                <button 
                  (click)="startOrderForPackage(pkg)"
                  class="mt-2.5 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-medium rounded-lg transition-colors border border-blue-200/50">
                  Select This Package →
                </button>
              </div>
            </div>
          </div>

          <!-- Interactive Order Form Step (Step 1: City & Area) -->
          <div *ngIf="currentFlow() === 'order_location'" class="bg-white border border-blue-200 rounded-2xl p-4 shadow-md space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-blue-600">Select Coverage Area</h4>
            
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Select City</label>
              <select [(ngModel)]="orderCityId" (change)="onCitySelected()" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- Choose City --</option>
                <option *ngFor="let c of cities()" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div *ngIf="orderCityId">
              <label class="block text-xs font-medium text-gray-600 mb-1">Select Area</label>
              <select [(ngModel)]="orderAreaId" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- Choose Area --</option>
                <option *ngFor="let a of availableAreas" [value]="a.id">{{ a.name }}</option>
                <option value="NOT_LISTED">⚠️ My Area is not in this list</option>
              </select>
            </div>

            <div class="flex gap-2 pt-1">
              <button 
                (click)="proceedFromLocation()" 
                [disabled]="!orderCityId || !orderAreaId"
                class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow">
                Continue →
              </button>
              <button (click)="resetFlow()" class="px-3 py-2 text-xs text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>

          <!-- Interactive Order Form Step (Step 2: Customer Details) -->
          <div *ngIf="currentFlow() === 'order_details'" class="bg-white border border-blue-200 rounded-2xl p-4 shadow-md space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-blue-600">Customer Details</h4>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input type="text" [(ngModel)]="orderName" placeholder="e.g. Tanvir Ahmed" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
              <input type="tel" [(ngModel)]="orderPhone" placeholder="e.g. 01700000000" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Installation Address *</label>
              <textarea [(ngModel)]="orderAddress" rows="2" placeholder="House, Road, Block, Sector" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Package</label>
              <select [(ngModel)]="orderPackageId" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option *ngFor="let pkg of packages()" [value]="pkg.id">
                  {{ pkg.name }} ({{ pkg.speedMbps }} Mbps) - ৳{{ pkg.monthlyPrice }}/mo
                </option>
              </select>
            </div>

            <div class="flex gap-2 pt-1">
              <button 
                (click)="submitConnectionOrder()" 
                [disabled]="!orderName || !orderPhone || !orderAddress || isSubmitting()"
                class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow">
                {{ isSubmitting() ? 'Submitting...' : 'Submit Connection Request' }}
              </button>
              <button (click)="resetFlow()" class="px-3 py-2 text-xs text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>

          <!-- Future Lead Form (If area not covered) -->
          <div *ngIf="currentFlow() === 'future_lead'" class="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-md space-y-3">
            <div class="flex items-center gap-2 text-amber-800">
              <span class="text-lg">📍</span>
              <h4 class="text-xs font-bold uppercase tracking-wider">Unlisted Area Notification</h4>
            </div>
            <p class="text-xs text-amber-700">We don't provide fiber in this area yet, but enter your info and we will notify you when we expand!</p>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Your Name *</label>
              <input type="text" [(ngModel)]="leadName" placeholder="Your name" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
              <input type="tel" [(ngModel)]="leadPhone" placeholder="01XXXXXXXXX" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Area / Location Name *</label>
              <input type="text" [(ngModel)]="leadAreaName" placeholder="e.g. Mirpur DOHS, Rampura" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>

            <div class="flex gap-2 pt-1">
              <button 
                (click)="submitFutureLead()" 
                [disabled]="!leadName || !leadPhone || !leadAreaName || isSubmitting()"
                class="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow">
                {{ isSubmitting() ? 'Saving...' : 'Save My Area Request' }}
              </button>
              <button (click)="resetFlow()" class="px-3 py-2 text-xs text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>

          <!-- Talk to Agent Form (Callback Request) -->
          <div *ngIf="currentFlow() === 'talk_agent'" class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 shadow-md space-y-3">
            <div class="flex items-center gap-2 text-indigo-800">
              <span class="text-lg">📞</span>
              <h4 class="text-xs font-bold uppercase tracking-wider">Request Agent Callback</h4>
            </div>
            <p class="text-xs text-indigo-700">Leave your phone number and our representative will call you directly.</p>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Your Name *</label>
              <input type="text" [(ngModel)]="callbackName" placeholder="Your name" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
              <input type="tel" [(ngModel)]="callbackPhone" placeholder="01XXXXXXXXX" class="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>

            <div class="flex gap-2 pt-1">
              <button 
                (click)="submitCallback()" 
                [disabled]="!callbackName || !callbackPhone || isSubmitting()"
                class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow">
                {{ isSubmitting() ? 'Submitting...' : 'Call Me Back' }}
              </button>
              <button (click)="resetFlow()" class="px-3 py-2 text-xs text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>

        </div>

        <!-- Footer / Restart Chat -->
        <div class="bg-white border-t border-gray-100 p-2.5 px-4 flex items-center justify-between">
          <button (click)="showMainMenu()" class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <span>🔄</span> Main Menu
          </button>
          <span class="text-[11px] text-gray-400">ISP Instant Support</span>
        </div>

      </div>
    </div>
  `
})
export class ChatbotComponent implements OnInit {
  private api = inject(ApiService);

  isOpen = signal<boolean>(false);
  messages = signal<ChatMessage[]>([]);
  packages = signal<InternetPackage[]>([]);
  cities = signal<CityCoverage[]>([]);
  currentFlow = signal<'none' | 'order_location' | 'order_details' | 'future_lead' | 'talk_agent'>('none');
  isSubmitting = signal<boolean>(false);

  // Form bindings
  orderCityId = '';
  orderAreaId = '';
  orderPackageId = '';
  orderName = '';
  orderPhone = '';
  orderAddress = '';

  leadName = '';
  leadPhone = '';
  leadAreaName = '';

  callbackName = '';
  callbackPhone = '';

  get availableAreas() {
    const selected = this.cities().find(c => c.id === this.orderCityId);
    return selected ? selected.areas : [];
  }

  ngOnInit(): void {
    this.loadPackagesAndCoverage();
    this.initWelcomeMessage();
  }

  toggleChat(): void {
    this.isOpen.update(v => !v);
  }

  private loadPackagesAndCoverage(): void {
    this.api.getPublicPackages().subscribe({
      next: (res) => this.packages.set(res),
      error: (err) => console.error('Failed to load packages', err)
    });

    this.api.getPublicCoverage().subscribe({
      next: (res) => this.cities.set(res),
      error: (err) => console.error('Failed to load coverage', err)
    });
  }

  private getTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  initWelcomeMessage(): void {
    this.messages.set([
      {
        id: '1',
        sender: 'bot',
        text: '👋 Welcome to SwiftFiber ISP! How can we assist you today?',
        time: this.getTime(),
        options: [
          { label: '📦 View Packages', action: 'VIEW_PACKAGES' },
          { label: '🚀 New Connection', action: 'NEW_CONNECTION' },
          { label: '📞 Talk to an Agent', action: 'TALK_AGENT' }
        ]
      }
    ]);
  }

  showMainMenu(): void {
    this.currentFlow.set('none');
    this.messages.update(list => [
      ...list,
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'How else may I help you? Choose an option below:',
        time: this.getTime(),
        options: [
          { label: '📦 View Packages', action: 'VIEW_PACKAGES' },
          { label: '🚀 New Connection', action: 'NEW_CONNECTION' },
          { label: '📞 Talk to an Agent', action: 'TALK_AGENT' }
        ]
      }
    ]);
  }

  handleAction(action: string): void {
    if (action === 'VIEW_PACKAGES') {
      this.messages.update(list => [
        ...list,
        { id: Date.now().toString(), sender: 'user', text: 'I would like to view packages.', time: this.getTime() },
        { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: 'Here are our current ultra-fast fiber packages:', 
          time: this.getTime(),
          isPackageCards: true 
        }
      ]);
    } else if (action === 'NEW_CONNECTION') {
      this.messages.update(list => [
        ...list,
        { id: Date.now().toString(), sender: 'user', text: 'I want a new internet connection.', time: this.getTime() },
        { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: 'Great choice! First, let\'s verify that your area is covered by our fiber network.', 
          time: this.getTime() 
        }
      ]);
      this.currentFlow.set('order_location');
    } else if (action === 'TALK_AGENT') {
      this.messages.update(list => [
        ...list,
        { id: Date.now().toString(), sender: 'user', text: 'I would like to talk to a sales agent.', time: this.getTime() },
        { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: 'Please provide your contact information and our sales agent will call you promptly.', 
          time: this.getTime() 
        }
      ]);
      this.currentFlow.set('talk_agent');
    }
  }

  startOrderForPackage(pkg: InternetPackage): void {
    this.orderPackageId = pkg.id;
    this.messages.update(list => [
      ...list,
      { id: Date.now().toString(), sender: 'user', text: `I choose the ${pkg.name} (${pkg.speedMbps} Mbps) package.`, time: this.getTime() },
      { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: `Super! Let\'s verify coverage in your area for ${pkg.name}.`, 
        time: this.getTime() 
      }
    ]);
    this.currentFlow.set('order_location');
  }

  onCitySelected(): void {
    this.orderAreaId = '';
  }

  proceedFromLocation(): void {
    if (this.orderAreaId === 'NOT_LISTED') {
      const city = this.cities().find(c => c.id === this.orderCityId)?.name || '';
      this.messages.update(list => [
        ...list,
        { id: Date.now().toString(), sender: 'user', text: `My area in ${city} is not listed.`, time: this.getTime() },
        { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: `We apologize that our fiber grid hasn't reached your specific area yet. Leave your information and we\'ll notify you when coverage is deployed!`, 
          time: this.getTime() 
        }
      ]);
      this.currentFlow.set('future_lead');
    } else {
      const city = this.cities().find(c => c.id === this.orderCityId)?.name || '';
      const area = this.availableAreas.find((a: any) => a.id === this.orderAreaId)?.name || '';
      if (!this.orderPackageId && this.packages().length > 0) {
        this.orderPackageId = this.packages()[0].id;
      }
      this.messages.update(list => [
        ...list,
        { id: Date.now().toString(), sender: 'user', text: `Location: ${area}, ${city}`, time: this.getTime() },
        { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: `🎉 Good news! ${area}, ${city} is covered. Please provide your installation details:`, 
          time: this.getTime() 
        }
      ]);
      this.currentFlow.set('order_details');
    }
  }

  submitConnectionOrder(): void {
    this.isSubmitting.set(true);
    this.api.submitChatbotOrder({
      customerName: this.orderName,
      customerPhone: this.orderPhone,
      customerAddress: this.orderAddress,
      cityId: this.orderCityId,
      coverageAreaId: this.orderAreaId,
      packageId: this.orderPackageId
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.currentFlow.set('none');
        this.messages.update(list => [
          ...list,
          { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: `✅ Request received! Order reference: #${res.orderNumber}.\nInitial Status: PENDING.\nOur sales agent will contact you shortly to schedule installation.`, 
            time: this.getTime(),
            options: [{ label: 'Back to Main Menu', action: 'MAIN_MENU' }]
          }
        ]);
        this.orderName = '';
        this.orderPhone = '';
        this.orderAddress = '';
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Failed to submit order. Please try again.');
      }
    });
  }

  submitFutureLead(): void {
    this.isSubmitting.set(true);
    const city = this.cities().find(c => c.id === this.orderCityId)?.name || 'Other';
    this.api.submitChatbotLead({
      customerName: this.leadName,
      customerPhone: this.leadPhone,
      cityName: city,
      areaName: this.leadAreaName
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.currentFlow.set('none');
        this.messages.update(list => [
          ...list,
          { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: `📍 Thank you ${this.leadName}! We have recorded your interest in ${this.leadAreaName}, ${city} as a Future Lead. Our network planning team will consider this for upcoming fiber expansions.`, 
            time: this.getTime(),
            options: [{ label: 'Back to Main Menu', action: 'MAIN_MENU' }]
          }
        ]);
        this.leadName = '';
        this.leadPhone = '';
        this.leadAreaName = '';
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Failed to submit. Please try again.');
      }
    });
  }

  submitCallback(): void {
    this.isSubmitting.set(true);
    this.api.submitChatbotCallback({
      customerName: this.callbackName,
      customerPhone: this.callbackPhone
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.currentFlow.set('none');
        this.messages.update(list => [
          ...list,
          { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: `📞 Callback requested! A dedicated sales agent has received your request and will call ${this.callbackPhone} shortly.`, 
            time: this.getTime(),
            options: [{ label: 'Back to Main Menu', action: 'MAIN_MENU' }]
          }
        ]);
        this.callbackName = '';
        this.callbackPhone = '';
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Failed to request callback. Please try again.');
      }
    });
  }

  resetFlow(): void {
    this.currentFlow.set('none');
  }
}
