import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../../core/project-store';
import { STATUSES, DAYS, TaskStatus, Task } from '../../models/task.model';

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
  newOwners = signal<string[]>([]);
  newDueDate: string = new Date().toISOString().split('T')[0];

  query = signal('');
  personFilter = signal<string>('Alle');

  dragId = signal<number | null>(null);
  dragOverCol = signal<TaskStatus | null>(null);

  openStatusMenu = signal<number | null>(null);
  openOwnerMenu = signal(false);

  editingTaskId = signal<number | null>(null);
  eTitle = '';
  eOwners = signal<string[]>([]);
  eDueDate = '';
  openEditOwnerMenu = signal(false);

  constructor(public store: ProjectStore) {}

  filteredTasks() {
    const q = this.query().toLowerCase();
    const pf = this.personFilter();
    return this.store.tasks().filter(
      (t) => t.title.toLowerCase().includes(q) && (pf === 'Alle' || t.owners.includes(pf))
    );
  }

  columnTasks(status: TaskStatus) {
    return this.filteredTasks().filter((t) => t.status === status);
  }

  statusMeta(key: string) {
    return this.statuses.find((s) => s.key === key)!;
  }

  toggleForm() {
    this.showForm.update((s) => !s);
    if (this.showForm() && this.newOwners().length === 0) {
      const first = this.store.people()[0]?.name;
      if (first) this.newOwners.set([first]);
    }
  }

  toggleOwnerMenu() {
    this.openOwnerMenu.update((o) => !o);
  }
  toggleOwnerSelection(name: string) {
    this.newOwners.update((list) =>
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name]
    );
  }

  submitTask() {
    if (!this.newTitle.trim() || this.newOwners().length === 0) return;
    this.store.addTask(this.newTitle.trim(), this.newOwners(), this.newDueDate);
    this.newTitle = '';
    this.newOwners.set([]);
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

  startEditTask(t: Task) {
    this.editingTaskId.set(t.id);
    this.eTitle = t.title;
    this.eOwners.set([...t.owners]);
    this.eDueDate = t.due_date ?? new Date().toISOString().split('T')[0];
  }
  cancelEditTask() {
    this.editingTaskId.set(null);
    this.openEditOwnerMenu.set(false);
  }
  toggleEditOwnerMenu() {
    this.openEditOwnerMenu.update((o) => !o);
  }
  toggleEditOwnerSelection(name: string) {
    this.eOwners.update((list) =>
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name]
    );
  }
  async saveEditTask(id: number) {
    if (this.eOwners().length === 0) return;
    await this.store.updateTask(id, {
      title: this.eTitle.trim(),
      owners: this.eOwners(),
      due_date: this.eDueDate,
    });
    this.editingTaskId.set(null);
  }
}