import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { exportAllData, importData, getLogs, getClients, getTasks } from '@/lib/store';
import { SafeStorage, getStorageVersion } from '@/lib/storage';
import { Download, Upload, FileJson, FileText, Trash2, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [importText, setImportText] = useState('');
  const logs = getLogs();
  const clients = getClients();
  const tasks = getTasks();
  const storageInfo = SafeStorage.getStorageInfo();
  const storageVersion = getStorageVersion();

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daylog-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleExportMarkdown = () => {
    let markdown = `# DayLog Export\n\nExported: ${new Date().toLocaleString()}\n\n`;

    // Export clients
    markdown += `## Clients (${clients.length})\n\n`;
    clients.forEach(client => {
      markdown += `### ${client.name}\n`;
      markdown += `- Color: ${client.color}\n`;
      if (client.retainerHours) {
        markdown += `- Retainer: ${client.usedHours || 0}h / ${client.retainerHours}h\n`;
      }
      markdown += `\n`;
    });

    // Export logs
    markdown += `## Daily Logs (${logs.length})\n\n`;
    logs.forEach(log => {
      const date = new Date(log.date);
      markdown += `### ${date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}\n\n`;

      if (log.estimatedHours) {
        markdown += `**Estimated Hours:** ${log.estimatedHours}h\n\n`;
      }

      markdown += log.content + '\n\n';

      if (log.tasks.length > 0) {
        markdown += `**Tasks:**\n`;
        log.tasks.forEach(task => {
          markdown += `- [${task.completed ? 'x' : ' '}] ${task.text}\n`;
        });
        markdown += '\n';
      }

      markdown += '---\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daylog-export-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Markdown exported successfully');
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('Please paste data to import');
      return;
    }

    const success = importData(importText);
    if (success) {
      toast.success('Data imported successfully! Refresh the page to see changes.');
      setImportText('');
    } else {
      toast.error('Failed to import data. Please check the format.');
    }
  };

  const handleClearAll = () => {
    localStorage.clear();
    toast.success('All data cleared. Refresh the page.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your data and preferences</p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        <div className="space-y-6">
          {/* Data Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Data Overview</CardTitle>
              <CardDescription>Current storage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold text-primary">{logs.length}</div>
                  <div className="text-sm text-muted-foreground">Daily Logs</div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold text-primary">{clients.length}</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold text-primary">{tasks.length}</div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
              </div>

              {/* Storage Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Database className="w-4 h-4" />
                    Storage Usage
                  </span>
                  <span className="font-mono">
                    {(storageInfo.used / 1024).toFixed(2)} KB / {(storageInfo.available / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        storageInfo.percentage > 80 ? 'bg-destructive' :
                        storageInfo.percentage > 60 ? 'bg-yellow-500' :
                        'bg-primary'
                      }`}
                      style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {storageInfo.percentage.toFixed(1)}% used
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Data Version
                  </span>
                  <span className="font-mono">v{storageVersion}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
              <CardDescription>Download your data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={handleExportJSON} className="flex-1">
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
                <Button onClick={handleExportMarkdown} variant="secondary" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Export as Markdown
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JSON format preserves all data and can be re-imported. Markdown is for human-readable backup.
              </p>
            </CardContent>
          </Card>

          {/* Import Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Data
              </CardTitle>
              <CardDescription>Restore data from a JSON backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="import-data">Paste JSON data</Label>
                <Textarea
                  id="import-data"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Paste your exported JSON here...'
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>
              <Button onClick={handleImport} className="w-full">
                Import Data
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your clients, logs, and tasks.
                      Make sure you've exported your data first!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
