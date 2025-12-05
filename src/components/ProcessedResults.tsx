import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedLog, Client } from '@/types';
import { CheckCircle2, Users, FileText, Sparkles } from 'lucide-react';
import { getClients } from '@/lib/store';

interface ProcessedResultsProps {
  result: ProcessedLog;
}

export function ProcessedResults({ result }: ProcessedResultsProps) {
  const clients = getClients();
  
  const getClientById = (id: string): Client | undefined => {
    return clients.find(c => c.id === id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            Day Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Recognized Clients */}
      {result.recognizedClients.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-client-tag" />
              Clients Mentioned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.recognizedClients.map((clientName) => (
                <span
                  key={clientName}
                  className="px-3 py-1.5 rounded-full bg-client-tag/10 text-client-tag text-sm font-medium"
                >
                  @{clientName}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Tasks */}
      {result.extractedTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Tasks ({result.extractedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.extractedTasks.map((task) => (
                <li 
                  key={task.id}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg bg-secondary/50"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {task.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Notes by Client */}
      {Object.keys(result.clientNotes).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes by Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.clientNotes).map(([clientId, notes]) => {
              const client = getClientById(clientId);
              if (!client || notes.length === 0) return null;
              
              return (
                <div key={clientId}>
                  <h4 
                    className="text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{ color: client.color }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: client.color }}
                    />
                    {client.name}
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {notes.map((note, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
