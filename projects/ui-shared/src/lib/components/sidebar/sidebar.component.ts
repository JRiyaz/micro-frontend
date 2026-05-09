import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, signal, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../utils/safe-html.pipe';

export interface SidebarNavItem {
  label: string;
  route: string;
  exact: boolean;
  icon: string; // SVG string
}

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
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

      <div class="h-12 flex items-center flex-shrink-0 bg-white dark:bg-dark-base z-10 transition-all duration-500 border-b border-slate-100 dark:border-white/[0.04]"
           [class.px-4]="!collapsed() || mobileOpen()" [class.justify-center]="collapsed() && !mobileOpen()">
        <a routerLink="/" class="flex items-center gap-2 overflow-hidden">
          <div class="w-8 h-8 bg-gradient-to-tr from-primary via-primary/80 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
            <span class="text-white font-black text-xs">{{ branding.logoText || 'A' }}</span>
          </div>
          <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" 
                class="sidebar-fade-text text-sm font-black tracking-tight text-slate-900 dark:text-white">
            {{ branding.title }}<span class="text-primary">{{ branding.subtitle }}</span>
          </span>
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
                 class="nav-link flex items-center gap-2 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/[0.04] rounded-lg transition-all text-xs font-medium group"
                 [class.justify-center]="collapsed() && !mobileOpen()">
                <span [innerHTML]="item.icon | safeHtml" class="icon-container w-4 h-4 block group-hover:text-primary transition-colors flex-shrink-0"></span>
                <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text">{{ item.label }}</span>
              </a>
            </div>
          }
        </nav>
      </div>

      <!-- Bottom Utilities -->
      <div class="border-t border-slate-200 dark:border-white/[0.06] flex-shrink-0">
        <button (click)="collapsed.set(!collapsed())" 
                (mouseenter)="onUtilityHover($event, collapsed() ? 'Expand' : 'Collapse')"
                (mouseleave)="onUtilityHover($event, null)"
                class="hidden lg:flex w-full items-center justify-center gap-3 py-4 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-all border-t border-slate-200 dark:border-white/[0.06] group/collapse">
          <div class="transition-transform duration-500" [class.rotate-180]="collapsed()">
            <svg class="w-5 h-5 flex-shrink-0 group-hover/collapse:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7"></path></svg>
          </div>
          <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text text-[10px] font-bold uppercase tracking-widest">Collapse Sidebar</span>
        </button>
      </div>
    </aside>

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
    :host { display: contents; }
    .sidebar-aside { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); will-change: width; overflow: hidden; }
    .sidebar-expanded { width: 220px; }
    .sidebar-collapsed { width: 56px; }
    .sidebar-fade { transition: opacity 0.2s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease; overflow: hidden; }
    .sidebar-fade.sidebar-show { opacity: 1; max-height: 500px; pointer-events: auto; overflow: visible; }
    .sidebar-fade.sidebar-hide { opacity: 0; max-height: 0; pointer-events: none; margin: 0; padding: 0; }
    .sidebar-fade-text { transition: opacity 0.2s ease, width 0.3s ease; overflow: hidden; white-space: nowrap; }
    .sidebar-fade-text.sidebar-show { opacity: 1; width: auto; }
    .sidebar-fade-text.sidebar-hide { opacity: 0; width: 0; }
    .icon-container { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
    @keyframes flyout-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
    .animate-flyout { animation: flyout-in 0.15s ease-out forwards; }
    .sidebar-mobile-closed { transform: translateX(-100%); }
    .sidebar-mobile-open { transform: translateX(0); width: 260px !important; }
    @media (min-width: 1024px) {
      .sidebar-mobile-closed, .sidebar-mobile-open { transform: none; }
      .sidebar-mobile-open { width: 220px !important; }
      .sidebar-aside { height: 100vh; min-height: 100vh; }
    }
  `]
})
export class SidebarComponent {
  @Input() branding = { title: 'App', subtitle: '', logoText: 'A' };
  @Input() navItems: SidebarNavItem[] = [];

  mobileOpen = signal(false);
  collapsed = signal(false);
  navFlyoutIndex = signal(-1);
  utilityFlyoutLabel = signal<string | null>(null);

  flyoutLeft = 64;
  navFlyoutTop = 0;
  private navFlyoutTimeout: any;

  sidebarRef = viewChild<ElementRef<HTMLElement>>('sidebarRef');

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
