import { Component, signal } from '@angular/core';
import { ProjectStore } from './core/project-store';
import { CommonModule } from '@angular/common';
import { Board } from './components/board/board';
import { Team } from './components/team/team';
import { Calendar } from './components/calendar/calendar';
import { Dashboard } from './components/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Board, Team, Calendar, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  view = signal<'board' | 'team' | 'kalender' | 'dashboard'>('board');

  constructor(public store: ProjectStore) {}
}
