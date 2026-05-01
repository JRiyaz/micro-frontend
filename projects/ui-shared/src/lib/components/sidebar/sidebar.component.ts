import { Component, signal, inject, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay for mobile -->
    @if (mobileOpen()) {
      <div (click)="mobileOpen.set(false)" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>
    }

    <aside #sidebarRef
      [ngClass]="{
        'sidebar-expanded': !collapsed() || mobileOpen(),
        'sidebar-collapsed': collapsed() && !mobileOpen(),
        'sidebar-mobile-open': mobileOpen(),
        'sidebar-mobile-closed': !mobileOpen()
      }"
      class="sidebar-aside fixed lg:static inset-y-0 left-0 bg-slate-50 dark:bg-dark-base flex flex-col z-40 lg:z-auto transition-colors duration-500">

      <!-- Close button (mobile only) -->
      <button (click)="mobileOpen.set(false)" class="lg:hidden absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 z-50" id="sidebar-close-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="h-14 flex items-center flex-shrink-0 bg-slate-50 dark:bg-dark-base z-10 transition-all duration-500"
           [class.px-4]="!collapsed() || mobileOpen()" [class.justify-center]="collapsed() && !mobileOpen()">
        <a routerLink="/" class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
            <span class="text-white font-black text-sm">I</span>
          </div>
          <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" 
                class="sidebar-fade-text text-base font-black tracking-tight text-slate-900 dark:text-white">Inven<span class="text-primary">tory</span></span>
        </a>
      </div>

      <!-- Scrollable content area -->
      <div class="sidebar-content flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0 py-3"
           [class.px-3]="!collapsed() || mobileOpen()" [class.px-2]="collapsed() && !mobileOpen()">

        <!-- Navigation -->
        <nav class="space-y-1">
          <!-- Section label (expanded only) -->
          <label [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()"
                 class="sidebar-fade text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Navigation</label>

          @for (item of navItems; track item.route; let idx = $index) {
            <div class="nav-item-wrapper"
                 (mouseenter)="onNavHover($event, idx)"
                 (mouseleave)="onNavHover($event, -1)">
              <a [routerLink]="item.route" routerLinkActive="bg-primary/20 dark:bg-primary/20 shadow-sm hover:bg-primary" [routerLinkActiveOptions]="{ exact: item.exact }"
                 class="nav-link flex items-center gap-2.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/[0.04] rounded-lg transition-all text-[13px] font-medium group"
                 [class.px-2.5]="!collapsed() || mobileOpen()"
                 [class.justify-center]="collapsed() && !mobileOpen()"
                 [class.px-0]="collapsed() && !mobileOpen()">
                <span [innerHTML]="item.icon" class="icon-container w-5 h-5 block group-hover:text-primary transition-colors flex-shrink-0"></span>
                <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text">{{ item.label }}</span>
              </a>
            </div>
          }
        </nav>

        <!-- Quick Stats (expanded only) -->
        <div [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade mt-5">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] block mb-3 px-1">Quick Stats</label>
          <div class="space-y-3">
            <div class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg p-2.5 shadow-sm dark:shadow-none">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sprint 4</span>
                <span class="text-[10px] font-bold text-primary">65%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5">
                <div class="bg-gradient-to-r from-primary to-blue-400 h-1.5 rounded-full transition-all duration-500" style="width: 65%"></div>
              </div>
            </div>
            <div class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg p-2.5 shadow-sm dark:shadow-none">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Level</span>
                <span class="text-[10px] font-bold text-green-400">82%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5">
                <div class="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500" style="width: 82%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Utilities + Toggles (sticky at bottom) -->
      <div class="border-t border-slate-200 dark:border-white/[0.06] flex-shrink-0">
        <!-- Collapse Toggle (desktop only) -->
        <button (click)="collapsed.set(!collapsed())" 
                (mouseenter)="onUtilityHover($event, collapsed() ? 'Expand' : 'Collapse')"
                (mouseleave)="onUtilityHover($event, null)"
                class="hidden lg:flex w-full items-center justify-center gap-3 py-4 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-all border-t border-slate-200 dark:border-white/[0.06] group/collapse" id="sidebar-collapse-toggle">
          <div class="transition-transform duration-500" [class.rotate-180]="collapsed()">
            <svg class="w-5 h-5 flex-shrink-0 group-hover/collapse:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7"></path></svg>
          </div>
          <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text text-[10px] font-bold uppercase tracking-widest">Collapse Sidebar</span>
        </button>
      </div>
    </aside>

    <!-- ===== FIXED-POSITION FLYOUTS (outside overflow-hidden) ===== -->

    <!-- Tooltip flyout -->
    @if ((navFlyoutIndex() >= 0 || utilityFlyoutLabel()) && collapsed() && !mobileOpen()) {
      <div class="fixed z-[9999] animate-flyout"
           [style.left.px]="flyoutLeft"
           [style.top.px]="navFlyoutTop">
        <div class="bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 whitespace-nowrap shadow-md dark:shadow-xl dark:shadow-black/40">
          <span class="text-xs font-medium text-slate-900 dark:text-white">
            {{ navFlyoutIndex() >= 0 ? navItems[navFlyoutIndex()]?.label : utilityFlyoutLabel() }}
          </span>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    /* ===== Sidebar width & transition ===== */
    .sidebar-aside {
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: width;
      overflow: hidden;
    }
    .sidebar-expanded {
      width: 220px;
    }
    .sidebar-collapsed {
      width: 56px;
    }

    /* ===== Fade transitions for expanded/collapsed content ===== */
    .sidebar-fade {
      transition: opacity 0.2s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease;
      overflow: hidden;
    }
    .sidebar-fade.sidebar-show {
      opacity: 1;
      max-height: 500px;
      pointer-events: auto;
      overflow: visible;
    }
    .sidebar-fade.sidebar-hide {
      opacity: 0;
      max-height: 0;
      pointer-events: none;
      margin: 0;
      padding: 0;
    }

    /* Text labels fade (inline, no height collapse) */
    .sidebar-fade-text {
      transition: opacity 0.2s ease, width 0.3s ease;
      overflow: hidden;
      white-space: nowrap;
    }
    .sidebar-fade-text.sidebar-show {
      opacity: 1;
      width: auto;
    }
    .sidebar-fade-text.sidebar-hide {
      opacity: 0;
      width: 0;
    }

    /* ===== Icon rendering ===== */
    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    .icon-container svg {
      width: 100%;
      height: 100%;
    }

    /* ===== Nav active state ===== */
    .nav-active span {
      color: #6d74ff;
    }

    /* ===== Flyout animation ===== */
    @keyframes flyout-in {
      from {
        opacity: 0;
        transform: translateX(-6px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-flyout {
      animation: flyout-in 0.15s ease-out forwards;
    }

    /* ===== Mobile sidebar slide transitions ===== */
    .sidebar-mobile-closed {
      transform: translateX(-100%);
    }
    .sidebar-mobile-open {
      transform: translateX(0);
      width: 260px !important;
    }
    @media (min-width: 1024px) {
      .sidebar-mobile-closed,
      .sidebar-mobile-open {
        transform: none;
      }
      .sidebar-mobile-open {
        width: 220px !important;
      }
      .sidebar-aside {
        height: 100vh;
        min-height: 100vh;
      }
    }
  `]
})
export class SidebarComponent {
  mobileOpen = signal(false);
  collapsed = signal(false);
  navFlyoutIndex = signal(-1);
  utilityFlyoutLabel = signal<string | null>(null);

  // Flyout positioning
  flyoutLeft = 64; // 56px sidebar + 8px gap
  navFlyoutTop = 0;

  private navFlyoutTimeout: any;

  sidebarRef = viewChild<ElementRef<HTMLElement>>('sidebarRef');

  private sanitizer = inject(DomSanitizer);

  navItems: { label: string; route: string; exact: boolean; icon: SafeHtml }[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      exact: true,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>')
    },
    {
      label: 'Products',
      route: '/inventory/products',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path><polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>')
    },
    {
      label: 'Orders',
      route: '/inventory/orders',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>')
    },
    {
      label: 'Customers',
      route: '/inventory/customers',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>')
    },
    {
      label: 'Warehouse',
      route: '/dashboard/warehouse',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>')
    },
    {
      label: 'Reports',
      route: '/dashboard/reports',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>')
    }
  ];

  onNavHover(event: MouseEvent, idx: number, isFlyout = false): void {
    if (!this.collapsed() || this.mobileOpen()) {
      this.navFlyoutIndex.set(-1);
      return;
    }

    if (idx >= 0) {
      clearTimeout(this.navFlyoutTimeout);
      if (!isFlyout) {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        this.navFlyoutTop = rect.top + rect.height / 2 - 14; // center vertically
        this.flyoutLeft = this.getSidebarRight();
      }
      this.navFlyoutIndex.set(idx);
    } else {
      this.navFlyoutTimeout = setTimeout(() => {
        this.navFlyoutIndex.set(-1);
      }, 150);
    }
  }

  onUtilityHover(event: MouseEvent, label: string | null): void {
    if (!this.collapsed() || this.mobileOpen()) {
      this.utilityFlyoutLabel.set(null);
      return;
    }

    if (label) {
      clearTimeout(this.navFlyoutTimeout);
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.navFlyoutTop = rect.top + rect.height / 2 - 14;
      this.flyoutLeft = this.getSidebarRight();
      this.utilityFlyoutLabel.set(label);
    } else {
      this.navFlyoutTimeout = setTimeout(() => {
        this.utilityFlyoutLabel.set(null);
      }, 150);
    }
  }

  private getSidebarRight(): number {
    const sidebar = this.sidebarRef();
    if (sidebar) {
      return sidebar.nativeElement.getBoundingClientRect().right + 4;
    }
    return 76;
  }

  /** Called from topnav hamburger on mobile */
  toggle(): void {
    this.mobileOpen.set(!this.mobileOpen());
  }

  open(): void {
    this.mobileOpen.set(true);
  }

  close(): void {
    this.mobileOpen.set(false);
  }
}
