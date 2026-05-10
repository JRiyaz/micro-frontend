import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from './notification.service';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  role: 'customer' | 'employee';
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private notificationService = inject(NotificationService);
  private messages = signal<ChatMessage[]>([]);
  
  // Programmatic control
  isChatOpen = signal(false);
  
  // Observable for real-time updates (simulating websocket)
  private messageSubject = new Subject<ChatMessage>();
  message$ = this.messageSubject.asObservable();

  // Typing indicators
  isCustomerTyping = signal(false);
  isEmployeeTyping = signal(false);

  allMessages = computed(() => this.messages());
  
  unreadCount = computed(() => 
    this.messages().filter(m => !m.isRead && m.role === 'customer').length
  );

  sendMessage(text: string, senderId: string, senderName: string, role: 'customer' | 'employee') {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      senderId,
      senderName,
      text,
      timestamp: new Date(),
      role,
      isRead: role === 'customer' ? false : true // Assume employee messages are read by customer instantly in this mock
    };

    this.messages.update(msgs => [...msgs, newMessage]);
    this.messageSubject.next(newMessage);
    
    if (role === 'customer') {
      this.notificationService.info(
        'Support Request',
        `${senderName}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`
      );
    }
    
    // Simulate backend websocket delay
    console.log(`[ChatService] Message sent from ${senderName}: ${text}`);
  }

  markAllAsRead() {
    this.messages.update(msgs => 
      msgs.map(m => ({ ...m, isRead: true }))
    );
  }

  setTyping(role: 'customer' | 'employee', isTyping: boolean) {
    if (role === 'customer') {
      this.isCustomerTyping.set(isTyping);
    } else {
      this.isEmployeeTyping.set(isTyping);
    }
  }
}
