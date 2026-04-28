import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#0a0b1e] overflow-hidden relative">

      <!-- Nav -->
      <nav class="relative z-20 border-b border-white/[0.06] bg-[#0a0b1e]/80 backdrop-blur-xl sticky top-0">
        <div class="flex justify-between items-center px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 bg-gradient-to-br from-[#6d74ff] to-blue-500 rounded-xl flex items-center justify-center">
              <span class="text-white font-black text-lg">I</span>
            </div>
            <span class="text-2xl font-black tracking-tight text-white">Inven<span class="text-[#6d74ff]">tory</span></span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-sm text-slate-400 hover:text-white transition-colors font-medium">Features</a>
            <a href="#stats" class="text-sm text-slate-400 hover:text-white transition-colors font-medium">Stats</a>
          </div>
          <div class="flex items-center gap-3">
            <a routerLink="/user/login" class="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors font-medium hidden sm:block">Sign In</a>
            <a routerLink="/user/register" class="px-5 py-2.5 bg-[#6d74ff] hover:bg-[#6d74ff]/90 text-white rounded-xl transition-all font-bold text-sm">Get Started</a>
            <button (click)="mobileMenu.set(!mobileMenu())" class="md:hidden ml-1 text-slate-400 hover:text-white p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
        <div *ngIf="mobileMenu()" class="md:hidden border-t border-white/[0.06] px-6 py-3 space-y-2 bg-[#0a0b1e]/95 backdrop-blur-xl">
          <a href="#features" class="block text-sm text-slate-400 py-2">Features</a>
          <a href="#stats" class="block text-sm text-slate-400 py-2">Stats</a>
          <a routerLink="/user/login" class="block text-sm text-slate-400 py-2 sm:hidden">Sign In</a>
        </div>
      </nav>

      <!-- Hero -->
      <main class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32 flex flex-col items-center text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-full mb-8 text-xs font-bold text-[#6d74ff] uppercase tracking-widest">
          <span class="w-2 h-2 bg-green-400 rounded-full"></span>
          Now in Beta — Free for Teams
        </div>
        <h1 class="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.05] text-white">
          Smart Inventory<br class="hidden sm:block"/>
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#6d74ff] to-blue-400">Management.</span>
        </h1>
        <p class="text-base sm:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
          The premium inventory platform for modern businesses. Track products, manage warehouses, and optimize your supply chain with clarity.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 mb-16 sm:mb-24">
          <a routerLink="/user/register" class="px-10 py-4 bg-[#6d74ff] text-white rounded-xl font-bold text-lg hover:bg-[#5a61e6] transition-colors">Get Started Free</a>
          <a routerLink="/dashboard" class="px-10 py-4 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-white rounded-xl font-bold text-lg hover:bg-white/[0.06] transition-colors">View Demo</a>
        </div>

        <!-- Preview -->
        <div class="w-full max-w-5xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-2xl relative">
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0b1e]/90 via-transparent to-transparent z-10 rounded-2xl pointer-events-none"></div>
          <div class="bg-[#111336] rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div class="flex gap-1.5"><div class="w-3 h-3 rounded-full bg-red-500/60"></div><div class="w-3 h-3 rounded-full bg-yellow-500/60"></div><div class="w-3 h-3 rounded-full bg-green-500/60"></div></div>
              <div class="flex-1 flex justify-center"><div class="px-4 py-1 bg-[#0a0b1e]/50 rounded-md text-[10px] text-slate-500 font-mono">inventory.app/dashboard</div></div>
            </div>
            <div class="p-4 sm:p-8 min-h-[200px] sm:min-h-[350px]">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div *ngFor="let s of previewStats" class="bg-[#1e2048] rounded-xl p-3 sm:p-4" [class]="'border-l-4 ' + s.border">
                  <p class="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">{{s.label}}</p>
                  <p class="text-lg sm:text-2xl font-black text-white mt-1">{{s.value}}</p>
                </div>
              </div>
              <div class="space-y-2">
                <div *ngFor="let i of [1,2,3]" class="flex items-center gap-3 bg-[#1e2048]/60 rounded-lg p-3">
                  <div class="w-8 h-8 rounded-lg bg-[#6d74ff]/20 flex-shrink-0"></div>
                  <div class="flex-1 space-y-1.5"><div class="h-2.5 bg-slate-700/60 rounded-full w-1/3"></div><div class="h-2 bg-slate-700/30 rounded-full w-2/3"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Stats -->
      <section id="stats" class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-24">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div *ngFor="let s of siteStats" class="text-center">
            <p class="text-3xl sm:text-5xl font-black text-white mb-1">{{s.value}}</p>
            <p class="text-xs sm:text-sm uppercase tracking-widest text-slate-400 font-bold">{{s.label}}</p>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-24">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">Built for <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#6d74ff] to-blue-400">Scale</span></h2>
          <p class="text-slate-300 max-w-xl mx-auto">Every feature designed with precision for modern inventory management.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let f of features" class="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-6 sm:p-8 hover:border-[#6d74ff]/30 transition-all hover:scale-[1.02] group">
            <div class="w-12 h-12 bg-gradient-to-br from-[#6d74ff]/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-5 text-xl">{{f.icon}}</div>
            <h3 class="text-lg font-bold text-white mb-2">{{f.title}}</h3>
            <p class="text-sm text-slate-300 leading-relaxed">{{f.desc}}</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-24">
        <div class="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#6d74ff] to-transparent"></div>
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">Ready to <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#6d74ff] to-blue-400">Optimize?</span></h2>
          <p class="text-slate-300 max-w-lg mx-auto mb-8">Join thousands of businesses managing inventory with clarity. Free forever for small teams.</p>
          <a routerLink="/user/register" class="inline-block px-10 py-4 bg-[#6d74ff] text-white rounded-xl font-bold text-lg hover:bg-[#5a61e6] transition-colors">Start Free Today</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="relative z-10 border-t border-white/[0.06]">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-gradient-to-br from-[#6d74ff] to-blue-500 rounded-lg flex items-center justify-center"><span class="text-white font-black text-xs">I</span></div>
              <span class="text-sm font-bold text-white">Inven<span class="text-[#6d74ff]">tory</span></span>
            </div>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest">© 2026 Inventory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class LandingComponent {
  mobileMenu = signal(false);
  previewStats = [
    { label: 'Products', value: '2,481', border: 'border-l-blue-500' },
    { label: 'In Transit', value: '142', border: 'border-l-[#6d74ff]' },
    { label: 'Fulfilled', value: '1,836', border: 'border-l-green-500' },
    { label: 'Warehouses', value: '12', border: 'border-l-amber-500' },
  ];
  siteStats = [
    { value: '10k+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50M+', label: 'Items Tracked' },
    { value: '24/7', label: 'Support' },
  ];
  features = [
    { icon: '⚡', title: 'Real-time Tracking', desc: 'Track every item across warehouses in real-time with instant sync and zero lag.' },
    { icon: '📦', title: 'Smart Warehousing', desc: 'AI-powered warehouse organization and automated reorder point suggestions.' },
    { icon: '🔗', title: 'Deep Integrations', desc: 'Connect with Shopify, Amazon, SAP, and 50+ platforms your business uses.' },
    { icon: '🛡️', title: 'Enterprise Security', desc: 'SOC 2 compliant with end-to-end encryption and granular access controls.' },
    { icon: '📊', title: 'Advanced Analytics', desc: 'Rich dashboards with demand forecasting and custom report generation.' },
    { icon: '🌙', title: 'Void Blue Theme', desc: 'A premium dark interface designed for comfortable all-day monitoring.' },
  ];
}
