import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly themes = ['void-blue', 'emerald', 'rose', 'obsidian', 'gold'];
  currentTheme = signal<string>('void-blue');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Optimistic initial load from localStorage to avoid FOUC
      const stored = localStorage.getItem('color-theme');
      if (stored && this.themes.includes(stored)) {
        this.currentTheme.set(stored);
        this.applyThemeToDOM(stored);
      }
      
      // Fetch from backend
      this.getThemeFromBackend().subscribe(theme => {
        if (theme && this.themes.includes(theme)) {
          this.currentTheme.set(theme);
          this.applyThemeToDOM(theme);
        }
      });
    }

    // Effect to automatically sync DOM whenever signal changes
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const theme = this.currentTheme();
        this.applyThemeToDOM(theme);
      }
    });
  }

  private applyThemeToDOM(theme: string) {
    if (theme === 'void-blue') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('color-theme', theme);
  }

  setTheme(theme: string): void {
    if (this.themes.includes(theme)) {
      this.currentTheme.set(theme);
      this.saveThemeToBackend(theme).subscribe();
    }
  }

  // Simulated backend calls
  private getThemeFromBackend(): Observable<string | null> {
    // In a real app, this would be an HTTP GET request
    // We simulate returning null if no theme is found, falling back to current
    const mockDbTheme = localStorage.getItem('mock-db-theme') || null;
    return of(mockDbTheme).pipe(delay(500));
  }

  private saveThemeToBackend(theme: string): Observable<boolean> {
    // In a real app, this would be an HTTP POST/PUT request
    localStorage.setItem('mock-db-theme', theme);
    return of(true).pipe(delay(300));
  }
}
