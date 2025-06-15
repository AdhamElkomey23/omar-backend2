# Artisana - Handcrafted Products Marketplace

## Overview

Artisana is a web application for a handcrafted products marketplace, where users can browse, filter, and purchase unique items created by artisans. The application follows a modern full-stack architecture with a React frontend and Express backend, using Drizzle ORM for database operations and PostgreSQL as the database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture with:

1. **Frontend**: React-based SPA (Single Page Application) with the following key components:
   - UI built with shadcn/ui components (based on Radix UI)
   - React Query for data fetching
   - Wouter for routing
   - TailwindCSS for styling
   - Custom hooks for state management

2. **Backend**: Express.js server handling:
   - RESTful API endpoints
   - Static file serving
   - Database operations via Drizzle ORM

3. **Database**: PostgreSQL with Drizzle ORM for schema definition and queries
   - Neon serverless Postgres integration via @neondatabase/serverless

4. **Build/Dev Tools**:
   - Vite for frontend development and building
   - TSX for TypeScript execution on the server
   - ESBuild for server-side code bundling

## Key Components

### Frontend

1. **Pages**:
   - Home: Landing page with featured products, categories, and artisans
   - Categories: Browse and filter products by category
   - ProductDetail: View detailed product information and customization options
   - Cart: Shopping cart functionality

2. **Components**:
   - UI components (shadcn/ui): Buttons, inputs, cards, etc.
   - Custom components: ProductCard, CategoryCard, ArtisanCard, TestimonialCard
   - Layout components: Navbar, Footer

3. **Hooks**:
   - useCart: Shopping cart state management
   - useFilter: Product filtering functionality
   - useToast: Notification system

### Backend

1. **API Routes**:
   - Categories: List all categories, get category by slug
   - Artisans: List all artisans, get featured artisans
   - Products: List all products, filter products, get product details
   - Reviews: List product reviews, post new reviews

2. **Storage Layer**:
   - Interface for database operations
   - Implements CRUD operations for products, categories, artisans, and reviews

3. **Middleware**:
   - Request logging
   - Error handling
   - Vite integration for development

### Database Schema

1. **Categories**: Store product categories
   - id, name, slug, imageUrl

2. **Artisans**: Store information about artisans
   - id, name, businessName, description, imageUrl, tags

3. **Products**: Store product information
   - id, name, description, price, categoryId, artisanId, isCustomizable, imageUrl, imageUrls, customizationOptions, averageRating, reviewCount, createdAt

## Data Flow

1. **Product Browsing**:
   - Client requests categories/products via React Query
   - Server fetches data from database via Drizzle ORM
   - Data is returned to client and displayed using appropriate components

2. **Product Filtering**:
   - User selects filters using the ProductFilters component
   - Filter state is managed by useFilter hook
   - Filtered results are fetched from the server or filtered client-side

3. **Cart Management**:
   - Products are added to cart using useCart hook
   - Cart state is persisted in localStorage
   - Cart operations (add, remove, update quantity) are handled client-side

## External Dependencies

### Frontend
- React ecosystem (react, react-dom)
- @tanstack/react-query for data fetching
- Radix UI components (@radix-ui/*)
- class-variance-authority and clsx for styling
- wouter for routing
- TailwindCSS for styling
- react-hook-form for form handling
- zod for validation

### Backend
- Express.js for server
- Drizzle ORM for database operations
- @neondatabase/serverless for PostgreSQL database connectivity

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Vite builds the frontend into static assets
   - ESBuild bundles the server code
   - Output is placed in the /dist directory

2. **Runtime**:
   - Node.js serves the application
   - Express serves both the API and static files

3. **Database**:
   - Relies on a PostgreSQL database provided by Replit or an external PostgreSQL provider like Neon

4. **Environment**:
   - Production mode is enabled via NODE_ENV=production
   - Database connection string is required via DATABASE_URL environment variable
   - Port configuration is handled automatically by Replit

## Development Workflow

1. `npm run dev`: Starts the development server with hot reloading
2. `npm run build`: Builds the application for production
3. `npm run start`: Starts the production server
4. `npm run check`: Runs TypeScript type checking
5. `npm run db:push`: Updates the database schema using Drizzle Kit

For local development, ensure the DATABASE_URL environment variable is set correctly. The application will automatically connect to the database and serve both the API and frontend application.