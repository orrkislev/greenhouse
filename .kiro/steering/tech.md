# Technology Stack

## Framework & Runtime
- **Next.js 16.0.0** - React framework with App Router and Turbopack
- **React 19.2.0** - UI library with latest features
- **Node.js** - Runtime environment

## Database & Backend
- **Supabase** - Primary database with PostgreSQL, real-time subscriptions, and auth
- **Google APIs 153.0.0** - Calendar, Drive, and Docs integration

## Styling & UI
- **Tailwind CSS 4.1.7** - Utility-first CSS framework
- **Styled Components 6.1.19** - CSS-in-JS (via custom `tw` utility)
- **Material-UI 7.3.4** - Component library with Emotion
- **Radix UI** - Headless UI components for accessibility
- **shadcn/ui** - Pre-built component system
- **Lucide React** - Icon library
- **Motion 12.23.0** - Animation library

## State Management & Forms
- **Zustand 5.0.5** - Lightweight state management with subscriptions
- **React Hook Form 7.56.4** - Form handling
- **Zod 3.25.30** - Schema validation

## Visualization & Interaction
- **D3.js 7.9.0** - Data visualization and charts
- **TLDraw 3.15.4** - Drawing/diagramming interface
- **Pragmatic Drag and Drop** - Drag and drop functionality
- **React Quill New 3.6.0** - Rich text editor
- **React Day Picker 9.8.0** - Date selection

## Development Tools
- **ESLint 9** - Code linting with Next.js config
- **PostCSS 8.5.3** - CSS processing
- **TypeScript Types** - Type definitions for React 19

## Common Commands

```bash
# Development (with Turbopack)
npm run dev          # Start development server with --turbopack flag

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Notes
- **Single Database**: Supabase as primary
- **Real-time Updates**: Supabase subscriptions for live data
- **Authentication**: Supabase Auth with Google OAuth integration
- **API Integration**: Google Calendar, Drive, and Docs APIs
- **Turbopack**: Enabled for faster development builds
- **shadcn/ui**: Component system with New York style and stone base color