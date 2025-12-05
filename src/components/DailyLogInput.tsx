import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Plus, Check, X } from 'lucide-react';
import { Task } from '@/types';

interface DailyLogInputProps {
  onProcess: (content: string, tasks: Task[]) => void;
  isProcessing: boolean;
}

export function DailyLogInput({ onProcess, isProcessing }: DailyLogInputProps) {
  const [content, setContent] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main text area */}
      <Card className="overflow-hidden">
        <div className="p-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your day just as it is — messy, busy, brilliant. Use @client to tag clients..."
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
