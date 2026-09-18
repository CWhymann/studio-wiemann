import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../../core/project-store';
import { SupabaseService } from '../../core/supabase';
import { Person } from '../../models/task.model';

const ROLES = ['Project Lead', 'Team Member', 'Design', 'Development', 'Other'];

@Component({
  selector: 'app-team',
  imports: [CommonModule, FormsModule],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class Team {
  readonly roles = ROLES;

  showForm = signal(false);
  pName = signal('');
  pRole = '';
  pEmail = '';
  pPhone = '';
  openRoleMenu = signal(false);
  nameSuggestionsOpen = signal(false);
  pickedExisting = false;

  editingId = signal<number | null>(null);
  eName = '';
  eRole = '';
  eEmail = '';
  ePhone = '';
  openEditRoleMenu = signal(false);

  constructor(
    public store: ProjectStore,
    private supabase: SupabaseService,
  ) {}

  nameSuggestions = computed(() => {
    const q = this.pName().trim().toLowerCase();
    if (!q) return [];
    const activeNames = new Set(this.store.people().map((p) => p.name));
    const seen = new Set<string>();
    return this.store
      .allPeople()
      .filter((p) => p.name.toLowerCase().includes(q) && !activeNames.has(p.name))
      .filter((p) => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
      })
      .slice(0, 6);
  });

  onNameInput(value: string) {
    this.pName.set(value);
    this.pickedExisting = false;
    this.nameSuggestionsOpen.set(value.trim().length > 0);
  }

  pickSuggestion(p: Person) {
    this.pName.set(p.name);
    this.pRole = p.role;
    this.pEmail = p.email;
    this.pPhone = p.phone;
    this.pickedExisting = true;
    this.nameSuggestionsOpen.set(false);
  }

  toggleForm() {
    this.showForm.update((s) => !s);
  }

  toggleRoleMenu() {
    this.openRoleMenu.update((o) => !o);
  }
  selectRole(role: string) {
    this.pRole = role;
    this.openRoleMenu.set(false);
  }

  toggleEditRoleMenu() {
    this.openEditRoleMenu.update((o) => !o);
  }
  selectEditRole(role: string) {
    this.eRole = role;
    this.openEditRoleMenu.set(false);
  }

  async submit() {
    const name = this.pName().trim();
    if (!name) return;

    const existing = this.store.allPeople().find((p) => p.name === name);
    const color =
      this.pickedExisting && existing ? existing.color : this.store.generateRandomColor();

    const { data } = await this.supabase.client
      .from('people')
      .insert({
        project_key: this.store.activeKey(),
        name,
        role: this.pRole.trim() || 'Team Member',
        email: this.pEmail.trim(),
        phone: this.pPhone.trim(),
        color,
      })
      .select();
    if (data) {
      await this.store.loadAll();
    }
    this.pName.set('');
    this.pRole = '';
    this.pEmail = '';
    this.pPhone = '';
    this.pickedExisting = false;
    this.showForm.set(false);
  }

  startEdit(p: Person) {
    this.editingId.set(p.id);
    this.eName = p.name;
    this.eRole = p.role;
    this.eEmail = p.email;
    this.ePhone = p.phone;
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  async saveEdit(id: number) {
    await this.store.updatePerson(id, {
      name: this.eName.trim(),
      role: this.eRole.trim(),
      email: this.eEmail.trim(),
      phone: this.ePhone.trim(),
    });
    this.editingId.set(null);
  }

  removePerson(id: number) {
    this.store.removePerson(id);
  }
}
