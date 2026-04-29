import { Component, output, signal, OnInit, inject, computed, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { LoadingService } from '../../services/loading.service';
import { SearchService } from '../../services/search.service';

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
      </div>

      <!-- Center: Search Bar -->
      <div class="flex-1 max-w-xl mx-4 hidden sm:block pt-1">
        <div class="relative group">
          <input #searchInput type="text" placeholder=" "
                 (input)="onSearchInput($event)"
                 (keydown)="handleSearchKeydown($event)"
                 (blur)="onBlur()"
                 class="peer w-full bg-transparent border-b-2 border-slate-200 dark:border-white/[0.08] py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-primary transition-all placeholder-transparent" id="topnav-search">
          
          <label for="topnav-search" 
                 class="absolute left-10 -top-2 text-slate-500 dark:text-slate-400 text-[10px] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2 peer-focus:text-primary peer-focus:text-[10px] pointer-events-none uppercase font-bold tracking-widest">
            Search products, orders...
          </label>

          <svg class="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>

          <button (click)="focusSearch()" class="absolute right-0 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden lg:inline-block hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            {{ isMac ? '⌘K' : 'Ctrl+K' }}
          </button>

          <!-- Search Results Dropdown -->
          <div *ngIf="showResults()" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] shadow-xl rounded-xl overflow-hidden z-50 animate-fade-in">
            <div class="p-2">
              <button *ngFor="let result of searchResults(); let i = index" 
                      (mousedown)="selectResult(result)"
                      [class.bg-slate-50]="selectedIndex() === i"
                      [class.dark:bg-white/[0.06]]="selectedIndex() === i"
                      class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors"
                        [class.text-primary]="selectedIndex() === i">{{ result.title }}</span>
                  <span class="text-[10px] text-slate-500 uppercase tracking-widest">{{ result.path }}</span>
                </div>
                <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">{{ result.category }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Notifications + User -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Mobile Search -->
        <button (click)="focusSearch()" class="sm:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>

        <!-- Sync Data -->
        <button 
          (click)="showSyncConfirm.set(true)"
          class="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" 
          id="topnav-sync-data"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>

        <!-- Dark Mode Toggle -->
        <button 
          (click)="darkModeService.toggle()"
          class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" 
          id="topnav-dark-mode"
        >
          <svg *ngIf="!darkModeService.isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          <svg *ngIf="darkModeService.isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </button>

        <!-- Notifications -->
        <button 
          (click)="notificationService.sidenavOpen.set(!notificationService.sidenavOpen())"
          class="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" 
          [class.text-amber-500]="notificationService.config().dnd"
          id="topnav-notifications"
        >
          @if (notificationService.config().dnd) {
            <!-- Bell Off Icon (Strikethrough only) -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              <line x1="3" y1="3" x2="21" y2="21" stroke-width="2" stroke-linecap="round"></line>
            </svg>
          } @else {
            <!-- Normal Bell Icon -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          }

          @if (unreadCount() > 0) {
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white dark:border-dark-surface"
                  [class.bg-amber-500]="notificationService.config().dnd"
                  [class.bg-red-500]="!notificationService.config().dnd">
            </span>
          }
        </button>

        <!-- User Dropdown -->
        <div class="relative">
          <button (click)="userDropdownOpen.set(!userDropdownOpen())" class="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-slate-200 dark:border-white/[0.08] cursor-pointer group" id="topnav-user-menu">
            <ng-container *ngIf="auth.isLoggedIn(); else notLoggedIn">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold leading-none text-slate-900 dark:text-white truncate">{{ auth.user()?.name }}</p>
                <p class="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
                  {{ auth.userRoles()[0] }}{{ auth.userRoles().length > 1 ? '...' : '' }}
                </p>
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

    <!-- Sync Confirmation Popup -->
    <div *ngIf="showSyncConfirm()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" (click)="showSyncConfirm.set(false)"></div>
      <div class="bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scale-in">
        <div class="p-6">
          <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Synchronize Data?</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">This will refresh all platform data from the server. Any unsaved local changes might be overwritten.</p>
          <div class="flex gap-3">
            <button (click)="showSyncConfirm.set(false)" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
            <button (click)="confirmSync()" class="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TopnavComponent implements OnInit {
  sidebarToggle = output<void>();
  userDropdownOpen = signal(false);
  showSyncConfirm = signal(false);
  searchResults = signal<any[]>([]);
  showResults = signal(false);
  selectedIndex = signal(-1);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  notificationService = inject(NotificationService);
  darkModeService = inject(DarkModeService);
  loadingService = inject(LoadingService);
  private searchService = inject(SearchService);
  private router = inject(Router);

  unreadCount = computed(() => this.notificationService.notifications().filter(n => !n.read).length);
  isMac = false;

  private routeIndex: any[] = [];

  constructor(
    public auth: AuthStateService,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    this.indexRoutes();
  }

  private indexRoutes(): void {
    // Dynamically build a searchable index from the router configuration
    const extractRoutes = (routes: any[], parentPath = '') => {
      routes.forEach(route => {
        if (route.path && !route.path.includes(':') && !route.path.includes('**')) {
          const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;
          const title = route.data?.title || this.formatPath(route.path);
          
          this.routeIndex.push({
            path: fullPath.startsWith('/') ? fullPath : `/${fullPath}`,
            title: title,
            category: parentPath ? 'Section' : 'Page',
            queryParams: {}
          });
        }
        if (route.children) {
          extractRoutes(route.children, parentPath ? `${parentPath}/${route.path}` : route.path);
        }
      });
    };

    extractRoutes(this.router.config);
  }

  private formatPath(path: string): string {
    return path.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Page';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const isK = event.key.toLowerCase() === 'k';
    const isModifier = event.ctrlKey || event.metaKey;

    if (isModifier && isK) {
      event.preventDefault();
      this.focusSearch();
    }
  }

  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  onSearchInput(event: any): void {
    const query = event.target.value.toLowerCase().trim();
    if (!query) {
      this.searchResults.set([]);
      this.showResults.set(false);
      this.selectedIndex.set(-1);
      return;
    }

    // Combine static route index with dynamic items from SearchService
    const dynamicItems = this.searchService.items();
    const allSearchable = [...this.routeIndex, ...dynamicItems];
    
    const results = allSearchable.filter(item => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesPath = item.path.toLowerCase().includes(query);
      const matchesCategory = item.category && item.category.toLowerCase().includes(query);
      const matchesKeywords = item.keywords && item.keywords.some((k: string) => k.toLowerCase().includes(query));
      
      return matchesTitle || matchesPath || matchesCategory || matchesKeywords;
    }).slice(0, 5);

    this.searchResults.set(results);
    this.showResults.set(results.length > 0);
    this.selectedIndex.set(results.length > 0 ? 0 : -1);
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (!results.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(i => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(i => (i - 1 + results.length) % results.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex() >= 0) {
          this.selectResult(results[this.selectedIndex()]);
        }
        break;
      case 'Escape':
        this.closeSearch();
        break;
    }
  }

  onBlur(): void {
    // Delay hiding results to allow (mousedown) to trigger first
    setTimeout(() => this.showResults.set(false), 200);
  }

  selectResult(result: any): void {
    this.router.navigate([result.path], { queryParams: result.queryParams });
    this.closeSearch();
  }

  closeSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.searchInput.nativeElement.blur();
    }
    this.searchResults.set([]);
    this.showResults.set(false);
    this.selectedIndex.set(-1);
  }

  handleSearch(event: any): void {
    // This is now handled by handleSearchKeydown for Enter key
  }

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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showSyncConfirm()) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        this.confirmSync();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.showSyncConfirm.set(false);
      }
    }
  }

  confirmSync(): void {
    this.showSyncConfirm.set(false);
    this.loadingService.simulateLoading(2500, 'Synchronizing Platform Data...');
  }
}
