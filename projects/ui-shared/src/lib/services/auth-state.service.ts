import { Injectable, signal, computed } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly _isLoggedIn = signal(true);
  private readonly _roles = signal<string[]>(['Admin', 'User']);
  private readonly _currentRole = signal<string>('Admin');
  private readonly _user = signal<UserProfile | null>({
    name: 'Riyaz Khan',
    email: 'riyaz@company.com',
    role: 'Admin',
    avatarUrl: ''
  });

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly user = this._user.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly currentRole = this._currentRole.asReadonly();
  readonly isAdmin = computed(() => this._currentRole() === 'Admin');

  addRole(role: string): void {
    if (role && !this._roles().includes(role)) {
      this._roles.update(r => [...r, role]);
    }
  }

  deleteRole(role: string): void {
    this._roles.update(r => r.filter(x => x !== role));
    if (this._currentRole() === role) {
      this._currentRole.set(this._roles()[0] || '');
    }
  }

  setCurrentRole(role: string): void {
    if (this._roles().includes(role)) {
      this._currentRole.set(role);
      // Update user profile role to stay in sync
      this._user.update(u => u ? { ...u, role } : null);
    }
  }
  readonly userInitials = computed(() => {
    const u = this._user();
    if (!u) return '?';
    return u.name.split(' ').map(n => n[0]).join('').toUpperCase();
  });
  readonly avatarUrl = computed(() => {
    const u = this._user();
    if (!u) return '';
    return u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=3b429f&color=fff`;
  });

  /** Simulate login — replace with real auth later */
  login(user: UserProfile): void {
    this._user.set(user);
    this._isLoggedIn.set(true);
    this.setCurrentRole(user.role);
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
        role: 'Admin',
        avatarUrl: ''
      });
    }
  }
}
