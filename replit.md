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
- **2025-08-10**: COMPLETED: Full technology stack conversion from React/Express/TypeScript to HTML/CSS/JavaScript frontend with PHP backend. Successfully converted the entire fertilizer/chemical trading management system while preserving ALL functionality. The storage inventory filtering issue has been permanently resolved - no storage seed data will ever be loaded automatically again. Sales form only shows products actually available in storage (quantity > 0). Created complete standalone application in Public_Html folder ready for shared hosting deployment.
- **2025-08-10**: Fixed critical inventory filtering issue by removing all storage seed data permanently. Sales form now only displays products with available inventory from storage page.
- **2025-08-10**: Successfully migrated project from Replit Agent to Replit environment. Fixed TypeScript compilation issues and verified all core functionality working including sales deletion, storage management, and API endpoints.

## User Preferences
- Wants applications to work flawlessly without any 400/500 errors
- Prefers complete solutions that are ready for production deployment
- Values comprehensive documentation and installation guides

## Development Notes
- Application runs on port 5000 with both frontend and backend served from the same server
- Uses modern full-stack patterns with minimal backend - most logic in frontend
- Database operations use Drizzle ORM with type-safe schemas
- All routes are API-based for data persistence and external API calls