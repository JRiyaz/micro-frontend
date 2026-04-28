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
  private readonly _isLoggedIn = signal(false);
  private readonly _user = signal<UserProfile | null>(null);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly user = this._user.asReadonly();
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
        role: 'Lead Developer',
        avatarUrl: ''
      });
    }
  }
}
