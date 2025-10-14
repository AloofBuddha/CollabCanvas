# System Patterns: CollabCanvas

## Architecture Overview

CollabCanvas uses a **client-heavy, backend-light** architecture where the React frontend handles all business logic, state management, and rendering, while Firebase provides authentication, data storage, and real-time synchronization.

### High-Level Structure

```
Frontend (React SPA)
├── React Konva (Canvas Rendering)
├── Zustand Stores (State Management)
│   ├── useUserStore (auth, profile)
│   ├── useShapeStore (shapes, locking)
│   └── useCursorStore (cursors, presence)
└── Components (UI, Toolbar, Canvas)

Backend (Firebase)
├── Authentication (JWT tokens)
├── Firestore (persistent data)
│   ├── /shapes/{id} (rectangles)
│   └── /users/{id} (profiles)
└── Realtime DB (ephemeral data)
    ├── /cursors/{userId} (positions)
    └── /presence/{userId} (online status)
```

## Key Design Patterns

### 1. Persistent vs. Ephemeral Data Split

**Pattern**: Use two different databases for different data lifecycles

**Implementation**:
- **Firestore**: Shapes, user profiles (must survive sessions)
- **Realtime Database**: Cursors, presence (discarded on disconnect)

**Rationale**:
- Firestore offers better querying but higher latency (~200ms)
- RTDB offers lower latency (~50ms) and built-in `onDisconnect()` cleanup
- Cursors don't need persistence, only low-latency updates
- Shapes need transactions for locking, better suited to Firestore

### 2. Optimistic UI Updates

**Pattern**: Update local state immediately, sync to backend asynchronously

**Implementation**:
```typescript
// User drags shape
onDragMove(shape) {
  updateShapeLocally(shape);      // Immediate visual feedback
  syncShapeToFirestore(shape);    // Background sync
}
```

**Benefits**:
- Feels instant (no network latency perceived)
- User action never blocked by backend
- Conflicts prevented by locking mechanism

### 3. Collaborative Locking

**Pattern**: Optimistic lock acquisition with visual feedback

