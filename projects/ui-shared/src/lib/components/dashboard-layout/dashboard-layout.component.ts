import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopnavComponent } from '../topnav/topnav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { inject } from '@angular/core';

@Component({
  selector: 'ui-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopnavComponent, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50 dark:bg-dark-base text-slate-900 dark:text-slate-200 overflow-hidden">
      <!-- Sidebar -->
      <ui-sidebar #sidebar />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 relative">
        <!-- Top Nav -->
        <ui-topnav (sidebarToggle)="sidebar.toggle()" class="flex-shrink-0" />

        <!-- Page Content: GitLab-style floating card shape -->
        <main class="flex-1 overflow-hidden bg-white dark:bg-dark-surface rounded-tl-[2.5rem] border-t border-l border-slate-200 dark:border-white/[0.08] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
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
}
