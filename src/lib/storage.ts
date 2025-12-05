// Enhanced storage layer with versioning and migration support

import { Client, DailyLog, Task } from '@/types';

const CURRENT_VERSION = 2;
const VERSION_KEY = 'daylog_version';

interface StorageData {
  version: number;
  clients: Client[];
  logs: DailyLog[];
  tasks: Task[];
  migratedAt?: string;
}

// Migration functions
const migrations: Record<number, (data: any) => any> = {
  1: (data: any) => {
    // Migration from version 0 (initial) to version 1
    // Add any missing fields to existing data
    return {
      ...data,
      version: 1,
      clients: data.clients?.map((c: any) => ({
        ...c,
        retainerHours: c.retainerHours || 0,
        usedHours: c.usedHours || 0,
      })) || [],
    };
  },
  2: (data: any) => {
    // Migration from version 1 to version 2
    // Add new fields for task priority and time tracking
    return {
      ...data,
      version: 2,
      tasks: data.tasks?.map((t: any) => ({
        ...t,
        priority: t.priority || undefined,
        status: t.status || undefined,
        dueDate: t.dueDate || undefined,
        billable: t.billable || undefined,
      })) || [],
      logs: data.logs?.map((l: any) => ({
        ...l,
        estimatedHours: l.estimatedHours || undefined,
        actualHours: l.actualHours || undefined,
      })) || [],
      migratedAt: new Date().toISOString(),
    };
  },
};

// Get current storage version
export function getStorageVersion(): number {
  const version = localStorage.getItem(VERSION_KEY);
  return version ? parseInt(version, 10) : 0;
}

// Set storage version
export function setStorageVersion(version: number): void {
  localStorage.setItem(VERSION_KEY, version.toString());
}

// Run migrations if needed
export function runMigrations(): boolean {
  const currentVersion = getStorageVersion();

  if (currentVersion >= CURRENT_VERSION) {
    return false; // No migration needed
  }

  console.log(`Running migrations from version ${currentVersion} to ${CURRENT_VERSION}`);

  try {
    // Load all data
    let data: any = {
      version: currentVersion,
      clients: JSON.parse(localStorage.getItem('daylog_clients') || '[]'),
      logs: JSON.parse(localStorage.getItem('daylog_logs') || '[]'),
      tasks: JSON.parse(localStorage.getItem('daylog_tasks') || '[]'),
    };

    // Run each migration in sequence
    for (let v = currentVersion + 1; v <= CURRENT_VERSION; v++) {
      if (migrations[v]) {
        console.log(`Applying migration to version ${v}`);
        data = migrations[v](data);
      }
    }

    // Save migrated data
    localStorage.setItem('daylog_clients', JSON.stringify(data.clients));
    localStorage.setItem('daylog_logs', JSON.stringify(data.logs));
    localStorage.setItem('daylog_tasks', JSON.stringify(data.tasks));
    setStorageVersion(CURRENT_VERSION);

    console.log('Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Safe JSON parse with error handling
export function safeJSONParse<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
}

// Safe localStorage operations with error handling
export class SafeStorage {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      return safeJSONParse(value, defaultValue);
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  static set(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} in localStorage:`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Consider cleaning up old data.');
      }
      return false;
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // LocalStorage limit is typically 5-10MB
      const available = 10 * 1024 * 1024; // Assume 10MB
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Initialize storage and run migrations on app start
export function initializeStorage(): void {
  runMigrations();
}
