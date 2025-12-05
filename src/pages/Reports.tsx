import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client, MonthlyReport } from '@/types';
import { getClients, getClientActivity } from '@/lib/store';
import { FileBarChart, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [editedReport, setEditedReport] = useState('');
  const [copied, setCopied] = useState(false);

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

    const activity = getClientActivity(selectedClient);
    const completedTasks = activity.tasks.filter(t => t.completed);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newReport: MonthlyReport = {
      clientId: client.id,
      clientName: client.name,
      period: { start: monthStart, end: now },
      summary: `This month, we completed ${completedTasks.length} tasks for ${client.name}. ${activity.notes.length} notes were recorded across ${activity.notes.length} daily logs.`,
      tasksCompleted: completedTasks,
      highlights: activity.notes.slice(0, 3),
      generatedAt: new Date(),
    };

    setReport(newReport);
    setEditedReport(formatReportText(newReport));
    setIsGenerating(false);
    
    toast.success('Report generated!');
  };

  const formatReportText = (r: MonthlyReport): string => {
    const period = `${r.period.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    
    let text = `# Monthly Report: ${r.clientName}\n`;
    text += `Period: ${period}\n\n`;
    text += `## Summary\n${r.summary}\n\n`;
    
    if (r.tasksCompleted.length > 0) {
      text += `## Completed Tasks\n`;
      r.tasksCompleted.forEach(task => {
        text += `- ${task.text}\n`;
      });
      text += '\n';
    }
    
    if (r.highlights.length > 0) {
      text += `## Highlights\n`;
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
          {/* Client Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileBarChart className="w-4 h-4" />
                Generate Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Client
                </label>
                <select
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
                    Generate Monthly Report
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
