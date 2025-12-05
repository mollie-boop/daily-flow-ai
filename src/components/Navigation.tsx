import { NavLink as RouterNavLink } from 'react-router-dom';
import { Calendar, Users, FileBarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const linkClass = "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";
  
  return (
    <nav className="flex items-center gap-1 p-1.5 bg-card rounded-xl border border-border shadow-soft">
      <RouterNavLink 
        to="/" 
        end
        className={({ isActive }) => cn(
          linkClass,
          isActive 
            ? "bg-primary text-primary-foreground shadow-soft" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">Daily Log</span>
      </RouterNavLink>
      
      <RouterNavLink 
        to="/clients" 
        className={({ isActive }) => cn(
          linkClass,
          isActive 
            ? "bg-primary text-primary-foreground shadow-soft" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Clients</span>
      </RouterNavLink>
      
      <RouterNavLink 
        to="/reports" 
        className={({ isActive }) => cn(
          linkClass,
          isActive 
            ? "bg-primary text-primary-foreground shadow-soft" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <FileBarChart className="w-4 h-4" />
        <span className="hidden sm:inline">Reports</span>
      </RouterNavLink>
    </nav>
  );
}
