# CollabCanvas MVP

Real-time collaborative whiteboard application built with React, TypeScript, Konva, Zustand, and Firebase.

## Features (MVP)

- Real-time cursor and shape synchronization
- Rectangle creation, selection, and movement
- User presence with colored cursors and avatars
- Minimal Figma-style toolbar UI
- Locking during drag/move operations
- Local storage persistence

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Canvas Rendering:** React Konva
- **State Management:** Zustand
- **Backend:** Firebase (Firestore + Realtime Database + Auth)
- **Styling:** TailwindCSS
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase project (see setup instructions below)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd collab-canvas
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase configuration
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore, Realtime Database, and Authentication (Email/Password)
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration values

4. Start the development server
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run all tests in watch mode
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests (Firebase connectivity)
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Firestore Database** (for persistent shapes)
   - **Realtime Database** (for ephemeral cursors/presence)
   - **Authentication** > Email/Password provider
4. Get your Firebase configuration from Project Settings
5. Add the configuration to `.env.local`

## Project Structure

```
collab-canvas/
├── src/
│   ├── components/       # React components (Canvas, Toolbar, etc.)
│   ├── stores/          # Zustand stores (user, cursor, shape)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and Firebase setup
│   ├── styles/          # CSS and Tailwind styles
│   ├── test/            # Test setup and utilities
│   ├── App.tsx          # Root application component
│   └── main.tsx         # Application entry point
├── tests/               # Unit tests
├── public/              # Static assets
└── ...config files
```

## Development Roadmap

See [tasks.md](./tasks.md) for the full development checklist organized by PRs.

**Current Status:** PR #1 - Project Initialization ✅

## Architecture

See [PRD.md](./PRD.md) for detailed product requirements and [architecture.md](./architecture.md) for technical architecture details.

## Testing

### Unit Tests
Run unit tests in watch mode:
```bash
npm test
```

Run unit tests once:
```bash
npm run test:unit
```

### Integration Tests

Integration tests verify that Firebase is configured correctly and all services are accessible.

Run integration tests:
```bash
npm run test:integration
```

**What Gets Tested:**
- Firebase Configuration - All environment variables present and app initializes
- Authentication - Auth service accessible and anonymous sign-in works
- Firestore Database - Connection and querying works
- Realtime Database - Connection works and URL is correctly formatted

**Prerequisites:**
1. Firebase project created and services enabled (Authentication, Firestore, Realtime Database)
2. `.env.local` configured with your Firebase credentials

**Troubleshooting:**

If authentication tests fail (`auth/admin-restricted-operation`):
- Enable Anonymous authentication: Firebase Console > Authentication > Sign-in method > Anonymous

If Firestore tests fail (`permission-denied`):
- Set Firestore to test mode: Firebase Console > Firestore Database > Rules

If Realtime Database tests fail (`404 not found`):
- Verify `VITE_FIREBASE_DATABASE_URL` in `.env.local` matches the URL in Firebase Console > Realtime Database

### Test UI
For interactive testing:
```bash
npm run test:ui
```

## License

MIT

## Author

Benjamin Cohen - October 2025

