import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `<router-outlet></router-outlet>
  <div class="fixed top-4 right-4 z-[100] space-y-2">
    <div *ngFor="let t of toast.toasts()" [ngClass]="{'bg-emerald-600':t.type==='success','bg-red-600':t.type==='error','bg-slate-700':t.type==='info'}" class="px-4 py-2 rounded-lg text-white text-sm shadow-lg">
      {{ t.message }}
    </div>
  </div>`
})
export class App { toast = inject(ToastService); }

