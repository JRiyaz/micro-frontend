import { Injectable, signal, computed } from '@angular/core';

export interface SearchableItem {
  id: string;
  title: string;
  path: string;
  category: string;
  queryParams?: Record<string, any>;
  keywords?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private registeredItems = signal<SearchableItem[]>([]);

  constructor() {
    // Initialize from global window object to ensure cross-MFE singleton behavior
    const globalSearch = (window as any).__SEARCH_REGISTRY__ || [];
    this.registeredItems.set(globalSearch);
    (window as any).__SEARCH_REGISTRY__ = globalSearch;
  }

  /**
   * The global index of searchable items
   */
  items = computed(() => this.registeredItems());

  /**
   * Register items to the global search index.
   */
  register(items: SearchableItem[]): void {
    console.log('[SearchService] Registering items:', items.map(i => i.title));
    
    const currentGlobal = (window as any).__SEARCH_REGISTRY__ || [];
    const newItems = items.filter(item => !currentGlobal.find((c: any) => c.id === item.id));
    
    const updated = [...currentGlobal, ...newItems];
    (window as any).__SEARCH_REGISTRY__ = updated;
    this.registeredItems.set(updated);
  }

  /**
   * Unregister items from the global search index.
   */
  unregister(itemIds: string[]): void {
    console.log('[SearchService] Unregistering items:', itemIds);
    
    const currentGlobal = (window as any).__SEARCH_REGISTRY__ || [];
    const updated = currentGlobal.filter((item: any) => !itemIds.includes(item.id));
    
    (window as any).__SEARCH_REGISTRY__ = updated;
    this.registeredItems.set(updated);
  }
}
