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
  newDueDate: string = new Date().toISOString().split('T')[0];

  query = signal('');
  personFilter = signal<string>('Alle');

  dragId = signal<number | null>(null);
  dragOverCol = signal<TaskStatus | null>(null);

  openStatusMenu = signal<number | null>(null);
  openOwnerMenu = signal(false);

  constructor(public store: ProjectStore) {}

  filteredTasks() {
    const q = this.query().toLowerCase();
    const pf = this.personFilter();
    return this.store
      .tasks()
      .filter((t) => t.title.toLowerCase().includes(q) && (pf === 'Alle' || t.owner === pf));
  }

  columnTasks(status: TaskStatus) {
    return this.filteredTasks().filter((t) => t.status === status);
  }

  statusMeta(key: string) {
    return this.statuses.find((s) => s.key === key)!;
  }

  toggleForm() {
    this.showForm.update((s) => !s);
    if (this.showForm() && !this.newOwner) {
      this.newOwner = this.store.people()[0]?.name ?? '';
    }
  }

  toggleOwnerMenu() {
    this.openOwnerMenu.update((o) => !o);
  }

  selectOwner(name: string) {
    this.newOwner = name;
    this.openOwnerMenu.set(false);
  }

  submitTask() {
    if (!this.newTitle.trim()) return;
    this.store.addTask(this.newTitle.trim(), this.newOwner, this.newDueDate);
    this.newTitle = '';
    this.showForm.set(false);
  }

  onDragStart(id: number) {
    this.dragId.set(id);
  }
  onDragEnd() {
    this.dragId.set(null);
  }
  onDragOver(e: DragEvent, status: TaskStatus) {
    e.preventDefault();
    this.dragOverCol.set(status);
  }
  onDragLeave() {
    this.dragOverCol.set(null);
  }
  onDrop(status: TaskStatus) {
    const id = this.dragId();
    if (id != null) this.store.updateStatus(id, status);
    this.dragId.set(null);
    this.dragOverCol.set(null);
  }

  toggleStatusMenu(taskId: number) {
    this.openStatusMenu.update((id) => (id === taskId ? null : taskId));
  }

  selectStatus(taskId: number, status: TaskStatus) {
    this.store.updateStatus(taskId, status);
    this.openStatusMenu.set(null);
  }
}
