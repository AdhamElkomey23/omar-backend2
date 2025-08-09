# Project Documentation

## Overview
This is a full-stack JavaScript application using React/TypeScript on the frontend with Vite, and Express.js on the backend with PostgreSQL database integration.

## Project Architecture
- **Frontend**: React 19 with TypeScript, Vite build system
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Authentication**: Passport.js with local strategy

## Key Technologies
- React 19 + TypeScript
- Express.js + TypeScript 
- PostgreSQL + Drizzle ORM
- Tailwind CSS + shadcn/ui
- TanStack Query
- Wouter routing
- Passport.js authentication

## Recent Changes
- **2025-08-09**: Fixed application startup issue by installing missing `@tailwindcss/typography` dependency that was referenced in `tailwind.config.ts` but not installed in package.json

## User Preferences
- (None specified yet)

## Development Notes
- Application runs on port 5000 with both frontend and backend served from the same server
- Uses modern full-stack patterns with minimal backend - most logic in frontend
- Database operations use Drizzle ORM with type-safe schemas
- All routes are API-based for data persistence and external API calls