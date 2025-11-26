# Project Structure

## Root Directory Organization

```
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Main application routes (authenticated)
│   │   ├── (journal)/     # Journal and reflection features
│   │   ├── (main)/        # Dashboard and main views
│   │   ├── admin/         # Administrative interfaces
│   │   ├── profile/       # User profile management
│   │   ├── project/       # Project management pages
│   │   ├── research/      # Research project tools
│   │   ├── schedule/      # Scheduling and calendar
│   │   ├── staff/         # Staff-specific features
│   │   ├── study/         # Study pathway management
│   │   ├── vocation/      # Vocational guidance
│   │   └── layout.jsx     # Authenticated app layout with sidebar
│   ├── screen/            # Public/shared screen routes
│   │   └── [groupId]/     # Dynamic group-based screens
│   ├── layout.jsx         # Root layout with Hebrew font setup
│   ├── globals.css        # Global styles and CSS variables
│   └── favicon.ico        # App icon
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components (JSX)
│   └── *.js              # Custom components (JS files)
├── utils/                # Utility functions and configurations
│   ├── actions/          # Server actions and API calls
│   ├── constants/        # App constants and enums
│   ├── supabase/         # Supabase client, server, and utilities
│   ├── store/           # Zustand store definitions
│   │   └── utils/       # Store utility functions
│   └── tw.js            # Custom styled-components utility
└── public/              # Static assets
```

## Key Architectural Patterns

### Database Architecture
- **Primary Database**: Supabase (PostgreSQL) for main application data
- **Real-time Features**: Supabase subscriptions for live updates
- **Authentication**: Supabase Auth with Google OAuth integration

### Component Structure
- **Custom Components**: Located in `/components/` with `.js` extension
- **UI Components**: shadcn/ui components in `/components/ui/` with `.jsx` extension
- **Styled Components**: Use custom `tw` utility for Tailwind + styled-components pattern
- **Authentication Wrapper**: `WithAuth` component for protected routes

### State Management Patterns
- **Zustand Stores**: Domain-specific stores (useUser, useProject, useStudy, etc.)
- **Store Utilities**: Custom hooks with loading states and data fetching
- **Subscriptions**: Real-time data updates via Zustand subscriptions
- **User Switching**: Staff can impersonate students with `originalUser` state

### Routing Structure
- **Route Groups**: `(app)` for authenticated routes, `screen` for public
- **Dynamic Routes**: `[groupId]` for group-specific screens
- **Nested Layouts**: App layout with sidebar for authenticated users
- **Protected Routes**: Authentication wrapper around main app routes

### File Naming Conventions
- **Components**: PascalCase (e.g., `Button.js`, `SideBar.js`)
- **Pages**: lowercase with Next.js App Router conventions
- **Stores**: camelCase with `use` prefix (e.g., `useUser.js`)
- **Actions**: descriptive names (e.g., `admin actions.js`)

### Import Patterns
- Use `@/` alias for root-level imports
- Import from `/utils/supabase/client` for database operations
- Import custom `tw` utility from `/utils/tw` for styled components
- Store actions exported as separate objects for external use

### Component Patterns
- Functional components with hooks
- Custom data loading hooks with loading states
- Props filtering for styled components (remove `$` prefixed props)
- Consistent use of `className` prop merging with `cn()` utility
- Real-time data subscriptions in store definitions