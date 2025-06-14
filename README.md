# MCNation Panel

A modern admin panel for managing Minecraft server operations, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Store Management**: Manage store items, categories, and orders
- **User Authentication**: Secure login and role-based access control
- **Admin Dashboard**: Comprehensive admin interface for server management
- **Profile Management**: User profile and settings management
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context API
- **Data Fetching**: SWR
- **Database**: MySQL (via Prisma)

## Project Structure

The project follows a feature-based architecture for better organization and maintainability:

```
src/
├── app/                    # Next.js App Router
│   ├── components/         # App-specific components
│   ├── store/              # Store feature pages
│   ├── auth/               # Authentication pages
│   ├── profile/            # User profile pages
│   ├── admin/              # Admin dashboard pages
│   └── api/                # API routes
├── features/               # Feature-specific code
│   ├── store/              # Store feature
│   ├── auth/               # Authentication feature
│   ├── profile/            # Profile feature
│   └── admin/              # Admin feature
└── shared/                 # Shared code
    ├── api/                # API client code
    ├── components/         # Shared UI components
    ├── utils/              # Utility functions
    ├── hooks/              # Custom React hooks
    └── types/              # TypeScript type definitions
```

## Reusable Components

The project includes several reusable components:

- **DataTable**: A versatile table component with sorting, filtering, and pagination
- **ErrorHandler**: Centralized error handling utilities
- **AppContext**: Global application context for state management
- **UI Components**: Buttons, cards, inputs, and other UI elements

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   bun dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Guidelines

- Follow the TypeScript type system strictly
- Use the provided hooks for data fetching
- Keep components small and focused
- Use the error handling utilities for consistent error management
- Follow the established directory structure for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.
