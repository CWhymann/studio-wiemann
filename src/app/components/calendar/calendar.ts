import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStore } from '../../core/project-store';
import { STATUSES, DAYS } from '../../models/task.model';
import { getMonday, getISOWeek, formatDayMonth, isToday } from '../../core/date-utils';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  readonly days = DAYS;
  readonly formatDayMonth = formatDayMonth;
  readonly isToday = isToday;
  readonly statuses = STATUSES;

  weekOffset = signal(0);

  private datesForOffset(offset: number) {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + offset * 7);
    return [0, 1, 2, 3, 4].map((i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  weekDates = computed(() => this.datesForOffset(this.weekOffset()));
  nextWeekDates = computed(() => this.datesForOffset(this.weekOffset() + 1));

  weekNumber = computed(() => getISOWeek(this.weekDates()[0]));
  nextWeekNumber = computed(() => getISOWeek(this.nextWeekDates()[0]));

  jumpToDate(dateStr: string) {
    if (!dateStr) return;
    const target = new Date(dateStr);
    const targetMonday = getMonday(target);
    const currentMonday = getMonday(new Date());
    const diffWeeks = Math.round(
      (targetMonday.getTime() - currentMonday.getTime()) / (7 * 86400000),
    );
    this.weekOffset.set(diffWeeks);
  }

  constructor(public store: ProjectStore) {}

  prevWeek() {
    this.weekOffset.update((w) => w - 1);
  }
  nextWeek() {
    this.weekOffset.update((w) => w + 1);
  }
  thisWeek() {
    this.weekOffset.set(0);
  }

  tasksForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.store.tasks().filter((t) => t.due_date === dateStr);
  }

  statusMeta(key: string) {
    return this.statuses.find((s) => s.key === key)!;
  }
}
