import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { ClientCard } from '@/components/ClientCard';
import { Client } from '@/types';
import { getClients, deleteClient } from '@/lib/store';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setClients(getClients());
  }, []);

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setClients(getClients());
    toast.success('Client deleted successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">DayLog</h1>
          <p className="text-muted-foreground">Client Spaces</p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Main content */}
        <main>
          {clients.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">No clients yet</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start using @client tags in your daily logs to automatically create client spaces.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 animate-fade-in">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  onDelete={handleDeleteClient}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Clients;
