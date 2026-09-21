export type TaskStatus = 'offen' | 'laeuft' | 'fertig';

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

export const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'] as const;
export type Weekday = (typeof DAYS)[number];

export interface Task {
  id: number;
  title: string;
  owners: string[];
  status: TaskStatus;
  due: Weekday;
  due_date: string | null;
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
