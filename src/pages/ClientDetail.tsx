import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Client, Task } from '@/types';
import { getClients, getClientActivity, saveTasks, getTasks } from '@/lib/store';
import { ArrowLeft, CheckCircle2, Circle, FileText, Clock } from 'lucide-react';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    const clients = getClients();
    const found = clients.find(c => c.id === id);
    setClient(found || null);
    
    if (found) {
      const activity = getClientActivity(found.id);
      setTasks(activity.tasks);
      setNotes(activity.notes);
    }
  }, [id]);

  const toggleTask = (taskId: string) => {
    const allTasks = getTasks();
    const updated = allTasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
    setTasks(updated.filter(t => t.clientId === id));
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  const retainerProgress = client.retainerHours 
    ? Math.min(100, ((client.usedHours || 0) / client.retainerHours) * 100)
    : 0;

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/clients')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          
          <div className="flex items-center gap-3">
            <span 
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: client.color }}
            />
            <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          </div>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Main content */}
        <main className="space-y-6 animate-fade-in">
          {/* Retainer Progress */}
          {client.retainerHours && client.retainerHours > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4" />
                  Retainer Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={retainerProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {client.usedHours || 0} of {client.retainerHours} hours used
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Tasks ({completedCount}/{tasks.length} completed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li 
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Notes ({notes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((note, idx) => (
                    <li 
                      key={idx}
                      className="text-sm p-3 rounded-lg bg-secondary/50"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ClientDetail;
