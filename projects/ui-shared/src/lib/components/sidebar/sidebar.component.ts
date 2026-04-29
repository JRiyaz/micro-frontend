import { Component, signal, inject, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface SubProject {
  name: string;
  status: 'running' | 'offline' | 'error';
  port?: number;
}

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay for mobile -->
    <div *ngIf="mobileOpen()" (click)="mobileOpen.set(false)" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>

    <aside #sidebarRef
      [ngClass]="{
        'sidebar-expanded': !collapsed() || mobileOpen(),
        'sidebar-collapsed': collapsed() && !mobileOpen(),
        'sidebar-mobile-open': mobileOpen(),
        'sidebar-mobile-closed': !mobileOpen()
      }"
      class="sidebar-aside fixed lg:static inset-y-0 left-0 border-r border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-dark-surface flex flex-col z-40 lg:z-auto">

      <!-- Close button (mobile only) -->
      <button (click)="mobileOpen.set(false)" class="lg:hidden absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 z-10" id="sidebar-close-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <!-- Scrollable content area -->
      <div class="sidebar-content flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll min-h-0 py-5"
           [class.px-5]="!collapsed() || mobileOpen()" [class.px-2]="collapsed() && !mobileOpen()">

        <!-- Project Workspace Section -->
        <div class="mb-6"
             (mouseenter)="onProjectHover($event, true)"
             (mouseleave)="onProjectHover($event, false)">

          <!-- Expanded: Full dropdown -->
          <div [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Project Workspace</label>
            <div class="relative">
              <button (click)="projectDropdownOpen.set(!projectDropdownOpen())"
                      class="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-left flex items-center justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-colors focus:outline-none"
                      id="sidebar-project-dropdown">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        [class.bg-green-400]="getSelectedProject()?.status === 'running'"
                        [class.bg-slate-500]="getSelectedProject()?.status === 'offline'"
                        [class.bg-red-500]="getSelectedProject()?.status === 'error'">
                  </span>
                  <span class="truncate text-slate-900 dark:text-white font-medium">{{ getSelectedProject()?.name || 'Select Project' }}</span>
                </div>
                <svg class="w-4 h-4 text-slate-500 flex-shrink-0 transition-transform" [class.rotate-180]="projectDropdownOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              <!-- Project List (expanded dropdown) -->
              <div *ngIf="projectDropdownOpen()" class="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden z-20 animate-dropdown shadow-md dark:shadow-xl dark:shadow-black/40">
                <div *ngFor="let project of subProjects(); let i = index"
                     (click)="selectProject(i)"
                     class="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer transition-colors"
                     [class.bg-primary/10]="i === selectedProjectIndex()"
                     [class.text-slate-900]="i === selectedProjectIndex()"
                     [class.dark:text-white]="i === selectedProjectIndex()"
                     [class.text-slate-500]="i !== selectedProjectIndex()"
                     [class.dark:text-slate-400]="i !== selectedProjectIndex()"
                     [class.hover:bg-slate-100]="i !== selectedProjectIndex()"
                     [class.dark:hover:bg-white/[0.04]]="i !== selectedProjectIndex()">
                    <span class="w-2 h-2 rounded-full flex-shrink-0"
                          [class.bg-green-400]="project.status === 'running'"
                          [class.bg-slate-500]="project.status === 'offline'"
                          [class.bg-red-500]="project.status === 'error'">
                    </span>
                    <span class="truncate flex-1">{{ project.name }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                          [class.text-green-400]="project.status === 'running'"
                          [class.text-slate-600]="project.status === 'offline'"
                          [class.text-red-400]="project.status === 'error'">
                      {{ project.status }}
                    </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Collapsed: Icon button -->
          <div [class.sidebar-show]="collapsed() && !mobileOpen()" [class.sidebar-hide]="!collapsed() || mobileOpen()" class="sidebar-fade flex justify-center">
            <button class="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors shadow-sm dark:shadow-none" title="Project Workspace">
              <span class="w-2.5 h-2.5 rounded-full"
                    [class.bg-green-400]="getSelectedProject()?.status === 'running'"
                    [class.bg-slate-500]="getSelectedProject()?.status === 'offline'"
                    [class.bg-red-500]="getSelectedProject()?.status === 'error'">
              </span>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="space-y-1">
          <!-- Section label (expanded only) -->
          <label [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()"
                 class="sidebar-fade text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Navigation</label>

          <div *ngFor="let item of navItems; let idx = index" class="nav-item-wrapper"
               (mouseenter)="onNavHover($event, idx)"
               (mouseleave)="onNavHover($event, -1)">
            <a [routerLink]="item.route" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: item.exact }"
               class="nav-link flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl transition-all text-sm font-medium group"
               [class.px-3]="!collapsed() || mobileOpen()"
               [class.justify-center]="collapsed() && !mobileOpen()"
               [class.px-0]="collapsed() && !mobileOpen()">
              <span [innerHTML]="item.icon" class="icon-container w-5 h-5 block group-hover:text-primary transition-colors flex-shrink-0"></span>
              <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text">{{ item.label }}</span>
            </a>
          </div>
        </nav>

        <!-- Quick Stats (expanded only) -->
        <div [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade mt-8">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] block mb-3 px-1">Quick Stats</label>
          <div class="space-y-3">
            <div class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3.5 shadow-sm dark:shadow-none">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sprint 4</span>
                <span class="text-[10px] font-bold text-primary">65%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5">
                <div class="bg-gradient-to-r from-primary to-blue-400 h-1.5 rounded-full transition-all duration-500" style="width: 65%"></div>
              </div>
            </div>
            <div class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3.5 shadow-sm dark:shadow-none">
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

      <!-- Bottom: Toggle + Version (sticky at bottom) -->
      <div class="border-t border-slate-200 dark:border-white/[0.06] flex-shrink-0">
        <!-- Version info (expanded) -->
        <div [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade px-5 py-3">
          <div class="flex items-center gap-2 px-1">
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Online</span>
            <span class="ml-auto text-[10px] text-slate-600 font-mono">v1.0.0</span>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <button (click)="toggleDarkMode()" class="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors border-t border-slate-200 dark:border-white/[0.06]" id="sidebar-dark-mode-toggle">
          <svg *ngIf="!isDarkMode()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          <svg *ngIf="isDarkMode()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text text-[10px] font-bold uppercase tracking-widest">{{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>

        <!-- Collapse Toggle (desktop only) -->
        <button (click)="collapsed.set(!collapsed())" class="hidden lg:flex w-full items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors border-t border-slate-200 dark:border-white/[0.06]" id="sidebar-collapse-toggle">
          <svg class="w-4 h-4 transition-transform duration-300" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7"></path></svg>
          <span [class.sidebar-show]="!collapsed() || mobileOpen()" [class.sidebar-hide]="collapsed() && !mobileOpen()" class="sidebar-fade-text text-[10px] font-bold uppercase tracking-widest">Collapse</span>
        </button>
      </div>
    </aside>

    <!-- ===== FIXED-POSITION FLYOUTS (outside overflow-hidden) ===== -->

    <!-- Nav tooltip flyout -->
    <div *ngIf="navFlyoutIndex() >= 0 && collapsed() && !mobileOpen()"
         class="fixed z-[9999] animate-flyout"
         [style.left.px]="flyoutLeft"
         [style.top.px]="navFlyoutTop"
         (mouseenter)="onNavHover($event, navFlyoutIndex(), true)"
         (mouseleave)="onNavHover($event, -1, true)">
      <div class="bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 whitespace-nowrap shadow-md dark:shadow-xl dark:shadow-black/40">
        <span class="text-xs font-medium text-slate-900 dark:text-white">{{ navItems[navFlyoutIndex()]?.label }}</span>
      </div>
    </div>

    <!-- Project services flyout -->
    <div *ngIf="projectFlyout() && collapsed() && !mobileOpen()"
         class="fixed z-[9999] animate-flyout"
         [style.left.px]="flyoutLeft"
         [style.top.px]="projectFlyoutTop"
         (mouseenter)="onProjectHover($event, true, true)"
         (mouseleave)="onProjectHover($event, false, true)">
      <div class="w-56 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-md dark:shadow-xl dark:shadow-black/40">
        <div class="px-3.5 py-2.5 border-b border-slate-200 dark:border-white/[0.06]">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace</span>
        </div>
        <div *ngFor="let project of subProjects(); let i = index"
             (click)="selectProject(i); projectFlyout.set(false)"
             class="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer transition-colors"
             [class.bg-primary/10]="i === selectedProjectIndex()"
             [class.text-slate-900]="i === selectedProjectIndex()"
             [class.dark:text-white]="i === selectedProjectIndex()"
             [class.text-slate-500]="i !== selectedProjectIndex()"
             [class.dark:text-slate-400]="i !== selectedProjectIndex()"
             [class.hover:bg-slate-100]="i !== selectedProjectIndex()"
             [class.dark:hover:bg-white/[0.04]]="i !== selectedProjectIndex()">
          <span class="w-2 h-2 rounded-full flex-shrink-0"
                [class.bg-green-400]="project.status === 'running'"
                [class.bg-slate-500]="project.status === 'offline'"
                [class.bg-red-500]="project.status === 'error'">
          </span>
          <span class="truncate flex-1 text-xs">{{ project.name }}</span>
          <span class="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                [class.text-green-400]="project.status === 'running'"
                [class.text-slate-600]="project.status === 'offline'"
                [class.text-red-400]="project.status === 'error'">
            {{ project.status }}
          </span>
        </div>
      </div>
    </div>
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
      width: 256px;
    }
    .sidebar-collapsed {
      width: 68px;
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
      display: block;
    }
    .icon-container svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* ===== Nav active state ===== */
    .nav-active {
      background: rgba(109, 116, 255, 0.08);
      color: #6d74ff;
    }
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

    /* ===== Dropdown animation (expanded mode) ===== */
    @keyframes dropdown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-dropdown {
      animation: dropdown 0.15s ease-out forwards;
    }

    /* ===== Thin scrollbar ===== */
    .sidebar-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .sidebar-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.08) transparent;
    }

    /* ===== Mobile sidebar slide transitions ===== */
    .sidebar-mobile-closed {
      transform: translateX(-100%);
    }
    .sidebar-mobile-open {
      transform: translateX(0);
      width: 288px !important;
    }
    @media (min-width: 1024px) {
      .sidebar-mobile-closed,
      .sidebar-mobile-open {
        transform: none;
      }
      .sidebar-mobile-open {
        width: 256px !important;
      }
      .sidebar-aside {
        height: 100vh;
        min-height: 100vh;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  mobileOpen = signal(false);
  collapsed = signal(false);
  projectDropdownOpen = signal(false);
  projectFlyout = signal(false);
  selectedProjectIndex = signal(0);
  navFlyoutIndex = signal(-1);
  isDarkMode = signal(false);

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.isDarkMode.set(document.documentElement.classList.contains('dark'));
    }
    this.loadManifestProjects();
  }

  private async loadManifestProjects() {
    try {
      const response = await fetch('/federation.manifest.json');
      const manifest = await response.json();

      const projects: SubProject[] = [
        { name: 'Inventory Shell', status: 'running', port: 4200 }
      ];

      Object.entries(manifest).forEach(([key, value]) => {
        // Extract port from URL if possible
        const url = value as string;
        const portMatch = url.match(/:(\d+)\//);
        const port = portMatch ? parseInt(portMatch[1], 10) : undefined;

        // Map manifest keys to more readable names
        const name = key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        projects.push({
          name: name,
          status: 'running',
          port: port
        });
      });

      this.subProjects.set(projects);
    } catch (err) {
      console.error('Error loading manifest projects:', err);
    }
  }

  toggleDarkMode() {
    const isDark = !this.isDarkMode();
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Flyout positioning
  flyoutLeft = 76; // 68px sidebar + 8px gap
  navFlyoutTop = 0;
  projectFlyoutTop = 0;

  private projectFlyoutTimeout: any;
  private navFlyoutTimeout: any;

  @ViewChild('sidebarRef') sidebarRef!: ElementRef<HTMLElement>;

  subProjects = signal<SubProject[]>([
    { name: 'Inventory Shell', status: 'running', port: 4200 }
  ]);

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
      route: '/dashboard/products',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path><polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>')
    },
    {
      label: 'Orders',
      route: '/dashboard/orders',
      exact: false,
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>')
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

  onProjectHover(event: MouseEvent, entering: boolean, isFlyout = false): void {
    if (!this.collapsed() || this.mobileOpen()) return;

    if (entering) {
      clearTimeout(this.projectFlyoutTimeout);
      if (!isFlyout) {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        this.projectFlyoutTop = rect.top;
        this.flyoutLeft = this.getSidebarRight();
      }
      this.projectFlyout.set(true);
    } else {
      this.projectFlyoutTimeout = setTimeout(() => {
        this.projectFlyout.set(false);
      }, 150); // Small delay to allow mouse to reach the flyout
    }
  }

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

  private getSidebarRight(): number {
    if (this.sidebarRef?.nativeElement) {
      return this.sidebarRef.nativeElement.getBoundingClientRect().right + 4;
    }
    return 76;
  }

  getSelectedProject(): SubProject | undefined {
    return this.subProjects()[this.selectedProjectIndex()];
  }

  selectProject(index: number): void {
    this.selectedProjectIndex.set(index);
    this.projectDropdownOpen.set(false);
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
