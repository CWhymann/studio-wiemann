import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../../core/project-store';
import { STATUSES, DAYS, TaskStatus, Task, Priority, PRIORITIES } from '../../models/task.model';
import { DatePicker } from '../date-picker/date-picker';

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  readonly statuses = STATUSES;
  readonly days = DAYS;
  readonly priorities = PRIORITIES;

  showForm = signal(false);
  newTitle = '';
  newOwners = signal<string[]>([]);
  newDueDate: string = new Date().toISOString().split('T')[0];
  newPriority = signal<Priority>('normal');

  query = signal('');
  personFilter = signal<string>('Alle');

  dragId = signal<number | null>(null);
  dragOverCol = signal<TaskStatus | null>(null);
  dragOverTaskId = signal<number | null>(null);

  openStatusMenu = signal<number | null>(null);
  openOwnerMenu = signal(false);
  openPriorityMenu = signal(false);

  editingTaskId = signal<number | null>(null);
  eTitle = '';
  eOwners = signal<string[]>([]);
  eDueDate = '';
  ePriority = signal<Priority>('normal');
  openEditOwnerMenu = signal(false);
  openEditPriorityMenu = signal(false);

  deleteTarget = signal<Task | null>(null);

  constructor(public store: ProjectStore) {}

  filteredTasks() {
    const q = this.query().toLowerCase();
    const pf = this.personFilter();
    return this.store
      .tasks()
      .filter((t) => t.title.toLowerCase().includes(q) && (pf === 'Alle' || t.owners.includes(pf)));
  }

  columnTasks(status: TaskStatus) {
    return this.filteredTasks().filter((t) => t.status === status);
  }

  statusMeta(key: string) {
    return this.statuses.find((s) => s.key === key)!;
  }

  priorityMeta(key: string) {
    return this.priorities.find((p) => p.key === key)!;
  }

  dueDateStatus(dueDate: string | null): 'overdue' | 'today' | 'normal' {
    if (!dueDate) return 'normal';
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) return 'overdue';
    if (dueDate === today) return 'today';
    return 'normal';
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
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name],
    );
  }

  togglePriorityMenu() {
    this.openPriorityMenu.update((o) => !o);
  }
  selectPriority(p: Priority) {
    this.newPriority.set(p);
    this.openPriorityMenu.set(false);
  }

  submitTask() {
    if (!this.newTitle.trim() || this.newOwners().length === 0) return;
    this.store.addTask(this.newTitle.trim(), this.newOwners(), this.newDueDate, this.newPriority());
    this.newTitle = '';
    this.newOwners.set([]);
    this.newPriority.set('normal');
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
    this.dragOverTaskId.set(null);
  }

  onDragOverTask(e: DragEvent, taskId: number) {
    e.preventDefault();
    e.stopPropagation();
    this.dragOverTaskId.set(taskId);
  }
  onDropOnTask(e: DragEvent, status: TaskStatus, targetId: number) {
    e.preventDefault();
    e.stopPropagation();
    const id = this.dragId();
    if (id != null) {
      if (id === targetId) {
        // nichts zu tun
      } else {
        const dragged = this.store.tasks().find((t) => t.id === id);
        if (dragged && dragged.status === status) {
          this.store.reorderTask(id, targetId);
        } else {
          this.store.updateStatus(id, status);
        }
      }
    }
    this.dragId.set(null);
    this.dragOverCol.set(null);
    this.dragOverTaskId.set(null);
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
    this.ePriority.set(t.priority);
  }
  cancelEditTask() {
    this.editingTaskId.set(null);
    this.openEditOwnerMenu.set(false);
    this.openEditPriorityMenu.set(false);
  }
  toggleEditOwnerMenu() {
    this.openEditOwnerMenu.update((o) => !o);
  }
  toggleEditOwnerSelection(name: string) {
    this.eOwners.update((list) =>
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name],
    );
  }
  toggleEditPriorityMenu() {
    this.openEditPriorityMenu.update((o) => !o);
  }
  selectEditPriority(p: Priority) {
    this.ePriority.set(p);
    this.openEditPriorityMenu.set(false);
  }
  async saveEditTask(id: number) {
    if (this.eOwners().length === 0) return;
    await this.store.updateTask(id, {
      title: this.eTitle.trim(),
      owners: this.eOwners(),
      due_date: this.eDueDate,
      priority: this.ePriority(),
    });
    this.editingTaskId.set(null);
  }

  confirmDeleteTask(task: Task) {
    this.deleteTarget.set(task);
  }
  cancelDeleteTask() {
    this.deleteTarget.set(null);
  }
  performDeleteTask() {
    const t = this.deleteTarget();
    if (t) this.store.removeTask(t.id);
    this.deleteTarget.set(null);
  }
}
