import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; type: 'success'|'error'|'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;
  show(message: string, type: Toast['type'] = 'info', duration = 3000): void {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }
  success(m: string){ this.show(m,'success'); }
  error(m: string){ this.show(m,'error'); }
  info(m: string){ this.show(m,'info'); }
  dismiss(id: number){ this.toasts.update(t => t.filter(x=>x.id!==id)); }
}
