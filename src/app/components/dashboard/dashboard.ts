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
      const own = this.store.tasks().filter((t) => t.owners.includes(p.name));
      return { name: p.name, total: own.length, color: this.store.avatarColors()[p.name] };
    }),
  );

  maxPersonTotal = computed(() => Math.max(1, ...this.perPerson().map((p) => p.total)));

  statusConicGradient = computed(() => {
    const total = this.store.tasks().length;
    if (!total) return 'conic-gradient(#E5E7EB 0deg 360deg)';
    let acc = 0;
    const stops: string[] = [];
    for (const s of this.statuses) {
      const c = this.count(s.key);
      if (!c) continue;
      const start = (acc / total) * 360;
      acc += c;
      const end = (acc / total) * 360;
      stops.push(`${s.dot} ${start}deg ${end}deg`);
    }
    return `conic-gradient(${stops.join(', ')})`;
  });

  openCountForDay(day: string) {
    return this.store.tasks().filter((t) => t.due === day && t.status !== 'fertig').length;
  }
}
