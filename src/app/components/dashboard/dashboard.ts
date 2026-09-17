import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStore } from '../../core/project-store';
import { STATUSES, DAYS } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly statuses = STATUSES;
  readonly days = DAYS;

  constructor(public store: ProjectStore) {}

  count(statusKey: string) {
    return this.store.tasks().filter((t) => t.status === statusKey).length;
  }

  pct(statusKey: string) {
    const total = this.store.tasks().length;
    return total ? Math.round((this.count(statusKey) / total) * 100) : 0;
  }

  perPerson = computed(() =>
    this.store.people().map((p) => {
      const own = this.store.tasks().filter((t) => t.owner === p.name);
      return { name: p.name, total: own.length };
    }),
  );

  openCountForDay(day: string) {
    return this.store.tasks().filter((t) => t.due === day && t.status !== 'fertig').length;
  }
}
