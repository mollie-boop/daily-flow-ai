import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLogs, getClients } from '@/lib/store';
import { Search as SearchIcon, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const logs = getLogs();
  const clients = getClients();
  const navigate = useNavigate();

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();

    return logs.filter(log => {
      // Search in log content
      if (log.content.toLowerCase().includes(query)) return true;

      // Search in tasks
      if (log.tasks.some(task => task.text.toLowerCase().includes(query))) return true;

      // Search in date
      if (format(new Date(log.date), 'MMMM d, yyyy').toLowerCase().includes(query)) return true;

      return false;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchQuery, logs]);

  // Extract client mentions from text
  const extractClients = (text: string) => {
    const matches = text.match(/@(\w+)/g) || [];
    return [...new Set(matches.map(m => m.slice(1)))];
  };

  // Get client color by name
  const getClientColor = (clientName: string) => {
    const client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    return client?.color || '#6B9080';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
          <p className="text-muted-foreground">Find logs, tasks, and client mentions</p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Search input */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search logs, tasks, clients, or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Search results */}
        <div className="space-y-4">
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Start typing to search your logs</p>
            </div>
          )}

          {searchResults.map(log => {
            const clientMentions = extractClients(log.content);

            return (
              <Card
                key={log.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/calendar')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {log.tasks.length} tasks
                      </CardDescription>
                    </div>
                    {clientMentions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {clientMentions.slice(0, 3).map(clientName => (
                          <Badge
                            key={clientName}
                            variant="outline"
                            style={{
                              borderColor: getClientColor(clientName),
                              color: getClientColor(clientName),
                            }}
                          >
                            @{clientName}
                          </Badge>
                        ))}
                        {clientMentions.length > 3 && (
                          <Badge variant="outline">
                            +{clientMentions.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[150px]">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {log.content.substring(0, 300)}
                      {log.content.length > 300 && '...'}
                    </p>
                  </ScrollArea>

                  {log.tasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Tasks:</p>
                      <div className="space-y-1">
                        {log.tasks.slice(0, 3).map(task => (
                          <div key={task.id} className="flex items-center gap-2 text-xs">
                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                              {task.completed ? '✓' : '○'} {task.text}
                            </span>
                          </div>
                        ))}
                        {log.tasks.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{log.tasks.length - 3} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
