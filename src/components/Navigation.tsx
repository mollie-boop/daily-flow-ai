import { NavLink as RouterNavLink } from 'react-router-dom';
import { Calendar, Users, FileBarChart, CalendarDays, BarChart3, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const linkClass = "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";

  return (
    <nav className="flex items-center gap-1 p-1.5 bg-card rounded-xl border border-border shadow-soft overflow-x-auto">
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
        to="/calendar"
        className={({ isActive }) => cn(
          linkClass,
          isActive
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <CalendarDays className="w-4 h-4" />
        <span className="hidden sm:inline">Calendar</span>
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
        to="/analytics"
        className={({ isActive }) => cn(
          linkClass,
          isActive
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="hidden sm:inline">Analytics</span>
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

      <RouterNavLink
        to="/search"
        className={({ isActive }) => cn(
          linkClass,
          isActive
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </RouterNavLink>

      <RouterNavLink
        to="/settings"
        className={({ isActive }) => cn(
          linkClass,
          isActive
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </RouterNavLink>
    </nav>
  );
}
