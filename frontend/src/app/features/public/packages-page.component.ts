import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { InternetPackage } from '../../core/models';
import { ChatbotComponent } from '../../shared/chatbot.component';

@Component({
  selector: 'app-packages-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatbotComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <a routerLink="/" class="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">SwiftFiber</a>
          <a routerLink="/login" class="px-4 py-2 text-sm font-semibold text-slate-200 border border-slate-700 rounded-lg">Staff Portal</a>
        </div>
      </header>
      <main class="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 class="text-3xl font-extrabold text-white mb-8">Internet Packages</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let pkg of packages()" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white">{{ pkg.name }}</h3>
            <p class="text-blue-400 font-bold mt-2">{{ pkg.speedMbps }} Mbps</p>
            <p class="text-emerald-400 font-extrabold text-2xl mt-1">৳{{ pkg.monthlyPrice }}<span class="text-xs text-slate-400">/mo</span></p>
            <p class="text-slate-400 text-sm mt-3">{{ pkg.description }}</p>
          </div>
        </div>
      </main>
      <app-chatbot></app-chatbot>
    </div>
  `
})
export class PackagesPageComponent implements OnInit {
  private api = inject(ApiService);
  packages = signal<InternetPackage[]>([]);
  ngOnInit(){ this.api.getPublicPackages().subscribe((r: InternetPackage[])=>this.packages.set(r)); }
}
