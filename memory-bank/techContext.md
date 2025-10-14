# Technical Context: CollabCanvas

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework and component model |
| TypeScript | 5.5.3 | Type safety and developer experience |
| Vite | 5.3.1 | Build tool and dev server (fast HMR) |
| React Konva | 18.2.10 | Canvas rendering with React paradigm |
| Konva | 9.3.14 | 2D canvas library (WebGL accelerated) |
| Zustand | 4.5.2 | Lightweight state management |
| TailwindCSS | 3.4.4 | Utility-first CSS framework |
| Lucide React | 0.263.1 | Icon library for toolbar/UI |

### Backend (Firebase)

| Service | Purpose |
|---------|---------|
| Firebase Auth | Email/password authentication, JWT tokens |
| Firestore | Persistent shape data and user profiles |
| Realtime Database | Ephemeral cursor positions and presence |
| Firebase SDK | 10.12.2 - Client library for all Firebase services |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 1.6.0 | Unit test runner (Vite-native) |
| @vitest/ui | 1.6.0 | Interactive test UI |
| @testing-library/react | 16.0.0 | React component testing utilities |
| ESLint | 8.57.0 | Code linting and style enforcement |
| TypeScript ESLint | 7.13.1 | TypeScript-specific linting rules |

### Deployment

| Platform | Purpose |
|----------|---------|
| Vercel | Static site hosting with automatic deployments |
| GitHub | Version control and CI/CD trigger |

## Project Structure

```
collab-canvas/
├── src/
│   ├── components/           # React components
│   │   ├── Canvas.tsx       # Main canvas with Konva Stage
│   │   ├── Rectangle.tsx    # Rectangle shape component
│   │   ├── Toolbar.tsx      # Bottom-center toolbar
│   │   ├── Header.tsx       # Top header with user avatars
│   │   ├── Cursor.tsx       # Remote cursor component
│   │   └── AuthPage.tsx     # Login/signup page
│   ├── stores/              # Zustand state management
│   │   ├── useUserStore.ts  # Auth and user profile
│   │   ├── useShapeStore.ts # Canvas shapes with locking
│   │   └── useCursorStore.ts # Cursor positions
│   ├── types/               # TypeScript definitions
│   │   ├── shape.ts         # Shape interfaces
│   │   ├── user.ts          # User interfaces
│   │   └── cursor.ts        # Cursor interfaces
│   ├── utils/               # Utility functions
│   │   ├── firebase.ts      # Firebase initialization
│   │   ├── colors.ts        # Color generation
│   │   └── throttle.ts      # Event throttling
│   ├── hooks/               # Custom React hooks
│   │   ├── useFirebaseSync.ts # Real-time sync logic
│   │   └── useCanvasControls.ts # Pan/zoom/scroll
│   ├── styles/              # CSS files
│   │   └── index.css        # Tailwind imports + global styles
│   ├── test/                # Test utilities
│   │   └── setup.ts         # Vitest configuration
│   ├── App.tsx              # Root component (routing logic)
│   └── main.tsx             # Entry point (React render)
├── tests/
│   ├── unit/                # Unit tests (203 tests)
│   │   ├── stores/          # Store tests
│   │   ├── utils/           # Utility tests
│   │   └── components/      # Component tests
│   └── integration/         # Integration tests (Firebase)
├── public/                  # Static assets (favicon, etc.)
├── memory-bank/            # Project documentation
├── .env.template           # Environment variable template
├── .env.local             # Local Firebase config (gitignored)
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── database.rules.json    # RTDB security rules
├── vercel.json            # Vercel configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- Git
- Firebase account (free tier sufficient for development)

### Environment Variables

Required in `.env.local`:
```bash
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_FIREBASE_DATABASE_URL=https://<your-project>.firebaseio.com
```

### Installation Steps

1. Clone repository
```bash
git clone <repo-url>
cd collab-canvas
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase project
   - Create project at https://console.firebase.google.com
   - Enable Authentication (Email/Password provider)
   - Create Firestore database (start in test mode)
   - Create Realtime Database (start in test mode)
   - Copy config to `.env.local`

4. Deploy security rules (production only)
```bash
firebase deploy --only firestore:rules
firebase deploy --only database:rules
```

5. Start dev server
```bash
npm run dev
```

6. Open http://localhost:5173

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server with HMR
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build locally