**Implementation**:
- Shape has `lockedBy: userId | null` field
- User selects shape → `lockedBy` set to their userId
- Other users see colored border matching locker's color
- Lock released on deselect or disconnect
- Firebase rules enforce lock (can't update if locked by another)

**Rationale**:
- Prevents concurrent edit conflicts
- Visual feedback clear (colored borders)
- No complex CRDT or operational transform needed
- Single writer at a time = simple consistency model

### 4. Inverse Scaling for UI Elements

**Pattern**: Scale UI elements inversely to canvas zoom to maintain constant screen size

**Implementation**:
```typescript
// Cursor rendered inside Konva with inverse scale
<Group x={cursor.x} y={cursor.y} scaleX={1/zoom} scaleY={1/zoom}>
  <Circle radius={8} fill={cursor.color} />
  <Text text={cursor.name} />
</Group>
```

**Benefits**:
- Cursors readable at any zoom level
- Dimension labels stay consistent size
- Selection borders maintain visual weight

### 5. Throttled Cursor Updates

**Pattern**: Limit cursor position writes to reduce Firebase load

**Implementation**:
- Mouse move events fire at 60+ Hz
- Throttle to 20 Hz (50ms) before writing to RTDB
- Use `throttle()` utility from lodash or custom implementation

**Benefits**:
- Reduces Firebase write costs by 66%+
- Still feels real-time (20 Hz plenty for cursor tracking)
- Prevents hitting Firebase rate limits

## Component Responsibilities

### Frontend Components

**Canvas Component**
- Renders Konva Stage with pan/zoom transforms
- Handles mouse events (click, drag, wheel)
- Delegates shape manipulation to shape components
- Manages canvas-level state (zoom, pan offset)

**Shape Components (e.g., Rectangle)**
- Renders individual shapes with Konva primitives
- Handles hit detection for manipulation zones
- Calculates resize/rotate transformations
- Displays dimension labels and selection borders

**Toolbar Component**
- Bottom-center positioned, Figma-style
- Icon buttons for tools (select, rectangle, etc.)
- Switches active tool in Zustand store
- Auto-switches to select after shape creation

**Header Component**
- Top-right positioned
- Displays online users as colored avatars (initials)
- Shows max 10 avatars + overflow count
- Links to logout

### Zustand Stores

**useUserStore**
- Purpose: Authentication state and user profile
- State: `userId`, `displayName`, `color`, `authStatus`
- Actions: `login()`, `signup()`, `logout()`, `setUser()`
- Persistence: Session-based (Firebase Auth SDK)

**useShapeStore**
- Purpose: Canvas shapes with locking
- State: `shapes` (dictionary by ID), `selectedShapeId`, `lockedShapes`
- Actions: `addShape()`, `updateShape()`, `removeShape()`, `lockShape()`, `selectShape()`
- Sync: Bidirectional with Firestore (onSnapshot listener)

**useCursorStore**
- Purpose: Real-time cursor positions
- State: `localCursor`, `remoteCursors` (dictionary by userId)
- Actions: `updateLocalCursor()`, `setRemoteCursor()`, `removeCursor()`
- Sync: Bidirectional with RTDB (onValue listener)

## Data Flow Patterns

### Shape Creation Flow
1. User clicks rectangle tool in toolbar
2. User drags on canvas
3. `onMouseDown` → create preview shape (local only)
4. `onMouseMove` → update preview dimensions (local only)
5. `onMouseUp` → finalize shape, write to Firestore
6. Firestore `onSnapshot` fires → other clients receive new shape
7. Auto-switch back to select tool

### Shape Selection & Lock Flow
1. User clicks shape body
2. Check if shape locked by another → if yes, ignore
3. Update `lockedBy` field in Firestore
4. Local store updates `selectedShapeId`
5. Render blue border around shape
6. Other clients' `onSnapshot` fires → render colored border
7. User deselects → `lockedBy` set to null, synced

### Shape Manipulation Flow
1. User hovers shape → cursor changes based on zone (resize, rotate)
2. User drags → detect manipulation type from zone
3. Calculate new position/dimensions/rotation
4. Update local shape immediately (optimistic)
5. Throttle Firestore updates (batch writes every 50-100ms)
6. Other clients receive updates via `onSnapshot`

### Cursor Tracking Flow
1. User moves mouse on canvas
2. `onMouseMove` event fires
3. Throttle to 50ms intervals
4. Write `{x, y}` to RTDB `/cursors/{userId}`
5. Other clients' `onValue` listener fires
6. Update remote cursor position in Zustand
7. Konva re-renders cursor with inverse scaling

### Presence & Disconnect Flow
1. User logs in → write to `/presence/{userId}: {online: true}`
2. Set up `onDisconnect()` handler → removes presence on disconnect
3. Also set up `onDisconnect()` for cursor cleanup
4. Other clients see presence updates
5. User closes tab → Firebase auto-triggers cleanup
6. Other clients' listeners fire → remove cursor, update header

## Key Technical Decisions

### Why React Konva over Canvas API?
- Declarative rendering (React-like)
- Built-in pan/zoom transforms
- Hardware-accelerated (WebGL fallback)
- Event handling abstraction
- Strong TypeScript support

### Why Zustand over Redux?
- Lightweight (1KB vs 20KB)
- No boilerplate (no actions, reducers, middleware)
- Simple hook-based API
- Easy to test (just functions)
- Good TypeScript inference

### Why Email/Password Auth?
- No OAuth setup complexity
- Privacy-first (no third-party data sharing)
- Works in all browsers without popup blockers
- Sufficient for MVP use case

### Why Firestore Rules over Backend API?
- No server to maintain
- Security enforced at database level
- Scales automatically with Firebase
- Declarative rule syntax
- Real-time updates built-in

### Why Middle-Click Pan over Hand Tool?
- Saves toolbar space
- Familiar pattern (CAD tools, 3D software)
- No tool switching needed
- Works well with trackpads (three-finger drag)

## Performance Optimizations

### Current Optimizations
1. **Throttled cursor writes**: 50ms (20 Hz) to RTDB
2. **Inverse scaling**: UI elements maintain constant size without recalculating geometry
3. **Optimistic updates**: Local state updates before Firebase sync
4. **onDisconnect handlers**: Automatic cleanup prevents stale data
5. **React.memo**: Prevent unnecessary re-renders of shape components

### Future Optimizations (When Needed)
1. **Batch shape updates**: Combine multiple Firestore writes into single transaction
2. **Viewport culling**: Only render/sync shapes in visible area
3. **Spatial partitioning**: Divide canvas into grid, sync only active cells
4. **Connection pooling**: Reuse Firebase connections across browser tabs
5. **WebWorkers**: Offload Firebase sync to background thread

## Testing Strategy

### Unit Tests (203 passing)
- Zustand stores: All actions and state transitions
- Utilities: Throttle, color generation, Firebase helpers
- Shape logic: Hit detection, resize math, rotation math
- Locking: Acquire, release, conflict prevention
- Authentication: Login, signup, logout flows

### Integration Tests
- Firebase connectivity (Auth, Firestore, RTDB)
- Anonymous auth for testing
- Real-time listener setup
- Security rules enforcement

### Manual Testing
- Multi-browser collaboration
- Disconnect handling
- Lock conflicts
- Performance under load (5-10 users)

## Security Model

### Firestore Rules
- Authenticated users can read all shapes
- Can only write shapes if not locked by another user
- Can only write own user profile

### RTDB Rules
- Authenticated users can read all presence/cursors
- Can only write own cursor/presence data

### Authentication
- Email/password only (no anonymous in production)
- JWT tokens issued by Firebase Auth
- Tokens auto-attached to database requests
- Session persistence in localStorage

## Error Handling Patterns

### Firebase Connection Errors
- Retry with exponential backoff
- Show offline indicator in UI
- Queue writes in localStorage, sync when back online

### Lock Conflicts
- Silent failure (don't show error, just prevent action)
- Visual feedback (colored border = "locked by someone else")
- User can try again after lock released

### Authentication Errors
- Show error message on login/signup forms
- Redirect to auth page if token invalid
- Clear local state on logout

## Deployment Architecture

```
GitHub (main branch)
  ↓ webhook
Vercel Platform
  ↓ build: npm run build
Production (Static SPA)
  ↓ HTTPS
Firebase Services
  ├── Authentication
  ├── Firestore
  └── Realtime Database
```

- Frontend: Vercel CDN (global edge network)
- Backend: Firebase multi-region (us-central1)
- Security rules deployed separately via Firebase CLI
- Environment variables managed in Vercel dashboard

