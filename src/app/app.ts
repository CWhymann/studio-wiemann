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
  projectMenuOpen = signal(false);
  showNewProjectForm = signal(false);
  newProjectName = '';

  constructor(public store: ProjectStore) {}

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
}
