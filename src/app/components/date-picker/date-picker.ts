import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarDay {
  date: string;
  day: number;
  isPast: boolean;
  isToday: boolean;
  inMonth: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePicker {
  /** aktueller Wert im Format YYYY-MM-DD */
  @Input() value: string = '';
  /** eindeutiger name-Präfix, falls mehrere Picker gleichzeitig auf der Seite sind */
  @Input() name: string = 'datePicker';
  @Output() valueChange = new EventEmitter<string>();

  readonly weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  open = signal(false);
  viewMonth = signal(new Date());

  toggle() {
    this.open.update((o) => !o);
    if (this.open()) {
      this.viewMonth.set(this.value ? new Date(this.value) : new Date());
    }
  }

  close() {
    this.open.set(false);
  }

  prevMonth() {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() - 1);
    this.viewMonth.set(d);
  }

  nextMonth() {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() + 1);
    this.viewMonth.set(d);
  }

  monthLabel(): string {
    return this.viewMonth().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }

  displayValue(): string {
    if (!this.value) return '';
    const d = new Date(this.value);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  days(): CalendarDay[] {
    const view = this.viewMonth();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Woche beginnt Montag: JS getDay() 0=So..6=Sa -> Offset auf Montag=0 umrechnen
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);

    const todayStr = this.toDateStr(new Date());

    const result: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = this.toDateStr(d);
      result.push({
        date: dateStr,
        day: d.getDate(),
        isPast: dateStr < todayStr,
        isToday: dateStr === todayStr,
        inMonth: d.getMonth() === month,
      });
    }
    return result;
  }

  select(day: CalendarDay) {
    if (day.isPast) return;
    this.value = day.date;
    this.valueChange.emit(day.date);
    this.open.set(false);
  }

  private toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
