import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            @if (backLink()) {
               <a [routerLink]="backLink()" class="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-primary group">
                  <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
               </a>
            }
            <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{{ title() }}</h1>
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide max-w-2xl">{{ subtitle() }}</p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="action.emit()" class="btn-primary-premium flex items-center gap-2">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
             {{ actionLabel() }}
          </button>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (stat of stats(); track stat.label) {
          <div class="card-premium p-4 flex items-center justify-between group hover:border-primary/30 transition-all relative overflow-hidden">
             <div>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{{ stat.label }}</p>
                <p class="text-lg font-black text-slate-900 dark:text-white leading-none">{{ stat.value }}</p>
             </div>
             <div class="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
             </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  actionLabel = input<string>('New Item');
  backLink = input<string | null>(null);
  stats = input<{ label: string; value: string | number }[]>([]);
  
  action = output<void>();
}