# Testing
npm test                 # Run all tests (unit + integration)
npm run test:unit        # Run unit tests only (203 tests)
npm run test:integration # Run Firebase integration tests
npm run test:ui          # Interactive test UI (browser-based)
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint check
npm run type-check       # TypeScript type checking (no emit)
```

## Firebase Configuration

### Firestore Collections

**`/shapes/{shapeId}`**
```typescript
{
  id: string;              // Auto-generated document ID
  type: 'rectangle';       // Shape type (only rectangles in v1.0)
  x: number;               // X position on canvas
  y: number;               // Y position on canvas
  width: number;           // Shape width
  height: number;          // Shape height
  rotation: number;        // Rotation angle in degrees
  color: string;           // Fill color (hex)
  lockedBy: string | null; // User ID if locked, null otherwise
  createdBy: string;       // User ID of creator
  createdAt: Timestamp;    // Creation timestamp
}
```

**`/users/{userId}`**
```typescript
{
  displayName: string;  // User's display name
  color: string;        // Assigned user color (hex)
  createdAt: Timestamp; // Account creation time
}
```

### Realtime Database Structure

```json
{
  "cursors": {
    "{userId}": {
      "x": 123.45,
      "y": 678.90
    }
  },
  "presence": {
    "{userId}": {
      "online": true,
      "lastSeen": 1234567890
    }
  }
}
```

### Security Rules

**Firestore** (`firestore.rules`):
- All authenticated users can read shapes and users
- Can only create/update shapes if not locked by another user
- Can only update own user profile

**Realtime DB** (`database.rules.json`):
- All authenticated users can read cursors and presence
- Can only write own cursor and presence data

## Technical Constraints

### Firebase Free Tier Limits
- **Firestore**: 50k reads, 20k writes, 20k deletes per day
- **RTDB**: 100 simultaneous connections, 1GB bandwidth/month
- **Auth**: Unlimited email/password auth

### Browser Compatibility
- Modern browsers only (ES2020+)
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- No IE11 support
- Canvas/WebGL required

### Performance Targets
- 60 FPS canvas rendering
- <50ms cursor latency
- <200ms shape sync latency
- 5-10 concurrent users without degradation

## Testing Strategy

### Unit Tests (203 passing)

**Store Tests** (Zustand)
- `useUserStore`: Auth state management
- `useShapeStore`: Shape CRUD, locking, selection
- `useCursorStore`: Cursor updates, remote tracking

**Utility Tests**
- Throttle function (50ms cursor updates)
- Color generation (deterministic user colors)
- Firebase helper functions

**Shape Logic Tests** (34 tests for manipulation)
- Hit zone detection (body, corners, edges, rotation zones)
- Resize calculations (corner, edge, smooth flipping)
- Rotation calculations (pivot around center)

### Integration Tests (Firebase)
- Firebase configuration validation
- Authentication service connectivity
- Firestore read/write operations
- Realtime Database connectivity

### Manual Testing Checklist
- [ ] Multi-browser collaboration (2+ windows)
- [ ] Shape creation, movement, resize, rotate
- [ ] Locking prevents concurrent edits
- [ ] Cursor tracking smooth and accurate
- [ ] Disconnect cleanup (cursors disappear)
- [ ] Pan/zoom/scroll controls
- [ ] Authentication flows (signup, login, logout)

## Build & Deployment

### Local Build
```bash
npm run build
# Output: dist/ directory (static files)
```

### Vercel Deployment

**Automatic Deployment**:
1. Push to `main` branch
2. GitHub webhook triggers Vercel
3. Vercel runs `npm run build`
4. Deploys to production URL

**Environment Variables** (Vercel Dashboard):
- Add all `VITE_FIREBASE_*` variables
- Same values as `.env.local`

**Production URL**: https://collab-canvas-ben-cohen.vercel.app/

### Firebase Security Rules Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Realtime DB rules
firebase deploy --only database:rules

# Deploy both
firebase deploy --only firestore:rules,database:rules
```

## Dependencies Management

### Core Dependencies
- React ecosystem (react, react-dom) - UI framework
- Konva ecosystem (konva, react-konva) - Canvas rendering
- Firebase (firebase) - Backend services
- Zustand (zustand) - State management
- Tailwind (tailwindcss) - Styling
- Lucide (lucide-react) - Icons

### Dev Dependencies
- Vite toolchain (@vitejs/plugin-react, vite)
- TypeScript toolchain (typescript, @types/*)
- Testing toolchain (vitest, @vitest/ui, @testing-library/*)
- Linting toolchain (eslint, @typescript-eslint/*)

### Version Pinning Strategy
- Use `^` for minor/patch updates (e.g., `^18.3.1`)
- Avoid major version updates without testing
- Run `npm outdated` periodically
- Update dependencies in dedicated PRs

## Known Technical Debt

1. **Cursor throttling**: Currently throttles at component level, should move to store
2. **Firestore batching**: Individual writes for shape updates, should batch
3. **Error boundaries**: No React error boundaries for graceful failures
4. **Offline support**: No offline queue for writes when disconnected
5. **Mobile optimization**: Not tested on mobile/tablet devices

## Development Workflow

1. **Feature branch**: Create from `main`
2. **Local development**: `npm run dev` with hot reload
3. **Write tests**: Add unit tests for new logic
4. **Type checking**: `npm run type-check` before commit
5. **Linting**: `npm run lint` before commit
6. **Test suite**: `npm test` passes
7. **Push to GitHub**: Triggers Vercel preview deployment
8. **Merge to main**: Deploys to production

## IDE Setup (Recommended)

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Vitest

- **Settings**:
  - Format on save enabled
  - ESLint auto-fix on save
  - TypeScript strict mode

