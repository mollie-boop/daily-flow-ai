import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DailyLogInput } from '@/components/DailyLogInput';
import { ProcessedResults } from '@/components/ProcessedResults';
import { Task, ProcessedLog, DailyLog } from '@/types';
import { mockProcessLog, saveLog, saveTasks } from '@/lib/store';
import { toast } from 'sonner';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedLog | null>(null);

  const handleProcess = async (content: string, tasks: Task[]) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const result = mockProcessLog(content, tasks);
      
      // Save the log
      const newLog: DailyLog = {
        id: crypto.randomUUID(),
        date: new Date(),
        content,
        tasks: result.extractedTasks,
        processed: true,
        createdAt: new Date(),
      };
      saveLog(newLog);
      
      // Save tasks
      saveTasks(result.extractedTasks);
      
      setProcessedResult(result);
      
      toast.success('Your day has been processed!', {
        description: `Found ${result.recognizedClients.length} clients and ${result.extractedTasks.length} tasks.`,
      });
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">DayLog</h1>
          <p className="text-muted-foreground">{today}</p>
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
