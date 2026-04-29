import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  
  // All notifications for the side nav
  notifications = this._notifications.asReadonly();
  
  // Active toasts (recent and not closed)
  private _activeToasts = signal<Notification[]>([]);
  activeToasts = this._activeToasts.asReadonly();

  // Sidenav state
  sidenavOpen = signal(false);

  constructor() {}

  notify(type: NotificationType, title: string, message: string, duration: number = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      autoClose: true
    };

    // Add to main list
    this._notifications.update(prev => [notification, ...prev]);
    
    // Add to toasts
    this._activeToasts.update(prev => [...prev, notification]);

    // Auto-remove from toasts
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
    
    return id;
  }

  success(title: string, message: string) {
    return this.notify('success', title, message);
  }

  error(title: string, message: string) {
    return this.notify('error', title, message);
  }

  info(title: string, message: string) {
    return this.notify('info', title, message);
  }

  warning(title: string, message: string) {
    return this.notify('warning', title, message);
  }

  removeToast(id: string) {
    this._activeToasts.update(prev => prev.filter(n => n.id !== id));
  }

  removeNotification(id: string) {
    this._notifications.update(prev => prev.filter(n => n.id !== id));
    this.removeToast(id);
  }

  clearAll() {
    this._notifications.set([]);
    this._activeToasts.set([]);
  }

  markAsRead(id: string) {
    this._notifications.update(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }
}
