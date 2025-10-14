# CollabCanvas MVP

Real-time collaborative whiteboard application built with React, TypeScript, Konva, Zustand, and Firebase.

## Features (MVP)

- ✅ **Real-time Collaboration:** Multi-user cursor tracking and shape synchronization
- ✅ **Canvas Controls:** Pan (middle-click), zoom (Ctrl+wheel), and vertical scroll (wheel)
- ✅ **Shape Creation:** Rectangle tool with drag-to-create
- ✅ **Shape Manipulation:** Select, drag, and delete shapes
- ✅ **Locking System:** Prevents concurrent editing conflicts with visual feedback
- ✅ **User Presence:** Online user avatars in header with overflow indicator
- ✅ **Authentication:** Email/password signup and login with persistent sessions
- ✅ **Multiplayer Cursors:** Real-time cursor positions with names and colors

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

## Deployment

### Production Deployment (Vercel + Firebase)

This project is deployed on Vercel with Firebase backend services.

**Quick Deploy:**
1. Fork/clone this repository
2. Set up Firebase project (Firestore, Realtime DB, Auth)
3. Deploy to Vercel:
   - Connect your GitHub repository
   - Add Firebase environment variables
   - Deploy!

**Detailed Instructions:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Firebase Security Rules:**
- `firestore.rules` - Firestore security rules (shapes and users)
- `database.rules.json` - Realtime Database rules (cursors and presence)

Deploy rules with:
```bash
firebase deploy --only firestore:rules
firebase deploy --only database:rules
```

## Development Roadmap

See [tasks.md](./tasks.md) for the full development checklist organized by PRs.

**Current Status:** PR #7 Complete ✅ | PR #8 In Progress (Deployment)

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

