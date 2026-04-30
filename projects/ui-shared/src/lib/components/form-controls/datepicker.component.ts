import { Component, signal, input, output, HostListener, ElementRef, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-custom-datepicker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" id="datepicker-container">
      <button 
        type="button"
        (click)="toggle()"
        class="w-full flex items-center justify-between bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white transition-all hover:border-primary focus:border-primary outline-none group"
      >
        <span class="flex items-center gap-3">
          <svg class="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          {{ formattedDate() || placeholder() }}
        </span>
        <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="isOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      @if (isOpen()) {
        <div 
             class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] p-4 animate-dropdown-in backdrop-blur-xl">
          
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <button (click)="prevMonth()" class="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <span class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
              {{ monthNames[viewDate().getMonth()] }} {{ viewDate().getFullYear() }}
            </span>
            <button (click)="nextMonth()" class="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          <!-- Weekdays -->
          <div class="grid grid-cols-7 mb-2">
            @for (day of weekDays; track day) {
              <div class="text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter py-2">
                {{ day }}
              </div>
            }
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-1">
            @for (day of calendarDays(); track day.date.getTime()) {
              <button 
                (click)="selectDate(day.date)"
                [disabled]="!day.isCurrentMonth"
                [class.opacity-20]="!day.isCurrentMonth"
                [class.bg-primary]="isSelected(day.date)"
                [class.text-white]="isSelected(day.date)"
                [class.font-black]="isSelected(day.date)"
                [class.hover:bg-slate-100]="!isSelected(day.date) && day.isCurrentMonth"
                [class.dark:hover:bg-white/5]="!isSelected(day.date) && day.isCurrentMonth"
                class="aspect-square flex items-center justify-center text-[11px] font-bold rounded-lg transition-all"
              >
                {{ day.date.getDate() }}
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
  `]
})
export class CustomDatePickerComponent {
  value = input<string | Date>('');
  placeholder = input<string>('Select Date');
  dateChange = output<string>();

  isOpen = signal(false);
  viewDate = signal(new Date());
  
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  private eRef = inject(ElementRef);

  formattedDate = computed(() => {
    const val = this.value();
    if (!val) return '';
    const date = typeof val === 'string' ? new Date(val) : val;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  calendarDays = computed(() => {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay();
    const days: { date: Date, isCurrentMonth: boolean }[] = [];
    
    // Previous month filler
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month filler
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  });

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      const val = this.value();
      if (val) this.viewDate.set(typeof val === 'string' ? new Date(val) : val);
    }
  }

  prevMonth() {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  selectDate(date: Date) {
    // Return ISO string or custom format
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    this.dateChange.emit(adjustedDate.toISOString().split('T')[0]);
    this.isOpen.set(false);
  }

  isSelected(date: Date): boolean {
    const val = this.value();
    if (!val) return false;
    const current = typeof val === 'string' ? new Date(val) : val;
    return date.getDate() === current.getDate() && 
           date.getMonth() === current.getMonth() && 
           date.getFullYear() === current.getFullYear();
  }
}
