import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStore } from '../../core/project-store';
import { STATUSES, DAYS } from '../../models/task.model';
import { currentWeekDates, getISOWeek, formatDayMonth, isToday } from '../../core/date-utils';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  readonly days = DAYS;
  readonly weekDates = currentWeekDates();
  readonly weekNumber = getISOWeek(new Date());
  readonly formatDayMonth = formatDayMonth;
  readonly isToday = isToday;
  readonly statuses = STATUSES;

  constructor(public store: ProjectStore) {}

  tasksForDay(day: string) {
    return this.store.tasks().filter((t) => t.due === day);
  }

  statusMeta(key: string) {
    return this.statuses.find((s) => s.key === key)!;
  }
}
