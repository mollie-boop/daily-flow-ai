export interface Task {
  id: string;
  text: string;
  completed: boolean;
  clientId?: string;
  createdAt: Date;
}

export interface DailyLog {
  id: string;
  date: Date;
  content: string;
  tasks: Task[];
  processed: boolean;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  color: string;
  retainerHours?: number;
  usedHours?: number;
  createdAt: Date;
}

export interface ProcessedLog {
  summary: string;
  extractedTasks: Task[];
  clientNotes: Record<string, string[]>;
  recognizedClients: string[];
}

export interface ClientActivity {
  date: Date;
  type: 'task' | 'note' | 'log';
  content: string;
}

export interface MonthlyReport {
  clientId: string;
  clientName: string;
  period: { start: Date; end: Date };
  summary: string;
  tasksCompleted: Task[];
  highlights: string[];
  generatedAt: Date;
}
