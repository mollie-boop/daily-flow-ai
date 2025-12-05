# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DayLog** is an AI-powered daily log and client management app for freelancers. Users write daily logs in natural language, and the app extracts tasks, organizes content by client (via @mentions), and generates monthly reports.

Built on Lovable.dev platform with React + TypeScript + Vite.

## Development Commands

```bash
# Install dependencies
npm i

# Start dev server (default port 8080)
npm run dev

# Build for production
npm build

# Build in development mode
npm run build:dev

# Lint code
npm lint

# Preview production build
npm preview
```

## Architecture Overview

### Data Flow & State Management

**localStorage as Single Source of Truth**
- All data persists in localStorage via `src/lib/store.ts`
- Three storage keys: `daylog_clients`, `daylog_logs`, `daylog_tasks`
- No backend database - entirely client-side application
- No TanStack Query cache dependencies - it's used for React Query provider setup only

**Core Data Flow:**
1. User writes daily log on Index page (`src/pages/Index.tsx`)
2. `mockProcessLog()` extracts @client mentions and tasks from text
3. Clients auto-created via `getOrCreateClient()` if they don't exist
4. Data saved to localStorage via `saveLog()`, `saveTasks()`, `saveClients()`
5. Other pages read from localStorage to display clients, tasks, reports

### Key Architecture Patterns

**Client Extraction & Auto-Creation**
- `extractClientsFromText()` uses regex `/@(\w+)/g` to find @mentions
- Clients auto-created on first mention with auto-assigned color from `CLIENT_COLORS` array
- Client names are case-insensitive but stored with proper casing

**Task Extraction**
- Lines starting with `-`, `*`, or `•` are automatically extracted as tasks
- Each task gets unique ID via `crypto.randomUUID()`
- Tasks can be associated with clients via optional `clientId` field

**Mock AI Processing**
- `mockProcessLog()` in `src/lib/store.ts` simulates AI processing
- Designed to be replaced with real AI via Lovable Cloud integration
- Groups content by client, extracts tasks, generates summary

### Route Structure (src/App.tsx)

- `/` - Daily log input (Index.tsx)
- `/clients` - Client list view (Clients.tsx)
- `/clients/:id` - Individual client workspace (ClientDetail.tsx)
- `/reports` - Monthly report generator (Reports.tsx)
- `*` - 404 page (NotFound.tsx)

### Type System (src/types/index.ts)

Core interfaces:
- `Task` - Individual task with optional client association
- `DailyLog` - Daily entry with content, tasks, processed flag
- `Client` - Client profile with color, retainer hours
- `ProcessedLog` - Result of AI processing (summary, tasks, client notes)
- `MonthlyReport` - Generated report structure

### Component Architecture

**Atomic Design Structure:**
- `src/components/ui/` - 50+ shadcn-ui primitives (buttons, cards, dialogs, etc.)
- `src/components/` - Feature components (DailyLogInput, ClientCard, ProcessedResults, Navigation)
- Pages compose feature components and handle routing

**shadcn-ui Integration:**
- Components generated via `components.json` config
- Radix UI primitives with Tailwind styling
- Located in `src/components/ui/`
- Import path alias `@/` configured in vite.config.ts and tsconfig

## Working with This Codebase

### Adding New Features

**When adding client-related features:**
- Update client state in `src/lib/store.ts` via `saveClients()`
- Client data flows from localStorage → components via `getClients()`
- Always handle case-insensitive client name matching

**When adding task features:**
- Tasks are tied to daily logs via `DailyLog.tasks` array
- Use `saveTasks()` to persist task changes to localStorage
- Filter tasks by `clientId` for client-specific views

**When modifying processing logic:**
- Current logic in `mockProcessLog()` is placeholder
- Real AI integration will replace this function
- Keep interface `ProcessedLog` when integrating real AI

### Important Constraints

- **No backend**: All features must work client-side only
- **localStorage limits**: Consider storage size when adding data-heavy features
- **Date handling**: Dates serialized to JSON in localStorage - parse when reading
- **Lovable platform**: Deployment via Lovable.dev, not traditional hosting

### shadcn-ui Components

Add new components via Lovable.dev interface or manually:
```bash
npx shadcn@latest add [component-name]
```

All components use:
- Tailwind utility classes
- CVA (class-variance-authority) for variants
- Radix UI primitives for accessibility

### Styling System

- **Tailwind CSS** with custom theme in `tailwind.config.ts`
- **CSS variables** for theming (defined in `src/index.css`)
- **Font**: Plus Jakarta Sans via `@fontsource/plus-jakarta-sans`
- **Utilities**: `cn()` helper from `src/lib/utils.ts` for conditional classes

## Lovable Platform Integration

Changes can be made via:
1. **Lovable web interface** - commits automatically to repo
2. **Local development** - push changes to sync with Lovable
3. **GitHub web editor** - edits sync to Lovable
4. **GitHub Codespaces** - full dev environment

**Deployment**: Use Lovable interface → Share → Publish

**Project URL**: https://lovable.dev/projects/f76c476c-5003-43a1-aea4-8ebe92e24804
