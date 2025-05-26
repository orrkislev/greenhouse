export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  estimatedTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface DaySchedule {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  date: Date;
  tasks: Task[];
  notes?: string;
}

export interface WeeklySchedule {
  id: string;
  userId: string;
  weekStartDate: Date;
  title: string;
  description?: string;
  days: DaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleFormData {
  title: string;
  description?: string;
  weekStartDate: Date;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  estimatedTime?: number;
}

export type AuthUser = User | null;

export interface AuthState {
  user: AuthUser;
  loading: boolean;
  error: string | null;
}
