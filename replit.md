# VibeBoard AI - Replit Configuration

## Overview

VibeBoard AI is a full-stack web application that transforms user mood input into personalized digital moodboards. The application combines AI-generated quotes, curated images from Unsplash, custom color palettes, and Spotify playlist integration to create shareable visual representations of emotions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite with React plugin for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Development Server**: Hot module replacement via Vite middleware integration

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### Core Features
1. **Dual Mood Input System**: 
   - Text-based mood input with suggested mood options
   - AI-powered image mood detection using computer vision
2. **AI Quote Generation**: OpenAI GPT-4o integration for personalized quotes
3. **Image Curation**: Unsplash API integration for mood-appropriate imagery
4. **Color Palette Generation**: Predefined mood-to-color mappings with fallback logic
5. **Spotify Integration**: Curated playlist embedding based on mood categories
6. **Sharing System**: Unique share URLs for moodboard distribution
7. **Download Functionality**: HTML-to-canvas conversion for image export
8. **Computer Vision Mood Analysis**: Advanced facial expression and visual element analysis

### Component Structure
- **Pages**: Home page with mood input and moodboard display
- **Components**: Modular UI components (mood input, moodboard display, loading states)
- **UI Library**: Complete shadcn/ui component set for consistent design
- **Shared Schema**: Zod-based validation schemas shared between client and server

## Data Flow

### Text-Based Mood Input Flow
1. **Mood Input**: User enters mood text via frontend form
2. **API Request**: POST request to `/api/moodboards` with mood data
3. **Content Generation**: 
   - OpenAI API generates personalized quote
   - Unsplash API fetches relevant images
   - Color palette selected from predefined mappings
   - Spotify playlist ID assigned based on mood category
4. **Data Persistence**: Moodboard stored with unique share ID
5. **Response**: Complete moodboard data returned to client
6. **Display**: Frontend renders visual moodboard with all components
7. **Sharing**: Share URLs enable moodboard viewing via `/share/:shareId` route

### Image-Based Mood Detection Flow
1. **Image Upload**: User uploads photo via drag-and-drop or file browser
2. **Image Processing**: Frontend converts image to base64 format
3. **AI Analysis**: POST request to `/api/analyze-mood` with base64 image data
4. **Mood Detection**: OpenAI GPT-4o Vision analyzes facial expressions, colors, and visual elements
5. **Mood Extraction**: System extracts primary mood from AI response
6. **Automatic Generation**: Detected mood triggers automatic moodboard generation
7. **Seamless Experience**: User sees their mood detected and moodboard created automatically

## External Dependencies

### APIs and Services
- **OpenAI API**: GPT-4o model for quote generation (requires OPENAI_API_KEY)
- **Unsplash API**: Image sourcing (requires UNSPLASH_ACCESS_KEY)
- **Spotify**: Playlist embedding (uses predefined playlist IDs)
- **Neon Database**: PostgreSQL hosting via @neondatabase/serverless

### Development Tools
- **Replit Integration**: Custom dev banner and cartographer plugin
- **Error Handling**: Runtime error overlay for development
- **Type Safety**: Comprehensive TypeScript configuration

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React application to `dist/public`
- **Server Build**: esbuild bundles Express server to `dist/index.js`
- **Type Checking**: TypeScript compiler validates all code

### Environment Configuration
- **Development**: `npm run dev` - Uses tsx for TypeScript execution with Vite middleware
- **Production**: `npm run build && npm start` - Serves static files and API routes
- **Database**: `npm run db:push` - Applies schema changes to PostgreSQL

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: OpenAI API authentication
- `UNSPLASH_ACCESS_KEY`: Unsplash API authentication
- `NODE_ENV`: Environment mode (development/production)

### Deployment Considerations
- Static file serving handled by Express in production
- Database migrations managed through Drizzle Kit
- Session persistence via PostgreSQL storage
- CORS and security headers configured for production