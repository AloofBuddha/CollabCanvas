# CollabCanvas MVP

Real-time collaborative whiteboard application built with React, TypeScript, Konva, Zustand, and Firebase.

## 🚀 Live Demo

**[https://collab-canvas-ben-cohen.vercel.app/](https://collab-canvas-ben-cohen.vercel.app/)**

Try it out! Create an account and test real-time collaboration by opening the app in multiple browser windows.

## ✨ Features

### Core Canvas
- ✅ **4 Shape Types:** Rectangle, Circle, Line, Text with full manipulation
- ✅ **Shape Creation:** Click-drag to create any shape
- ✅ **Shape Manipulation:** Drag, resize (corners/edges), rotate, duplicate (Alt+drag)
- ✅ **Multi-Select:** Drag-to-select rectangle + Shift+click for multiple shapes
- ✅ **Text Editing:** Double-click to edit with rich formatting (font, size, color, alignment)
- ✅ **DetailPane:** Right sidebar with all shape properties (color, opacity, position, z-index)
- ✅ **Layering:** Z-index controls (bring to front/back, send forward/backward)
- ✅ **Opacity:** Transparency control (0-100%) for all shapes

### Real-Time Collaboration
- ✅ **Multi-User Sync:** Instant shape updates via Firebase (sub-second latency)
- ✅ **Cursor Tracking:** See other users' cursors with names and colors
- ✅ **User Presence:** Online user list in header with avatars
- ✅ **Locking System:** Shapes lock when edited, prevents conflicts
- ✅ **Visual Feedback:** Colored borders show who's editing what
- ✅ **Offline Persistence:** Automatic synchronization when reconnecting
- ✅ **Connection Monitoring:** Real-time status indicator for Firebase and browser connectivity

### AI Canvas Agent 🤖 (60% Complete)
- ✅ **Natural Language Commands:** "Create a red circle at 100, 200"
- ✅ **Shape Manipulation:** "Make circle-1 blue", "Move rectangle-2 to 300, 400"
- ✅ **Shape Naming:** Auto-generated names (rectangle-1) + user-editable
- ✅ **Multi-Shape Creation:** "Create a smiley face" generates multiple shapes
- 🔄 **Layout Commands** (In Progress): Align, distribute, center shapes
- 🔄 **Complex Commands** (In Progress): "Create a login form"

### Canvas Controls
- ✅ **Pan:** Middle-click and drag (or Space+drag)
- ✅ **Zoom:** Ctrl+Wheel or pinch gesture
- ✅ **Vertical Scroll:** Mouse wheel
- ✅ **Delete:** Delete or Backspace key
- ✅ **Deselect:** ESC key or click canvas background
- ✅ **Undo/Redo:** Ctrl+Z / Ctrl+Shift+Z (robust history with smart diff-based persistence)
- ✅ **Keyboard Shortcuts:** Arrow nudging, Ctrl+D, Ctrl+A, ? for help
- ✅ **Connection Status:** Real-time indicator for Firebase and browser connectivity
- ✅ **Performance Monitor:** FPS counter (toggle with Shift+F)

### Authentication
- ✅ **Email/Password:** Secure signup and login
- ✅ **User Profiles:** Display name, unique color, presence tracking
- ✅ **Session Persistence:** Stay logged in across sessions

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Canvas Rendering:** React Konva
- **State Management:** Zustand
- **Backend:** Firebase (Firestore + Realtime Database + Auth)
- **AI Agent:** XAI (Grok) via LangChain
- **Styling:** TailwindCSS
- **Testing:** Vitest

## ⌨️ Keyboard Shortcuts

### Selection & Manipulation
- **Click:** Select shape
- **Shift+Click:** Add/remove shape from multi-select
- **Click+Drag (canvas):** Create selection rectangle
- **Delete / Backspace:** Delete selected shape(s)
- **ESC:** Deselect all shapes (press again to close AI agent and reset tool)
- **Ctrl+A / Cmd+A:** Select all shapes
- **Ctrl+D / Cmd+D:** Duplicate selected shape(s) in-place with full Firebase persistence
- **Alt+Drag:** Duplicate shape while dragging

### Shape Manipulation
- **Arrow Keys:** Nudge selected shape(s) 1px
- **Shift+Arrow:** Nudge selected shape(s) 10px
- **Ctrl+Z / Cmd+Z:** Undo last action
- **Ctrl+Shift+Z / Cmd+Shift+Z:** Redo action
- **Ctrl+Y / Cmd+Y:** Redo action (alternative)

### Canvas Navigation
- **Middle-Click+Drag:** Pan canvas
- **Mouse Wheel:** Vertical scroll
- **Ctrl+Wheel / Cmd+Wheel:** Zoom in/out
- **Space+Drag:** Pan canvas (alternative)

### Text Editing
- **Double-Click (text):** Enter edit mode
- **ESC (while editing):** Exit edit mode
- **Click outside:** Exit edit mode

### Help
- **? or Shift+/:** Toggle keyboard shortcuts guide

---

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

## 📋 Development Status

**Current Progress:** 85% Complete (14/16 core tasks)  
**Test Coverage:** 314+ unit tests + 30 integration tests  
**Grade Estimate:** 82-85/100 (B- to B, targeting B+)

### Completed Features ✅
- Core canvas with 4 shape types (rectangle, circle, line, text)
- Real-time multi-user collaboration with cursor tracking
- Multi-select system (drag-to-select + shift+click)
- Opacity and z-index layering controls
- Robust undo/redo system with smart diff-based persistence
- Full duplication support (Ctrl+D and Alt+drag with Firebase persistence)
- Comprehensive keyboard shortcuts (arrow nudging, Ctrl+Z/Y, Ctrl+D, Ctrl+A)
- Keyboard shortcuts guide modal (? key)
- AI canvas agent infrastructure
- Shape creation & manipulation commands
- Offline persistence and automatic reconnection synchronization
- Connection status monitoring (Firebase + browser connectivity)
- Performance monitoring (FPS counter with Shift+F toggle)
- Comprehensive testing suite (314+ tests, all passing)

### Recent Bug Fixes ✅
- **Shape Duplication:** Fixed Ctrl+D and Alt+drag Firebase persistence issues
- **Undo/Redo Robustness:** Implemented smart diff-based persistence for reliable history navigation
- **Shape Reversion:** Fixed critical bug where shapes would jump to old positions on reconnection
- **Escape Key Enhancement:** Now closes AI agent and resets to select tool

### Planned 📋
- PNG export functionality
- Performance testing (300+ shapes)
- Enhanced AI canvas agent features (layout commands, complex compositions)

**Full Details:** See [TASKS.md](./TASKS.md) for complete task list with rubric alignment

## 📚 Documentation

- **[PRD.md](./PRD.md)** - Product Requirements Document (features, architecture, roadmap)
- **[TASKS.md](./TASKS.md)** - Development status, rubric alignment, grade projections
- **[architecture.md](./architecture.md)** - System architecture and design decisions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[SETUP.md](./SETUP.md)** - Local development setup

**Live Demo:** [https://collab-canvas-ben-cohen.vercel.app/](https://collab-canvas-ben-cohen.vercel.app/)

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

