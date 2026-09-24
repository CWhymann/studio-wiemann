import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toDateStr } from '../../core/date-utils';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePicker implements OnChanges {
  /** aktueller Wert im Format YYYY-MM-DD */
  @Input() value: string = '';
  /** eindeutiger name-Präfix, falls mehrere Picker gleichzeitig auf der Seite sind */
  @Input() name: string = 'datePicker';
  @Output() valueChange = new EventEmitter<string>();

  readonly weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  open = signal(false);
  viewMonth = signal(new Date());
  inputText = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.inputText = this.displayValue();
    }
  }

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

  /** Wird bei jedem Tastenanschlag im Textfeld aufgerufen */
  onManualInput(text: string) {
    this.inputText = text;
  }

  /** Wird beim Verlassen des Feldes (blur) oder Enter aufgerufen */
  commitManualInput() {
    const match = this.inputText.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) {
      this.inputText = this.displayValue();
      return;
    }
    const [, day, month, year] = match;
    const iso = `${year}-${month}-${day}`;
    const parsed = new Date(iso);
    const todayStr = toDateStr(new Date());

    const isValidDate =
      !isNaN(parsed.getTime()) &&
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() + 1 === Number(month) &&
      parsed.getDate() === Number(day);

    if (!isValidDate || iso < todayStr) {
      this.inputText = this.displayValue();
      return;
    }

    this.value = iso;
    this.inputText = this.displayValue();
    this.valueChange.emit(iso);
  }

  onEnter(e: Event) {
    (e.target as HTMLInputElement).blur();
  }

  days(): CalendarDay[] {
    const view = this.viewMonth();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Woche beginnt Montag: JS getDay() 0=So..6=Sa -> Offset auf Montag=0 umrechnen
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);

    const todayStr = toDateStr(new Date());

    const result: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = toDateStr(d);
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
    this.inputText = this.displayValue();
    this.valueChange.emit(day.date);
    this.open.set(false);
  }
}
