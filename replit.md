# GATE DA Exam Prep Dashboard

## Overview

This is a GATE Data Analytics exam preparation tracker built with a retro pixel-art aesthetic inspired by classic 8-bit games and Stardew Valley's UI. The application helps students track study sessions, monitor confidence levels across topics, manage study schedules, and access learning references. It features a clean, functional design with sharp corners, solid borders, monospace fonts, and an 8px-based grid system for precise, pixel-perfect layouts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Library**: Shadcn/ui components built on Radix UI primitives, configured with a "new-york" style preset. All components follow strict retro pixel-art design guidelines with zero border-radius, solid 2px borders, and an 8px base grid system.

**Styling Approach**: 
- Tailwind CSS with custom configuration enforcing zero border-radius across all breakpoints
- Custom CSS variables for theming (light/dark mode support)
- Retro color palette: Dark Slate (#2E3440), Muted Blue (#5E81AC), Light Blue (#88C0D0), Sage Green (#A3BE8C)
- Typography using Fira Code or JetBrains Mono monospace fonts loaded from Google Fonts

**State Management**: TanStack Query (React Query) for server state management with aggressive caching (staleTime: Infinity) and disabled auto-refetching to minimize network requests.

**Routing**: Wouter for lightweight client-side routing with five main routes: Dashboard (/), Study Session (/study), Confidence (/confidence), Schedule (/schedule), and References (/references).

**Design System**: 
- Strict 8px grid system for all spacing and sizing
- No rounded corners or soft shadows - only solid offset shadows (e.g., 4px 4px 0px)
- High contrast color combinations for accessibility
- Responsive breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript, configured as ESM modules.

**Development Setup**: Custom Vite middleware integration for HMR (Hot Module Replacement) during development, with SSR-style HTML template serving.

**API Design**: RESTful API structure with the following endpoints:
- Topics: GET /api/topics, GET /api/topics/:id, POST /api/topics, PATCH /api/topics/:id
- Study Sessions: GET /api/sessions, GET /api/sessions/:id, POST /api/sessions
- Schedule Items: GET /api/schedule, GET /api/schedule/:id, POST /api/schedule, PATCH /api/schedule/:id
- References: GET /api/references, GET /api/references/:id, POST /api/references

**Request Logging**: Custom middleware that logs all API requests with method, path, status code, duration, and truncated response bodies (max 80 characters) for debugging.

**Data Validation**: Zod schemas generated from Drizzle ORM table definitions for runtime validation of incoming requests.

### Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL dialect, with schema definitions in TypeScript.

**Database Schema**:
- **topics**: Tracks exam topics with number, subject, topic name, completion status (0-1), and confidence level (0-100)
- **studySessions**: Logs study sessions with date, start/end times, duration, associated topic, notes, and optional image proof
- **scheduleItems**: Weekly study schedule with topics to cover, study type, hours, and completion status
- **references**: Learning resources with syllabus section, topic, resource type, title/description, and URL

**Storage Implementation**: Dual-mode storage with in-memory storage (MemStorage class) for development/testing and PostgreSQL via Neon serverless for production. All storage operations return Promises for consistent async patterns.

**Data Seeding**: Automatic seeding from CSV files in attached_assets directory (Topics, Schedule, References) on server startup using custom CSV parser to handle quoted fields.

### Authentication and Authorization

**Current State**: No authentication system implemented. The application assumes single-user mode without access control.

**Session Management**: Express-session infrastructure present (connect-pg-simple for PostgreSQL session store) but not actively used for auth flows.

### External Dependencies

**Database Provider**: Neon (@neondatabase/serverless) - Serverless PostgreSQL platform accessed via DATABASE_URL environment variable.

**UI Component Libraries**: 
- Radix UI primitives for accessible, unstyled components (accordion, checkbox, dialog, dropdown, slider, tabs, etc.)
- Embla Carousel for any carousel functionality
- Lucide React for icon components

**Form Handling**: React Hook Form with Hookform Resolvers for validation integration.

**Date Utilities**: date-fns for date formatting and manipulation throughout the application.

**Development Tools**:
- Replit-specific plugins: runtime error overlay, cartographer, dev banner (disabled in production)
- Drizzle Kit for database migrations and schema management
- PostCSS with Tailwind and Autoprefixer

**Build Tools**: 
- Vite for frontend bundling and development server
- esbuild for backend bundling (server code compiled to ESM in dist directory)
- TypeScript compiler for type checking (noEmit mode, actual compilation handled by bundlers)

**Monospace Fonts**: Google Fonts integration loading Fira Code and JetBrains Mono with weights 400, 500, 600, 700.