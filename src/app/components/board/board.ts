import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../../core/project-store';
import { STATUSES, DAYS, TaskStatus, Weekday } from '../../models/task.model';

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  readonly statuses = STATUSES;
  readonly days = DAYS;

  showForm = signal(false);
  newTitle = '';
  newOwner = '';
  newDue: Weekday = 'Mo';

  constructor(public store: ProjectStore) {}

  columnTasks(status: TaskStatus) {
    return this.store.tasks().filter((t) => t.status === status);
  }

  toggleForm() {
    this.showForm.update((s) => !s);
    if (this.showForm() && !this.newOwner) {
      this.newOwner = this.store.people()[0]?.name ?? '';
    }
  }

  submitTask() {
    if (!this.newTitle.trim()) return;
    this.store.addTask(this.newTitle.trim(), this.newOwner, this.newDue);
    this.newTitle = '';
    this.showForm.set(false);
  }
}
