import { Injectable, signal, computed } from '@angular/core';
import { Product } from './inventory-data.service';

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() => 
    this._items().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly subtotal = computed(() => 
    this._items().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  readonly tax = computed(() => this.subtotal() * 0.15); // 15% tax

  readonly total = computed(() => this.subtotal() + this.tax());

  addToCart(product: Product, quantity: number = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.id === product.id);
      if (existing) {
        return items.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
        );
      }
      return [...items, { ...product, quantity }];
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.update(items => 
      items.map(i => i.id === productId ? { ...i, quantity } : i)
    );
  }

  removeFromCart(productId: number): void {
    this._items.update(items => items.filter(i => i.id !== productId));
  }

  clearCart(): void {
    this._items.set([]);
  }
}
