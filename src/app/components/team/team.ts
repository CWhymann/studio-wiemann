import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../../core/project-store';
import { SupabaseService } from '../../core/supabase';
import { Person } from '../../models/task.model';

@Component({
  selector: 'app-team',
  imports: [CommonModule, FormsModule],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class Team {
  showForm = signal(false);
  pName = '';
  pRole = '';
  pEmail = '';
  pPhone = '';

  constructor(
    public store: ProjectStore,
    private supabase: SupabaseService,
  ) {}

  toggleForm() {
    this.showForm.update((s) => !s);
  }

  async submit() {
    if (!this.pName.trim()) return;
    const { data } = await this.supabase.client
      .from('people')
      .insert({
        project_key: this.store.activeKey(),
        name: this.pName.trim(),
        role: this.pRole.trim() || 'Mitarbeiter:in',
        email: this.pEmail.trim(),
        phone: this.pPhone.trim(),
      })
      .select();
    if (data) {
      await this.store.loadAll();
    }
    this.pName = '';
    this.pRole = '';
    this.pEmail = '';
    this.pPhone = '';
    this.showForm.set(false);
  }
}
