import { Client } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getClientActivity } from '@/lib/store';
import { CheckCircle2, FileText } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const activity = getClientActivity(client.id);
  const completedTasks = activity.tasks.filter(t => t.completed).length;
  const retainerProgress = client.retainerHours 
    ? Math.min(100, ((client.usedHours || 0) / client.retainerHours) * 100)
    : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-glow hover:scale-[1.01] transition-all duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <span 
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: client.color }}
          />
          <span className="truncate">{client.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>{completedTasks} tasks</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{activity.notes.length} notes</span>
          </div>
        </div>

        {/* Retainer progress */}
        {client.retainerHours && client.retainerHours > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Retainer</span>
              <span>{client.usedHours || 0}h / {client.retainerHours}h</span>
            </div>
            <Progress value={retainerProgress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
