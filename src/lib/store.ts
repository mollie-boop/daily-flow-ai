import { Client, DailyLog, Task, ProcessedLog } from '@/types';
import { SafeStorage } from './storage';

const STORAGE_KEYS = {
  clients: 'daylog_clients',
  logs: 'daylog_logs',
  tasks: 'daylog_tasks',
};

// Client colors for auto-generated clients
const CLIENT_COLORS = [
  '#4F7CAC', '#6B9080', '#A37B73', '#8B7355', '#7B68EE',
  '#5F9EA0', '#CD853F', '#708090', '#9370DB', '#20B2AA',
];

export function getClients(): Client[] {
  return SafeStorage.get<Client[]>(STORAGE_KEYS.clients, []);
}

export function saveClients(clients: Client[]): boolean {
  return SafeStorage.set(STORAGE_KEYS.clients, clients);
}

export function getOrCreateClient(name: string): Client {
  const clients = getClients();
  const existing = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
  
  if (existing) return existing;
  
  const newClient: Client = {
    id: crypto.randomUUID(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    color: CLIENT_COLORS[clients.length % CLIENT_COLORS.length],
    retainerHours: 0,
    usedHours: 0,
    createdAt: new Date(),
  };
  
  saveClients([...clients, newClient]);
  return newClient;
}

export function getLogs(): DailyLog[] {
  return SafeStorage.get<DailyLog[]>(STORAGE_KEYS.logs, []);
}

export function saveLogs(logs: DailyLog[]): boolean {
  return SafeStorage.set(STORAGE_KEYS.logs, logs);
}

export function saveLog(log: DailyLog): void {
  const logs = getLogs();
  const existingIndex = logs.findIndex(l => l.id === log.id);
  
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.unshift(log);
  }
  
  saveLogs(logs);
}

export function getTasks(): Task[] {
  return SafeStorage.get<Task[]>(STORAGE_KEYS.tasks, []);
}

export function saveTasks(tasks: Task[]): boolean {
  return SafeStorage.set(STORAGE_KEYS.tasks, tasks);
}

export function extractClientsFromText(text: string): string[] {
  const matches = text.match(/@(\w+)/g) || [];
  return [...new Set(matches.map(m => m.slice(1)))];
}

// Mock AI processing - will be replaced with real AI via Lovable Cloud
export function mockProcessLog(content: string, tasks: Task[]): ProcessedLog {
  const clientMentions = extractClientsFromText(content);
  const clients = clientMentions.map(name => getOrCreateClient(name));
  
  // Group content by client
  const clientNotes: Record<string, string[]> = {};
  const lines = content.split('\n').filter(l => l.trim());
  
  lines.forEach(line => {
    const mentioned = extractClientsFromText(line);
    if (mentioned.length > 0) {
      mentioned.forEach(clientName => {
        const client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
        if (client) {
          if (!clientNotes[client.id]) clientNotes[client.id] = [];
          clientNotes[client.id].push(line.replace(/@\w+/g, '').trim());
        }
      });
    }
  });
  
  // Extract tasks from content (lines starting with - or *)
  const extractedTasks: Task[] = lines
    .filter(line => /^[-*•]\s/.test(line.trim()))
    .map(line => ({
      id: crypto.randomUUID(),
      text: line.replace(/^[-*•]\s/, '').trim(),
      completed: false,
      createdAt: new Date(),
    }));
  
  // Combine with existing tasks
  const allTasks = [...tasks, ...extractedTasks];
  
  // Generate summary
  const summary = `Processed ${lines.length} notes, found ${clientMentions.length} client mentions, and ${allTasks.length} tasks.`;
  
  return {
    summary,
    extractedTasks: allTasks,
    clientNotes,
    recognizedClients: clients.map(c => c.name),
  };
}

export function getClientActivity(clientId: string): { tasks: Task[]; notes: string[] } {
  const logs = getLogs();
  const tasks = getTasks().filter(t => t.clientId === clientId);
  const notes: string[] = [];

  logs.forEach(log => {
    if (log.processed) {
      const result = mockProcessLog(log.content, []);
      if (result.clientNotes[clientId]) {
        notes.push(...result.clientNotes[clientId]);
      }
    }
  });

  return { tasks, notes };
}

// Delete functions
export function deleteLog(logId: string): void {
  const logs = getLogs();
  const filteredLogs = logs.filter(log => log.id !== logId);
  saveLogs(filteredLogs);
}

export function deleteClient(clientId: string): void {
  const clients = getClients();
  const filteredClients = clients.filter(client => client.id !== clientId);
  saveClients(filteredClients);

  // Also delete tasks associated with this client
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.clientId !== clientId);
  saveTasks(filteredTasks);
}

// Time estimation functions
export function estimateLogHours(content: string, tasks: Task[]): number {
  // Estimate based on content length and complexity
  const wordCount = content.trim().split(/\s+/).length;
  const contentHours = Math.max(0.5, Math.min(8, wordCount / 200)); // ~200 words per hour of work

  // Add time for tasks (30 min each)
  const taskHours = tasks.length * 0.5;

  // Round to nearest 0.25 hour
  return Math.round((contentHours + taskHours) * 4) / 4;
}

export function updateClientHours(clientId: string, hours: number): void {
  const clients = getClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      return {
        ...client,
        usedHours: (client.usedHours || 0) + hours,
      };
    }
    return client;
  });
  saveClients(updatedClients);
}

export function getClientTimeStatus(client: Client): {
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
} {
  if (!client.retainerHours || client.retainerHours === 0) {
    return { percentage: 0, remaining: 0, status: 'safe' };
  }

  const used = client.usedHours || 0;
  const percentage = (used / client.retainerHours) * 100;
  const remaining = client.retainerHours - used;

  let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= 90) status = 'critical';
  else if (percentage >= 75) status = 'warning';

  return { percentage, remaining, status };
}

// Export all data
export function exportAllData(): string {
  const data = {
    clients: getClients(),
    logs: getLogs(),
    tasks: getTasks(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(data, null, 2);
}

// Import data
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.clients) saveClients(data.clients);
    if (data.logs) saveLogs(data.logs);
    if (data.tasks) saveTasks(data.tasks);

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
