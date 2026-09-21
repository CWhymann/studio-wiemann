export type TaskStatus = 'offen' | 'laeuft' | 'fertig';
export type Priority = 'normal' | 'wichtig' | 'dringend';

export interface StatusMeta {
  key: TaskStatus;
  label: string;
  dot: string;
}

export const STATUSES: StatusMeta[] = [
  { key: 'offen', label: 'Offen', dot: '#D97706' },
  { key: 'laeuft', label: 'Läuft', dot: '#2563EB' },
  { key: 'fertig', label: 'Fertig', dot: '#16A34A' },
];

export interface PriorityMeta {
  key: Priority;
  label: string;
  color: string;
  weight: number;
}

export const PRIORITIES: PriorityMeta[] = [
  { key: 'dringend', label: 'Dringend', color: '#DC2626', weight: 2 },
  { key: 'wichtig', label: 'Wichtig', color: '#9333EA', weight: 1 },
  { key: 'normal', label: 'Normal', color: '#9CA3AF', weight: 0 },
];

export const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'] as const;
export type Weekday = (typeof DAYS)[number];

export interface Task {
  id: number;
  title: string;
  owners: string[];
  status: TaskStatus;
  due: Weekday;
  due_date: string | null;
  priority: Priority;
  project_key: string;
}

export interface Person {
  id: number;
  project_key: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  color: string;
}

export interface Project {
  key: string;
  name: string;
  color: string;
}
