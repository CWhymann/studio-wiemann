export type TaskStatus = 'offen' | 'laeuft' | 'fertig';

export interface StatusMeta {
  key: TaskStatus;
  label: string;
  dot: string;
}

export const STATUSES: StatusMeta[] = [
  { key: 'offen', label: 'Offen', dot: '#B45309' },
  { key: 'laeuft', label: 'Läuft', dot: '#0F766E' },
  { key: 'fertig', label: 'Fertig', dot: '#4D7C0F' },
];

export const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'] as const;
export type Weekday = (typeof DAYS)[number];

export interface Task {
  id: number;
  title: string;
  owner: string;
  status: TaskStatus;
  due: Weekday;
  project_key: string;
}

export interface Person {
  id: number;
  project_key: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Project {
  key: string;
  name: string;
  color: string;
}
