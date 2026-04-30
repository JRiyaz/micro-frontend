import { Component, signal, input, output, HostListener, ElementRef, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: any;
  label: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'lib-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" id="dropdown-container">
      <button 
        type="button"
        (click)="toggle()"
        class="w-full flex items-center justify-between bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white transition-all hover:border-primary focus:border-primary outline-none group"
      >
        <span class="flex items-center gap-3">
          @if (selectedOption()?.color) {
            <div [style.background]="selectedOption()?.color" class="w-2 h-2 rounded-full"></div>
          }
          {{ selectedOption()?.label || placeholder() }}
        </span>
        <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="isOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      @if (isOpen()) {
        <div 
             class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-dropdown-in backdrop-blur-xl">
          <div class="max-h-60 overflow-y-auto custom-scrollbar">
            @for (option of options(); track option.value) {
              <button 
                (click)="select(option)"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all text-left"
                [class.text-primary]="option.value === value()"
                [class.bg-primary/5]="option.value === value()"
              >
                @if (option.color) {
                  <div [style.background]="option.color" class="w-2 h-2 rounded-full"></div>
                }
                @if (option.icon) {
                  <span [innerHTML]="option.icon" class="w-4 h-4 text-slate-400"></span>
                }
                {{ option.label }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes dropdown-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-dropdown-in { animation: dropdown-in 0.2s ease-out; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(109, 116, 255, 0.2); border-radius: 10px; }
  `]
})
export class CustomDropdownComponent {
  options = input<DropdownOption[]>([]);
  value = input<any>(null);
  placeholder = input<string>('Select Option');
  valueChange = output<any>();

  isOpen = signal(false);
  private eRef = inject(ElementRef);

  selectedOption = computed(() => {
    return this.options().find(o => o.value === this.value());
  });

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  select(option: DropdownOption) {
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }
}
