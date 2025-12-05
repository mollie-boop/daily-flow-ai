export interface Task {
  id: string;
  text: string;
  completed: boolean;
  clientId?: string;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: Date;
  billable?: boolean;
}

export interface DailyLog {
  id: string;
  date: Date;
  content: string;
  tasks: Task[];
  processed: boolean;
  createdAt: Date;
  estimatedHours?: number;
  actualHours?: number;
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
