import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase';
import { Task, Person, Project, TaskStatus, Weekday } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectStore {
  private readonly _projects = signal<Project[]>([]);
  private readonly _people = signal<Person[]>([]);
  private readonly _tasks = signal<Task[]>([]);
  private readonly _activeKey = signal<string>('');

  readonly projects = this._projects.asReadonly();
  readonly activeKey = this._activeKey.asReadonly();

  readonly activeProject = computed(() =>
    this._projects().find((p) => p.key === this._activeKey()),
  );

  readonly people = computed(() =>
    this._people().filter((p) => p.project_key === this._activeKey()),
  );

  readonly allPeople = computed(() => this._people());

  readonly tasks = computed(() => this._tasks().filter((t) => t.project_key === this._activeKey()));

  readonly avatarColors = computed(() => {
    const map: Record<string, string> = {};
    this._people().forEach((p) => (map[p.name] = p.color || '#9CA3AF'));
    return map;
  });

  constructor(private supabase: SupabaseService) {
    this.loadAll();
  }

  async loadAll() {
    const { data: projects } = await this.supabase.client.from('projects').select('*');
    const { data: people } = await this.supabase.client.from('people').select('*');
    const { data: tasks } = await this.supabase.client.from('tasks').select('*');

    if (projects) {
      this._projects.set(projects as Project[]);
      if (projects.length && !this._activeKey()) {
        this._activeKey.set(projects[0]['key']);
      }
    }
    if (people) this._people.set(people as Person[]);
    if (tasks) this._tasks.set(tasks as Task[]);
  }

  setActiveProject(key: string) {
    this._activeKey.set(key);
  }

  private weekdayFromDate(dateStr: string): Weekday {
    const days: Weekday[] = ['Mo', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Fr'];
    const idx = new Date(dateStr).getDay();
    return days[idx];
  }

  async addTask(title: string, owners: string[], dueDate: string) {
    const weekday = this.weekdayFromDate(dueDate);
    const { data } = await this.supabase.client
      .from('tasks')
      .insert({
        title,
        owners,
        due: weekday,
        due_date: dueDate,
        status: 'offen',
        project_key: this._activeKey(),
      })
      .select();
    if (data) this._tasks.update((prev) => [...prev, ...(data as Task[])]);
  }

  async updateStatus(id: number, status: TaskStatus) {
    await this.supabase.client.from('tasks').update({ status }).eq('id', id);
    this._tasks.update((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  async removeTask(id: number) {
    await this.supabase.client.from('tasks').delete().eq('id', id);
    this._tasks.update((prev) => prev.filter((t) => t.id !== id));
  }

  async updateTask(id: number, changes: { title?: string; owners?: string[]; due_date?: string }) {
    const patch: any = { ...changes };
    if (changes.due_date) {
      patch.due = this.weekdayFromDate(changes.due_date);
    }
    await this.supabase.client.from('tasks').update(patch).eq('id', id);
    this._tasks.update((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async addProject(key: string, name: string) {
    const color = '#1D4ED8';
    const { data } = await this.supabase.client
      .from('projects')
      .insert({ key, name, color })
      .select();
    if (data) {
      this._projects.update((prev) => [...prev, ...(data as Project[])]);
      this._activeKey.set(key);
    }
  }

  async removePerson(id: number) {
    await this.supabase.client.from('people').delete().eq('id', id);
    this._people.update((prev) => prev.filter((p) => p.id !== id));
  }

  async updatePerson(id: number, changes: Partial<Person>) {
    await this.supabase.client.from('people').update(changes).eq('id', id);
    this._people.update((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 55 + Math.random() * 25;
    const lightness = 35 + Math.random() * 15;
    return this.hslToHex(hue, saturation, lightness);
  }

  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number) =>
      Math.round(255 * x)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }
}
