import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Plus, Check, X, Save } from 'lucide-react';
import { Task } from '@/types';
import { toast } from 'sonner';

interface DailyLogInputProps {
  onProcess: (content: string, tasks: Task[]) => void;
  isProcessing: boolean;
}

const DRAFT_KEY = 'daylog_draft';
const DRAFT_TASKS_KEY = 'daylog_draft_tasks';

export function DailyLogInput({ onProcess, isProcessing }: DailyLogInputProps) {
  // Load draft from localStorage on mount
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved || '';
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(DRAFT_TASKS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, content);
      localStorage.setItem(DRAFT_TASKS_KEY, JSON.stringify(tasks));
      setLastSaved(new Date());
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [content, tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleProcess = () => {
    if (!content.trim() && tasks.length === 0) return;
    onProcess(content, tasks);
    // Clear draft after processing
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_TASKS_KEY);
    setContent('');
    setTasks([]);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_TASKS_KEY);
    setContent('');
    setTasks([]);
    toast.success('Draft cleared');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to process
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isProcessing && (content.trim() || tasks.length > 0)) {
          handleProcess();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [content, tasks, isProcessing]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Auto-save indicator */}
      {(content || tasks.length > 0) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Save className="w-3 h-3" />
            <span>Draft auto-saved</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearDraft} className="h-auto py-1 px-2">
            Clear draft
          </Button>
        </div>
      )}

      {/* Main text area */}
      <Card className="overflow-hidden">
        <div className="p-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your day just as it is — messy, busy, brilliant. Use @client to tag clients...&#10;&#10;💡 Tip: Press Cmd/Ctrl + Enter to process"
            className="w-full min-h-[200px] p-5 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/60 text-base leading-relaxed"
          />
        </div>
      </Card>

      {/* Quick tasks */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Quick Tasks</h3>
        
        <div className="space-y-2 mb-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group animate-slide-in"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.completed 
                    ? 'bg-success border-success' 
                    : 'border-muted-foreground/30 hover:border-primary'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-success-foreground" />}
              </button>
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.text}
              </span>
              <button
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-secondary/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground/50"
          />
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={addTask}
            disabled={!newTaskText.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Process button */}
      <Button 
        variant="hero" 
        size="xl" 
        className="w-full"
        onClick={handleProcess}
        disabled={isProcessing || (!content.trim() && tasks.length === 0)}
      >
        {isProcessing ? (
          <>
            <Sparkles className="w-5 h-5 animate-pulse-soft" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Process My Day
          </>
        )}
      </Button>
    </div>
  );
}
