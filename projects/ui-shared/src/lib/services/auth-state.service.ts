import { Injectable, signal, computed } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  roles: string[];
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _isLoggedIn = signal(true);
  private readonly _availableRoles = signal<string[]>(['Admin', 'User']);
  private readonly _user = signal<UserProfile | null>({
    name: 'Riyaz Khan',
    email: 'riyaz@company.com',
    roles: ['Admin'],
    avatarUrl: '',
  });

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly user = this._user.asReadonly();
  readonly availableRoles = this._availableRoles.asReadonly();

  /** Current roles assigned to the user */
  readonly userRoles = computed(() => this._user()?.roles || []);

  /** True if user has Admin role among their active roles */
  readonly isAdmin = computed(() =>
    (this._user()?.roles || []).includes('Admin'),
  );

  /** Roles available in the system that user doesn't have yet */
  readonly otherRoles = computed(() => {
    const active = this.userRoles();
    return this._availableRoles().filter((r) => !active.includes(r));
  });

  addSystemRole(role: string): void {
    if (role && !this._availableRoles().includes(role)) {
      this._availableRoles.update((r) => [...r, role]);
    }
  }

  deleteSystemRole(role: string): void {
    this._availableRoles.update((r) => r.filter((x) => x !== role));
    // Also remove from user if they had it
    this.removeRoleFromUser(role);
  }

  toggleRole(role: string): void {
    const user = this._user();
    if (!user) return;

    if (user.roles.includes(role)) {
      this.removeRoleFromUser(role);
    } else {
      this.assignRoleToUser(role);
    }
  }

  assignRoleToUser(role: string): void {
    this._user.update((u) =>
      u ? { ...u, roles: [...new Set([...u.roles, role])] } : null,
    );
  }

  removeRoleFromUser(role: string): void {
    this._user.update((u) =>
      u ? { ...u, roles: u.roles.filter((r) => r !== role) } : null,
    );
  }

  hasRole(role: string): boolean {
    return (this._user()?.roles || []).includes(role);
  }
  readonly userInitials = computed(() => {
    const u = this._user();
    if (!u) return '?';
    return u.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  });
  readonly avatarUrl = computed(() => {
    const u = this._user();
    if (!u) return '';
    return (
      u.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=3b429f&color=fff`
    );
  });

  /** Simulate login — replace with real auth later */
  login(user: UserProfile): void {
    this._user.set(user);
    this._isLoggedIn.set(true);
  }

  /** Simulate logout */
  logout(): void {
    this._user.set(null);
    this._isLoggedIn.set(false);
  }

  /** Toggle login for demo purposes */
  toggleAuth(): void {
    if (this._isLoggedIn()) {
      this.logout();
    } else {
      this.login({
        name: 'Riyaz Khan',
        email: 'riyaz@company.com',
        roles: ['Admin'],
        avatarUrl: '',
      });
    }
  }
}
