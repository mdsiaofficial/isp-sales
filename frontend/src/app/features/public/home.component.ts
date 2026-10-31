import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { InternetPackage, CityCoverage } from '../../core/models';
import { ChatbotComponent } from '../../shared/chatbot.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatbotComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <!-- Top Navigation -->
      <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
              ⚡
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                SwiftFiber
              </span>
              <span class="block text-[10px] tracking-widest uppercase text-slate-400 font-semibold">Broadband Network</span>
            </div>
          </div>

          <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#packages" class="hover:text-blue-400 transition-colors">Internet Packages</a>
            <a href="#coverage" class="hover:text-blue-400 transition-colors">Coverage Areas</a>
            <a href="#features" class="hover:text-blue-400 transition-colors">Why Choose Us</a>
          </nav>

          <div class="flex items-center gap-3">
            <a routerLink="/login" class="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all border border-slate-700">
              Staff Portal
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative pt-20 pb-28 overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/0 to-slate-900 pointer-events-none"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            Next-Gen Fiber To The Home (FTTH)
          </div>
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Uncapped Speed. <br/>
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              Zero Latency Broadband.
            </span>
          </h1>
          <p class="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience ultra-reliable high-speed fiber internet designed for seamless 4K streaming, zero-lag competitive gaming, and rock-solid remote work.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#packages" class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5">
              Explore Packages
            </a>
            <a href="#coverage" class="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all">
              Check Area Coverage
            </a>
          </div>
        </div>
      </section>

      <!-- Packages Section -->
      <section id="packages" class="py-20 bg-slate-950/60 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-xs font-bold uppercase tracking-widest text-blue-400">Transparent Plans</h2>
            <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Choose Your High-Speed Internet</p>
            <p class="mt-3 text-slate-400 text-sm sm:text-base">All packages include unlimited bandwidth, symmetrical fiber connection, and 24/7 dedicated support.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              *ngFor="let pkg of packages()" 
              class="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{{ pkg.name }}</h3>
                  <span class="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {{ pkg.speedMbps }} Mbps
                  </span>
                </div>
                <div class="flex items-baseline gap-1 my-4">
                  <span class="text-4xl font-extrabold text-white">৳{{ pkg.monthlyPrice }}</span>
                  <span class="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mb-6">{{ pkg.description }}</p>
                
                <ul class="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <li class="flex items-center gap-2">
                    <span class="text-emerald-400 font-bold">✓</span> Symmetrical Up/Down
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-emerald-400 font-bold">✓</span> 99.9% Network Uptime
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-emerald-400 font-bold">✓</span> Free Optical Fiber Router
                  </li>
                </ul>
              </div>

              <div class="mt-8 pt-4">
                <button 
                  (click)="openChatbotWithPackage(pkg)" 
                  class="w-full py-2.5 px-4 bg-slate-800 group-hover:bg-blue-600 text-slate-200 group-hover:text-white text-xs font-bold rounded-xl transition-all shadow">
                  Request Connection →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Coverage Section -->
      <section id="coverage" class="py-20 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-xs font-bold uppercase tracking-widest text-emerald-400">Network Reach</h2>
            <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Our Active Fiber Coverage</p>
            <p class="mt-3 text-slate-400 text-sm sm:text-base">We are continuously expanding across major hubs. Check if your area is ready for fiber connection.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div *ngFor="let city of cities()" class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-lg">
                  🏙️
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">{{ city.name }}</h3>
                  <span class="text-xs text-slate-400">{{ city.areas.length }} Active Service Zones</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 mt-4">
                <span *ngFor="let area of city.areas" class="px-3 py-1.5 bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg">
                  📍 {{ area.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Unlisted Banner -->
          <div class="mt-12 max-w-2xl mx-auto bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <h4 class="font-bold text-base text-white">Don't see your neighborhood?</h4>
            <p class="text-xs text-slate-300 mt-1">Open our assistant chatbot and submit your area name. We prioritize future grid expansion based on community demand!</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="mt-auto border-t border-slate-800 bg-slate-950 py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SwiftFiber Broadband Ltd. All rights reserved.</p>
          <div class="flex items-center gap-6">
            <a routerLink="/login" class="text-slate-400 hover:text-white transition-colors">Staff Login</a>
            <span class="text-slate-400">24/7 Hotline: 16222</span>
          </div>
        </div>
      </footer>

      <!-- Interactive Chatbot Assistant -->
      <app-chatbot #chatbotRef></app-chatbot>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);

  packages = signal<InternetPackage[]>([]);
  cities = signal<CityCoverage[]>([]);

  ngOnInit(): void {
    this.api.getPublicPackages().subscribe(res => this.packages.set(res));
    this.api.getPublicCoverage().subscribe(res => this.cities.set(res));
  }

  openChatbotWithPackage(pkg: InternetPackage): void {
    // Open floating chatbot and trigger package order
    const chatBtn = document.querySelector('app-chatbot button') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  }
}
