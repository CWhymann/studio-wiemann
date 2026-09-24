import { Component, signal } from '@angular/core';
import { ProjectStore } from './core/project-store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board } from './components/board/board';
import { Team } from './components/team/team';
import { Calendar } from './components/calendar/calendar';
import { Dashboard } from './components/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Board, Team, Calendar, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  view = signal<'board' | 'team' | 'kalender' | 'dashboard'>('board');
  mobileMenuOpen = signal(false);
  readonly tabs = [
    { key: 'board', label: 'Board' },
    { key: 'team', label: 'Team' },
    { key: 'kalender', label: 'Kalender' },
    { key: 'dashboard', label: 'Dashboard' },
  ] as const;
  projectMenuOpen = signal(false);
  showNewProjectForm = signal(false);
  newProjectName = '';

  editingProjectKey = signal<string | null>(null);
  eProjectName = '';

  deleteProjectTarget = signal<{ key: string; name: string } | null>(null);

  constructor(public store: ProjectStore) {}

  currentLabel() {
    return this.tabs.find((t) => t.key === this.view())!.label;
  }

  toggleProjectMenu() {
    this.projectMenuOpen.update((o) => !o);
  }

  switchProject(key: string) {
    this.store.setActiveProject(key);
    this.projectMenuOpen.set(false);
  }

  async createProject() {
    if (!this.newProjectName.trim()) return;
    const key = this.newProjectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    await this.store.addProject(key, this.newProjectName.trim());
    this.newProjectName = '';
    this.showNewProjectForm.set(false);
  }

  startEditProject(key: string, name: string, e: Event) {
    e.stopPropagation();
    this.editingProjectKey.set(key);
    this.eProjectName = name;
  }
  cancelEditProject(e?: Event) {
    e?.stopPropagation();
    this.editingProjectKey.set(null);
  }
  async saveEditProject(key: string, e: Event) {
    e.stopPropagation();
    if (!this.eProjectName.trim()) return;
    await this.store.renameProject(key, this.eProjectName.trim());
    this.editingProjectKey.set(null);
  }

  confirmDeleteProject(key: string, name: string, e: Event) {
    e.stopPropagation();
    this.deleteProjectTarget.set({ key, name });
  }
  cancelDeleteProject() {
    this.deleteProjectTarget.set(null);
  }
  async performDeleteProject() {
    const t = this.deleteProjectTarget();
    if (t) await this.store.removeProject(t.key);
    this.deleteProjectTarget.set(null);
    this.projectMenuOpen.set(false);
  }
}
