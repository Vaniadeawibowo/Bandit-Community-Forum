# Banddit Clone - Full Stack Application

## Overview

This is a full-stack Banddit-style clone application built with React, TypeScript, and Express. The application features user authentication, post creation, voting, and real-time updates. It uses a modern tech stack with shadcn/ui components for the frontend and MongoDB with Mongoose for database interactions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit for global state management
- **Routing**: Wouter for client-side routing
- **Data Fetching**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom Banddit-themed variables
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Storage**: MongoDB storage with full CRUD operations
- **API Structure**: RESTful API with authentication middleware

## Key Components

### Authentication System
- JWT-based authentication with bearer tokens
- Password hashing using bcryptjs
- Protected routes with authentication middleware
- User registration, login, and profile management

### Post Management
- Create, read, update, and delete posts
- Voting system (upvote/downvote)
- Post author information display
- Real-time post updates

### UI Components
- Responsive design with mobile-first approach
- Modal dialogs for post creation and editing
- Toast notifications for user feedback
- Loading states and error handling
- Reddit-style theming with custom CSS variables

### Data Models
- **Users**: _id (ObjectId), username, email, password, createdAt
- **Posts**: _id (ObjectId), title, content, authorId (ObjectId ref), votes, createdAt, updatedAt
- Relationship: Posts belong to Users (one-to-many via ObjectId references)

## Data Flow

1. **Authentication Flow**:
   - User registers/logs in → JWT token generated → Token stored in localStorage
   - Protected routes verify token → User data retrieved from backend

2. **Post Creation Flow**:
   - User creates post → Redux action dispatched → API call to backend
   - Post saved to database → UI updated with new post

3. **Voting Flow**:
   - User votes on post → Optimistic UI update → API call to backend
   - Vote count updated in database → UI reflects final state

4. **Data Synchronization**:
   - TanStack Query manages server state caching
   - Redux Toolkit handles client-side state updates
   - Real-time updates through API polling

## External Dependencies

### Frontend Dependencies
- **Core**: React, TypeScript, Vite
- **State Management**: @reduxjs/toolkit, @tanstack/react-query
- **UI**: @radix-ui components, tailwindcss, class-variance-authority
- **Routing**: wouter
- **Forms**: react-hook-form, @hookform/resolvers
- **Utilities**: clsx, nanoid

### Backend Dependencies
- **Core**: Express.js, TypeScript
- **Database**: mongodb, mongoose, @types/mongoose
- **Authentication**: jsonwebtoken, bcryptjs
- **Validation**: zod
- **Development**: tsx, esbuild

### Development Tools
- **Database**: MongoDB with Mongoose for schema management and ODM
- **Build**: Vite for frontend, esbuild for backend
- **Development**: Hot module replacement, runtime error overlay

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static files in `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution, Vite dev server
- **Production**: Node.js serves bundled application
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

### Database Setup
- MongoDB with Mongoose ODM
- Schema defined using Mongoose models in `server/models/`
- User and Post models with proper relationships
- Connection via standard MongoDB driver

## Changelog

- July 08, 2025. Initial setup
- July 08, 2025. Migrated from PostgreSQL/Drizzle to MongoDB/Mongoose with full CRUD implementation
- July 08, 2025. Updated branding from "Reddit" to "Banddit" with community prefix changes (r/ → b/)

## User Preferences

Preferred communication style: Simple, everyday language.