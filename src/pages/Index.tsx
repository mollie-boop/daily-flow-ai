import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DailyLogInput } from '@/components/DailyLogInput';
import { ProcessedResults } from '@/components/ProcessedResults';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Task, ProcessedLog, DailyLog } from '@/types';
import { saveLog, saveTasks, estimateLogHours, extractClientsFromText } from '@/lib/store';
import { processLogWithAI, isAIEnabled } from '@/lib/ai';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle } from 'lucide-react';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedLog | null>(null);

  const handleProcess = async (content: string, tasks: Task[]) => {
    setIsProcessing(true);

    try {
      // Process log with AI (or fallback to mock if no API key)
      const result = await processLogWithAI(content, tasks);

      // Estimate hours for this log
      const estimatedHours = estimateLogHours(content, result.extractedTasks);

      // Save the log with time estimation
      const newLog: DailyLog = {
        id: crypto.randomUUID(),
        date: new Date(),
        content,
        tasks: result.extractedTasks,
        processed: true,
        createdAt: new Date(),
        estimatedHours,
      };
      saveLog(newLog);

      // Save tasks
      saveTasks(result.extractedTasks);

      setProcessedResult(result);

      const aiStatus = isAIEnabled() ? 'AI-powered' : 'Basic';
      const clientHint = result.recognizedClients.length === 0 && result.extractedTasks.length > 0
        ? ' Tip: Use @ClientName to tag clients!'
        : '';

      toast.success('Your day has been processed!', {
        description: `${aiStatus} processing: ${result.recognizedClients.length} clients, ${result.extractedTasks.length} tasks. Estimated: ${estimatedHours}h${clientHint}`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process your day', {
        description: 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const aiEnabled = isAIEnabled();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">DayLog</h1>
          <p className="text-muted-foreground">{today}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {aiEnabled ? (
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                AI Not Configured
              </Badge>
            )}
          </div>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Main content */}
        <main className="space-y-8">
          <DailyLogInput onProcess={handleProcess} isProcessing={isProcessing} />
          
          {processedResult && (
            <div className="pt-4">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Results</h2>
              <ProcessedResults result={processedResult} />
            </div>
          )}
        </main>

        {/* Onboarding hint */}
        {!processedResult && (
          <p className="text-center text-sm text-muted-foreground/60 mt-12 italic">
            Write your day just as it is — messy, busy, brilliant. I'll organise everything for you.
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
