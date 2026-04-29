import { Component, output, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'ui-topnav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl relative z-30">
      <!-- Left: Hamburger + Logo -->
      <div class="flex items-center gap-3">
        <button (click)="sidebarToggle.emit()" class="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" id="topnav-sidebar-toggle">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <a routerLink="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
            <span class="text-white font-black text-base">I</span>
          </div>
          <span class="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden sm:inline">Inven<span class="text-primary">tory</span></span>
        </a>
      </div>

      <!-- Center: Search Bar -->
      <div class="flex-1 max-w-xl mx-4 hidden sm:block">
        <div class="relative">
          <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" placeholder="Search products, orders, or reports..."
                 class="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all" id="topnav-search">
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden lg:inline-block">⌘K</kbd>
        </div>
      </div>

      <!-- Right: Notifications + User -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Mobile Search -->
        <button class="sm:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>

        <!-- Notifications -->
        <button 
          (click)="notificationService.sidenavOpen.set(!notificationService.sidenavOpen())"
          class="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" 
          id="topnav-notifications"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          @if (unreadCount() > 0) {
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-surface"></span>
          }
        </button>

        <!-- User Dropdown -->
        <div class="relative">
          <button (click)="userDropdownOpen.set(!userDropdownOpen())" class="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-slate-200 dark:border-white/[0.08] cursor-pointer group" id="topnav-user-menu">
            <ng-container *ngIf="auth.isLoggedIn(); else notLoggedIn">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold leading-none text-slate-900 dark:text-white">{{ auth.user()?.name }}</p>
                <p class="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{{ auth.user()?.role }}</p>
              </div>
              <img [src]="auth.avatarUrl()" [alt]="auth.user()?.name || 'User'"
                   class="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/[0.12] group-hover:border-slate-300 dark:group-hover:border-white/[0.25] transition-colors">
            </ng-container>
            <ng-template #notLoggedIn>
              <div class="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </ng-template>
          </button>

          <!-- Dropdown Menu -->
          <div *ngIf="userDropdownOpen()" class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] shadow-md dark:shadow-xl rounded-xl overflow-hidden z-50 animate-fade-in" id="topnav-user-dropdown">
            <ng-container *ngIf="auth.isLoggedIn(); else guestMenu">
              <!-- Logged In Header -->
              <div class="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06]">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ auth.user()?.name }}</p>
                <p class="text-xs text-slate-400 truncate">{{ auth.user()?.email }}</p>
              </div>
              <div class="py-1.5">
                <a routerLink="/user/settings" (click)="userDropdownOpen.set(false)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Settings
                </a>
                <button (click)="toggleTheme()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors w-full text-left">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                  Theme
                  <span class="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{{ themeService.currentTheme() }}</span>
                </button>
                <a href="#" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Help & Support
                </a>
              </div>
              <div class="border-t border-slate-200 dark:border-white/[0.06] py-1.5">
                <button (click)="handleLogout()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
                <!-- Dev Placeholder Toggle -->
                <button (click)="auth.toggleAuth()" class="flex items-center gap-3 px-4 py-2 text-[10px] text-slate-400 hover:text-primary transition-colors w-full text-left font-bold uppercase tracking-widest border-t border-slate-200 dark:border-white/[0.06] mt-1 pt-3">
                  Toggle Auth (Dev Placeholder)
                </button>
              </div>
            </ng-container>

            <ng-template #guestMenu>
              <div class="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06]">
                <p class="text-sm font-bold text-slate-900 dark:text-white">Welcome</p>
                <p class="text-xs text-slate-400">Sign in to access your account</p>
              </div>
              <div class="py-1.5">
                <a routerLink="/user/login" (click)="userDropdownOpen.set(false)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  Sign In
                </a>
                <a routerLink="/user/register" (click)="userDropdownOpen.set(false)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  Create Account
                </a>
                <button (click)="auth.toggleAuth()" class="flex items-center gap-3 px-4 py-2 text-[10px] text-slate-400 hover:text-primary transition-colors w-full text-left font-bold uppercase tracking-widest border-t border-slate-200 dark:border-white/[0.06] mt-1 pt-3">
                  Toggle Auth (Dev Placeholder)
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </header>

    <!-- Backdrop to close dropdown -->
    <div *ngIf="userDropdownOpen()" (click)="userDropdownOpen.set(false)" class="fixed inset-0 z-20"></div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.15s ease-out forwards;
    }
  `]
})
export class TopnavComponent {
  sidebarToggle = output<void>();
  userDropdownOpen = signal(false);
  notificationService = inject(NotificationService);
  unreadCount = computed(() => this.notificationService.notifications().filter(n => !n.read).length);

  constructor(
    public auth: AuthStateService,
    public themeService: ThemeService
  ) { }

  toggleTheme(): void {
    const current = this.themeService.currentTheme();
    const themes = this.themeService.themes;
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    this.themeService.setTheme(themes[nextIndex]);
  }

  handleLogout(): void {
    this.auth.logout();
    this.userDropdownOpen.set(false);
  }
}
