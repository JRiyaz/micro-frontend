import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Breadcrumb } from '../../models';

@Component({
  selector: 'lib-detail-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-dark-base transition-colors duration-500">
      <!-- Top Header -->
      <header class="bg-white dark:bg-dark-elevated border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 backdrop-blur-sm bg-white/90 dark:bg-dark-elevated/90">
        <div class="max-w-7xl mx-auto px-4 h-20 flex flex-col justify-center">
          <!-- Breadcrumbs -->
          @if (breadcrumbs().length > 0) {
            <nav class="flex items-center gap-2 mb-3">
              @for (item of breadcrumbs(); track item.label; let last = $last) {
                <div class="flex items-center gap-2">
                  @if (item.link) {
                    <a [routerLink]="item.link" class="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">{{ item.label }}</a>
                  } @else {
                    <span class="text-[8px] font-black uppercase tracking-widest text-slate-500">{{ item.label }}</span>
                  }
                  @if (!last) {
                    <svg class="w-2 h-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
                  }
                </div>
              }
            </nav>
          }

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <a [routerLink]="backLink()" class="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary transition-all group">
                <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
              </a>
              <div>
                <div class="flex items-center gap-2">
                   <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">{{ title() }}</h1>
                   <span class="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">{{ status() }}</span>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">{{ subtitle() }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
               <button class="btn-secondary-premium !px-3 !py-1.5 !text-[9px]">
                  Export
               </button>
                <button (click)="action.emit()" [disabled]="loading()" class="btn-primary-premium !px-4 !py-1.5 !text-[9px] flex items-center justify-center min-w-[120px] relative overflow-hidden group">
                  @if (loading()) {
                    <div class="loader-wrapper-premium">
                      @if (loaderType() === 'flower') {
                        <div class="flower-loader">
                          <span></span><span></span><span></span><span></span><span></span><span></span>
                        </div>
                      } @else if (loaderType() === 'gravity') {
                        <div class="gravity-orbit">
                          <span></span><span></span>
                        </div>
                      } @else if (loaderType() === 'pulse') {
                        <div class="pulse-rings">
                          <span></span><span></span>
                        </div>
                      } @else if (loaderType() === 'liquid') {
                        <div class="liquid-pulse"></div>
                      }
                    </div>
                  }
                  <span [class.opacity-0]="loading()" class="transition-opacity duration-300">{{ actionLabel() }}</span>
               </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 pt-6">
        <ng-content select="[top-content]"></ng-content>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Sidebar Info -->
          <aside class="lg:col-span-3 space-y-4">
            <!-- Main Icon/Avatar -->
            <div class="card-premium p-6 flex flex-col items-center text-center">
               <div class="w-14 h-14 mb-3">
                  <ng-content select="[header-icon]"></ng-content>
               </div>
               <ng-content select="[sidebar-info]"></ng-content>
            </div>

            <!-- Stats/Extra Info -->
            <div class="card-premium p-4 bg-slate-900 dark:bg-primary shadow-xl shadow-primary/10">
               <ng-content select="[sidebar-extra]"></ng-content>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="lg:col-span-9 space-y-6">
            <!-- Tabs -->
            <div class="flex border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
               @for (tab of tabs(); track tab; let i = $index) {
                 <button 
                   (click)="currentTab.set(i); tabChanged.emit(i)"
                   [class.text-primary]="currentTab() === i"
                   [class.border-primary]="currentTab() === i"
                   class="px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] border-b-2 border-transparent transition-all whitespace-nowrap hover:text-primary"
                 >
                   {{ tab }}
                 </button>
               }
            </div>

            <!-- Tab Content Area -->
            <div class="min-h-[300px]">
               <ng-content select="[tab-content]"></ng-content>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class DetailLayoutComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  status = input<string>('Active');
  backLink = input<string>('/dashboard');
  backLabel = input<string>('Back');
  breadcrumbs = input<Breadcrumb[]>([]);
  actionLabel = input<string>('Primary Action');
  tabs = input<string[]>([]);
  loading = input<boolean>(false);
  loaderType = input<'flower' | 'gravity' | 'pulse' | 'liquid'>('gravity');
  
  action = output<void>();
  tabChanged = output<number>();

  currentTab = signal(0);
}
