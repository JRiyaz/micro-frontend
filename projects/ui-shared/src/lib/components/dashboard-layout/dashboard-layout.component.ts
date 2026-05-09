import { Component, viewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopnavComponent } from '../topnav/topnav.component';
import { SidebarComponent, SidebarNavItem } from '../sidebar/sidebar.component';

@Component({
  selector: 'ui-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopnavComponent, SidebarComponent],
  template: `
    <div class="flex h-screen bg-white dark:bg-dark-base text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-500">
      <!-- Sidebar -->
      <ui-sidebar #sidebar [branding]="branding()" [navItems]="navItems()" />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-dark-base">
        <!-- Top Nav -->
        <ui-topnav (sidebarToggle)="sidebar.toggle()" class="flex-shrink-0" />

        <!-- Page Content -->
        <main class="flex-1 overflow-hidden bg-white dark:bg-dark-surface rounded-tl-[2.5rem] border-t border-l border-slate-200 dark:border-white/[0.08] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-500">
          <div class="h-full overflow-y-auto custom-scrollbar">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent {
  sidebar = viewChild<SidebarComponent>('sidebar');
  private route = inject(ActivatedRoute);

  branding = computed(() => this.route.snapshot.data['branding'] || { title: 'App', subtitle: '', logoText: 'A' });
  navItems = computed(() => this.route.snapshot.data['navItems'] || []);
}
