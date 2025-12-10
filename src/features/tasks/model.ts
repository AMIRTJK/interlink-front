import type { Dayjs } from 'dayjs';

export interface TaskFormValues {
  title: string;
  date?: Dayjs;
  time?: Dayjs;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  category?: 'work' | 'personal' | 'important' | 'meeting';
  participants?: Participant[];
}
