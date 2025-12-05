import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Client, MonthlyReport } from '@/types';
import { getClients, getClientActivity, getLogs } from '@/lib/store';
import { FileBarChart, Copy, Check, Sparkles, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const Reports = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [editedReport, setEditedReport] = useState('');
  const [copied, setCopied] = useState(false);

  // Date range
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Hours tracking
  const [estimatedHours, setEstimatedHours] = useState(0);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const generateReport = async () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);

    // Get all logs for this client within date range
    const allLogs = getLogs();
    const clientLogs = allLogs.filter(log => {
      const logDate = new Date(log.date);
      return log.content.toLowerCase().includes(`@${client.name.toLowerCase()}`) &&
             isWithinInterval(logDate, { start: periodStart, end: periodEnd });
    });

    // Get client activity
    const activity = getClientActivity(selectedClient);

    // Filter tasks within date range
    const tasksInRange = activity.tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return isWithinInterval(taskDate, { start: periodStart, end: periodEnd });
    });
    const completedTasks = tasksInRange.filter(t => t.completed);

    // Estimate hours: each log = ~2 hours, each task = ~30 minutes
    const estimatedLogHours = clientLogs.length * 2;
    const estimatedTaskHours = tasksInRange.length * 0.5;
    const totalHours = Math.round((estimatedLogHours + estimatedTaskHours) * 10) / 10;

    setEstimatedHours(totalHours);

    const newReport: MonthlyReport = {
      clientId: client.id,
      clientName: client.name,
      period: { start: periodStart, end: periodEnd },
      summary: `During this period, we completed ${completedTasks.length} tasks for ${client.name} across ${clientLogs.length} working days. Estimated time: ${totalHours} hours.`,
      tasksCompleted: completedTasks,
      highlights: activity.notes.slice(0, 5),
      generatedAt: new Date(),
    };

    setReport(newReport);
    setEditedReport(formatReportText(newReport, totalHours));
    setIsGenerating(false);

    toast.success('Report generated!');
  };

  const formatReportText = (r: MonthlyReport, hours: number): string => {
    const periodStart = format(r.period.start, 'MMM d, yyyy');
    const periodEnd = format(r.period.end, 'MMM d, yyyy');

    let text = `# Report: ${r.clientName}\n`;
    text += `Period: ${periodStart} - ${periodEnd}\n`;
    text += `Estimated Hours: ${hours}\n\n`;
    text += `## Summary\n${r.summary}\n\n`;

    if (r.tasksCompleted.length > 0) {
      text += `## Completed Tasks (${r.tasksCompleted.length})\n`;
      r.tasksCompleted.forEach(task => {
        text += `- ${task.text}\n`;
      });
      text += '\n';
    }

    if (r.highlights.length > 0) {
      text += `## Key Notes\n`;
      r.highlights.forEach(h => {
        text += `- ${h}\n`;
      });
    }

    return text;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(editedReport);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">DayLog</h1>
          <p className="text-muted-foreground">Monthly Reports</p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Main content */}
        <main className="space-y-6 animate-fade-in">
          {/* Client Selection & Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileBarChart className="w-4 h-4" />
                Generate Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client-select" className="text-sm font-medium text-foreground mb-2 block">
                  Select Client
                </Label>
                <select
                  id="client-select"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-sm font-medium text-foreground mb-2 block">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Start Date
                  </Label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm font-medium text-foreground mb-2 block">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    End Date
                  </Label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={generateReport}
                disabled={isGenerating || !selectedClient}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse-soft" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>

              {clients.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No clients yet. Start using @client tags in your daily logs.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Generated Report */}
          {report && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Generated Report</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <textarea
                  value={editedReport}
                  onChange={(e) => setEditedReport(e.target.value)}
                  className="w-full min-h-[300px] p-4 rounded-lg bg-secondary/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono leading-relaxed resize-none"
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Reports;
