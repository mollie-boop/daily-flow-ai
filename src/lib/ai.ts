import OpenAI from 'openai';
import { Task, ProcessedLog } from '@/types';
import { getOrCreateClient } from './store';

// Initialize OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through a backend
}) : null;

/**
 * Process a daily log using OpenAI GPT
 * Extracts clients, tasks, and generates intelligent summaries
 */
export async function processLogWithAI(content: string, existingTasks: Task[]): Promise<ProcessedLog> {
  // If no API key, fall back to mock processing
  if (!openai) {
    console.warn('OpenAI API key not configured. Using mock processing.');
    return mockProcessLog(content, existingTasks);
  }

  try {
    const prompt = `You are an AI assistant helping a freelancer organize their daily work log.

Analyze the following daily log and extract:
1. **Client/Company names** - Look for proper nouns that represent clients, companies, teams, or projects (e.g., "Acme", "TechCorp", "BlueSky Digital", "Google", etc.). Extract ALL company/client names mentioned, even if not tagged with @.
2. **Tasks** - Extract all action items, todos, and completed work as separate task items
3. **Summary** - Brief overview of the day's work

Daily Log:
"""
${content}
"""

IMPORTANT: Always include ALL client/company names found in the text in the "clients" array. Look for capitalized proper nouns that represent businesses or organizations.

Respond in JSON format:
{
  "clients": ["client1", "client2", "client3"],
  "tasks": ["task1", "task2"],
  "summary": "Brief summary of the day's work",
  "clientNotes": {
    "client1": ["note about client1 work"],
    "client2": ["note about client2 work"]
  }
}

Example:
Input: "Had a call with Acme Corp about their website. Working on TechCorp mobile app."
Output: {
  "clients": ["Acme Corp", "TechCorp"],
  "tasks": ["Call with Acme Corp about website", "Work on TechCorp mobile app"],
  "summary": "Client calls and mobile development work"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes freelancer work logs. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Create or get clients
    const clients = result.clients?.map((name: string) => getOrCreateClient(name)) || [];

    // Convert extracted tasks to Task objects
    const extractedTasks: Task[] = result.tasks?.map((taskText: string) => ({
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
      createdAt: new Date(),
    })) || [];

    // Combine with existing tasks
    const allTasks = [...existingTasks, ...extractedTasks];

    // Build client notes mapping
    const clientNotes: Record<string, string[]> = {};
    clients.forEach(client => {
      const notes = result.clientNotes?.[client.name] || [];
      if (notes.length > 0) {
        clientNotes[client.id] = notes;
      }
    });

    return {
      summary: result.summary || 'Processed daily log',
      extractedTasks: allTasks,
      clientNotes,
      recognizedClients: clients.map(c => c.name),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fall back to mock processing on error
    return mockProcessLog(content, existingTasks);
  }
}

/**
 * Mock processing function (used as fallback when AI is not available)
 */
function mockProcessLog(content: string, existingTasks: Task[]): ProcessedLog {
  // Extract @mentions
  const clientMentions = content.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
  const uniqueClients = [...new Set(clientMentions)];
  const clients = uniqueClients.map(name => getOrCreateClient(name));

  // Group content by client
  const clientNotes: Record<string, string[]> = {};
  const lines = content.split('\n').filter(l => l.trim());

  lines.forEach(line => {
    const mentioned = line.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
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

  // Extract tasks from content (lines starting with - or * or •)
  const extractedTasks: Task[] = lines
    .filter(line => /^[-*•]\s/.test(line.trim()))
    .map(line => ({
      id: crypto.randomUUID(),
      text: line.replace(/^[-*•]\s/, '').trim(),
      completed: false,
      createdAt: new Date(),
    }));

  // Combine with existing tasks
  const allTasks = [...existingTasks, ...extractedTasks];

  // Generate summary
  const summary = `Processed ${lines.length} notes, found ${uniqueClients.length} client mentions, and ${allTasks.length} tasks.`;

  return {
    summary,
    extractedTasks: allTasks,
    clientNotes,
    recognizedClients: clients.map(c => c.name),
  };
}

/**
 * Check if OpenAI is configured
 */
export function isAIEnabled(): boolean {
  return openai !== null;
}
