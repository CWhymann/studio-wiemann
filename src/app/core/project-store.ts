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

  readonly tasks = computed(() => this._tasks().filter((t) => t.project_key === this._activeKey()));

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

  async addTask(title: string, owner: string, due: Weekday) {
    const { data } = await this.supabase.client
      .from('tasks')
      .insert({ title, owner, due, status: 'offen', project_key: this._activeKey() })
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
}
