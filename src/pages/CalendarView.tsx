import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getLogs, getClients, deleteLog, saveLog, estimateLogHours } from '@/lib/store';
import { DailyLog, Task } from '@/types';
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState(getLogs());
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTasks, setEditTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const clients = getClients();

  // Refresh logs
  const refreshLogs = () => {
    setLogs(getLogs());
  };

  // Get all logs for selected date (support multiple logs per day)
  const selectedLogs = logs.filter(log => isSameDay(new Date(log.date), selectedDate));
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Reset edit mode when date changes
  useEffect(() => {
    setIsEditing(false);
    setEditContent('');
    setEditTasks([]);
    setNewTaskText('');
    setEditingLogId(null);
  }, [selectedDate]);

  // Handle delete log
  const handleDeleteLog = (logId: string) => {
    deleteLog(logId);
    refreshLogs();
    toast.success('Log deleted successfully');
  };

  // Start editing or creating new log
  const handleStartEdit = (logId?: string) => {
    if (logId) {
      const log = selectedLogs.find(l => l.id === logId);
      if (log) {
        setEditContent(log.content);
        setEditTasks(log.tasks || []);
        setEditingLogId(logId);
      }
    } else {
      setEditContent('');
      setEditTasks([]);
      setEditingLogId(null);
    }
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    setEditTasks([]);
    setNewTaskText('');
    setEditingLogId(null);
  };

  // Save log
  const handleSaveLog = () => {
    if (!editContent.trim()) {
      toast.error('Please add some content to your log');
      return;
    }

    const estimatedHours = estimateLogHours(editContent, editTasks);
    const existingLog = editingLogId ? selectedLogs.find(l => l.id === editingLogId) : null;

    const logToSave: DailyLog = {
      id: editingLogId || crypto.randomUUID(),
      date: selectedDate,
      content: editContent,
      tasks: editTasks,
      processed: true,
      createdAt: existingLog?.createdAt || new Date(),
      estimatedHours,
    };

    saveLog(logToSave);
    refreshLogs();
    setIsEditing(false);
    setEditingLogId(null);
    toast.success(editingLogId ? 'Log updated successfully' : 'Log created successfully');
  };

  // Add task
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: new Date(),
    };

    setEditTasks([...editTasks, newTask]);
    setNewTaskText('');
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    setEditTasks(editTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Remove task
  const handleRemoveTask = (taskId: string) => {
    setEditTasks(editTasks.filter(task => task.id !== taskId));
  };

  // Get dates that have logs
  const datesWithLogs = logs.map(log => new Date(log.date));

  // Helper to check if a date has a log
  const hasLog = (date: Date) => {
    return datesWithLogs.some(logDate => isSameDay(logDate, date));
  };

  // Get client color by name
  const getClientColor = (clientName: string) => {
    const client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    return client?.color || '#6B9080';
  };

  // Extract client mentions from text
  const extractClients = (text: string) => {
    const matches = text.match(/@(\w+)/g) || [];
    return [...new Set(matches.map(m => m.slice(1)))];
  };

  const today = new Date();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  // Get logs for current month
  const monthLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= monthStart && logDate <= monthEnd;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Calendar View</h1>
          <p className="text-muted-foreground">View your daily logs in a calendar format</p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Your Logs</CardTitle>
              <CardDescription>
                {monthLogs.length} log{monthLogs.length !== 1 ? 's' : ''} this month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  hasLog: datesWithLogs,
                }}
                modifiersStyles={{
                  hasLog: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    textDecorationColor: 'hsl(var(--primary))',
                  },
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Selected date details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? (editingLogId ? 'Editing log' : 'Creating new log')
                      : (selectedLogs.length === 0 ? 'No logs for this day' : `${selectedLogs.length} log${selectedLogs.length !== 1 ? 's' : ''}`)}
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="default" size="sm" onClick={() => handleStartEdit()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {selectedLogs.length === 0 ? 'Create Log' : 'Add Another Log'}
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={handleSaveLog}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {/* Content editor */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                      Log Content
                    </h3>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Write your daily log here... Use @client to mention clients."
                      className="min-h-[200px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tip: Use @clientname to mention clients
                    </p>
                  </div>

                  {/* Task editor */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                      Tasks ({editTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {editTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2 rounded-md border">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggleTask(task.id)}
                          />
                          <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.text}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTask(task.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder="Add a task..."
                        className="flex-1"
                      />
                      <Button onClick={handleAddTask} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : selectedLogs.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {selectedLogs.map((log, index) => (
                      <Card key={log.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                Log #{index + 1}
                                {log.estimatedHours && (
                                  <Badge variant="secondary" className="ml-2">
                                    {log.estimatedHours}h
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {format(new Date(log.createdAt), 'h:mm a')}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleStartEdit(log.id)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Log</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this log? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteLog(log.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Client mentions */}
                          {extractClients(log.content).length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground">
                                Clients
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {extractClients(log.content).map(clientName => (
                                  <Badge
                                    key={clientName}
                                    style={{
                                      backgroundColor: getClientColor(clientName),
                                      color: 'white',
                                    }}
                                    className="text-xs"
                                  >
                                    {clientName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tasks */}
                          {log.tasks.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground">
                                Tasks ({log.tasks.length})
                              </h4>
                              <ul className="space-y-1">
                                {log.tasks.map(task => (
                                  <li key={task.id} className="flex items-start gap-2 text-sm">
                                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                      {task.completed ? '✓' : '○'} {task.text}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Log content */}
                          <div>
                            <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground">
                              Content
                            </h4>
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{log.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No logs recorded for this day.
                  </p>
                  <Button className="mt-4" onClick={() => handleStartEdit()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Log for This Day
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
