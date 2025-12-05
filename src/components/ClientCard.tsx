import { memo } from 'react';
import { Client } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { getClientActivity, getClientTimeStatus } from '@/lib/store';
import { CheckCircle2, FileText, Trash2, AlertTriangle, Clock } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  onDelete?: (clientId: string) => void;
}

const ClientCardComponent = ({ client, onClick, onDelete }: ClientCardProps) => {
  const activity = getClientActivity(client.id);
  const completedTasks = activity.tasks.filter(t => t.completed).length;
  const timeStatus = getClientTimeStatus(client);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  const getStatusColor = () => {
    switch (timeStatus.status) {
      case 'exceeded': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = () => {
    if (timeStatus.status === 'exceeded' || timeStatus.status === 'critical') {
      return <AlertTriangle className="w-3 h-3" />;
    }
    return <Clock className="w-3 h-3" />;
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-glow hover:scale-[1.01] transition-all duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: client.color }}
            />
            <span className="truncate">{client.name}</span>
          </div>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={handleDelete}>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{client.name}"? This will also delete all associated tasks. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(client.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-4 text-sm flex-wrap">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Retainer</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {client.usedHours || 0}h / {client.retainerHours}h
                </span>
                {(timeStatus.status === 'warning' || timeStatus.status === 'critical' || timeStatus.status === 'exceeded') && (
                  <Badge variant={getStatusColor()} className="gap-1">
                    {getStatusIcon()}
                    {timeStatus.status === 'exceeded' ? 'Exceeded' :
                     timeStatus.status === 'critical' ? 'Critical' : 'Warning'}
                  </Badge>
                )}
              </div>
            </div>
            <Progress
              value={timeStatus.percentage}
              className={`h-2 ${
                timeStatus.status === 'exceeded' || timeStatus.status === 'critical'
                  ? '[&>div]:bg-destructive'
                  : timeStatus.status === 'warning'
                  ? '[&>div]:bg-yellow-500'
                  : ''
              }`}
            />
            {timeStatus.remaining < 0 && (
              <p className="text-xs text-destructive">
                Over by {Math.abs(timeStatus.remaining).toFixed(1)}h
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders
export const ClientCard = memo(ClientCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.client.id === nextProps.client.id &&
    prevProps.client.name === nextProps.client.name &&
    prevProps.client.retainerHours === nextProps.client.retainerHours &&
    prevProps.client.usedHours === nextProps.client.usedHours
  );
});
