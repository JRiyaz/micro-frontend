import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopnavComponent } from '../topnav/topnav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'ui-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopnavComponent, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50 dark:bg-dark-base text-slate-900 dark:text-slate-200 overflow-hidden">
      <!-- Sidebar -->
      <ui-sidebar #sidebar />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Nav -->
        <ui-topnav (sidebarToggle)="sidebar.toggle()" />

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent {
  sidebar = viewChild<SidebarComponent>('sidebar');
}
