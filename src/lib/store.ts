import { Client, DailyLog, Task, ProcessedLog } from '@/types';

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
  const stored = localStorage.getItem(STORAGE_KEYS.clients);
  return stored ? JSON.parse(stored) : [];
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
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
  const stored = localStorage.getItem(STORAGE_KEYS.logs);
  return stored ? JSON.parse(stored) : [];
}

export function saveLogs(logs: DailyLog[]): void {
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
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
  const stored = localStorage.getItem(STORAGE_KEYS.tasks);
  return stored ? JSON.parse(stored) : [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
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
