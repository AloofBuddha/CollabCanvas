# CollabCanvas Architecture

## System Overview

CollabCanvas is a real-time collaborative whiteboard application with a clear separation between persistent data (shapes) and ephemeral data (cursors/presence). The architecture leverages Firebase services for backend infrastructure while maintaining a stateless frontend deployed on Vercel.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Development & Deployment"
        GIT[GitHub Repository]
        VERCEL[Vercel Platform]
        GIT -->|Push to main| VERCEL
    end

    subgraph "Firebase Services"
        AUTH[Firebase Authentication]
        FIRESTORE[(Firestore Database)]
        RTDB[(Realtime Database)]
        RULES[Security Rules]
        
        RULES -.->|Enforce| FIRESTORE
        RULES -.->|Enforce| RTDB
    end

    subgraph "Client 1"
        APP1[React SPA]
        ZUSTAND1[Zustand Stores]
        KONVA1[Konva Canvas]
        
        APP1 --> ZUSTAND1
        ZUSTAND1 --> KONVA1
    end

    subgraph "Client 2"
        APP2[React SPA]
        ZUSTAND2[Zustand Stores]
        KONVA2[Konva Canvas]
        
        APP2 --> ZUSTAND2
        ZUSTAND2 --> KONVA2
    end

    subgraph "Client N"
        APPN[React SPA]
        ZUSTANDN[Zustand Stores]
        KONVAN[Konva Canvas]
        
        APPN --> ZUSTANDN
        ZUSTANDN --> KONVAN
    end

    VERCEL -->|Serves| APP1
    VERCEL -->|Serves| APP2
    VERCEL -->|Serves| APPN

    APP1 <-->|Auth Token| AUTH
    APP2 <-->|Auth Token| AUTH
    APPN <-->|Auth Token| AUTH

    APP1 <-->|Shapes Sync| FIRESTORE
    APP2 <-->|Shapes Sync| FIRESTORE
    APPN <-->|Shapes Sync| FIRESTORE

    APP1 <-->|Cursors/Presence| RTDB
    APP2 <-->|Cursors/Presence| RTDB
    APPN <-->|Cursors/Presence| RTDB

    style FIRESTORE fill:#4285f4,stroke:#333,stroke-width:2px,color:#fff
    style RTDB fill:#ffca28,stroke:#333,stroke-width:2px,color:#000
    style AUTH fill:#f4511e,stroke:#333,stroke-width:2px,color:#fff
    style VERCEL fill:#000,stroke:#333,stroke-width:2px,color:#fff
```

## Component Responsibilities

### Frontend (React + TypeScript)

**React SPA**
- Single-page application built with Vite
- Handles UI rendering, user interactions, and local state
- Hosted on Vercel with automatic deployments from GitHub

**Zustand Stores**
- `useUserStore`: User authentication state and profile
- `useShapeStore`: Local shape data synced with Firestore
- `useCursorStore`: Cursor positions and presence data

**React Konva**
- Canvas rendering engine for shapes and cursors
- Handles pan/zoom, shape manipulation, and visual feedback
- Optimized for 60 FPS with inverse scaling for constant-size elements

### Backend (Firebase)

**Firebase Authentication**
- Email/password authentication
- Issues JWT tokens for authenticated requests
- Tokens automatically attached to Firestore/RTDB requests

**Firestore Database** (Persistent Data)
- `shapes` collection: Rectangle data (position, size, rotation, color, locks)
- `users` collection: User profiles (display name, color)
- Real-time listeners for live collaboration
- Optimistic updates with eventual consistency

**Realtime Database** (Ephemeral Data)
- `cursors/{userId}`: Current cursor position (x, y)
- `presence/{userId}`: Online status with heartbeat
- Low-latency updates (~50ms throttle)
- Automatic cleanup on disconnect

**Security Rules**
- Deployed via Firebase CLI (`firebase deploy --only firestore:rules,database:rules`)
- Firestore: Authenticated users can read all shapes, write only unlocked shapes
- RTDB: Authenticated users can read all presence, write only their own cursor/presence

### Deployment Pipeline

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Vercel as Vercel Platform
    participant User as End User

    Dev->>Git: git push origin main
    Git->>Vercel: Webhook trigger
    Vercel->>Vercel: Build (npm run build)
    Vercel->>Vercel: Deploy to production
    Vercel-->>Dev: Deployment notification
    User->>Vercel: HTTPS request
    Vercel->>User: Serve React SPA
```

## Data Flow Patterns

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant AUTH as Firebase Auth
    participant FS as Firestore
    participant RTDB as Realtime DB

    C->>AUTH: signInWithEmailAndPassword()
    AUTH-->>C: User + JWT Token
    C->>FS: Initialize with token
    C->>RTDB: Initialize with token
    C->>FS: Listen to shapes collection
    C->>RTDB: Listen to cursors & presence
    FS-->>C: Initial shape data
    RTDB-->>C: Online users & cursors
```

### Shape Creation & Sync

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant FS as Firestore
    participant C2 as Client 2
    participant C3 as Client 3

    C1->>C1: User creates rectangle
    C1->>FS: addDoc(shapes, newShape)
    FS-->>C1: Shape ID
    C1->>C1: Update local Zustand store
    FS->>C2: onSnapshot: new shape
    FS->>C3: onSnapshot: new shape
    C2->>C2: Update local store & render
    C3->>C3: Update local store & render
```

### Shape Locking (Conflict Prevention)

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant FS as Firestore
    participant C2 as Client 2

    C1->>C1: Select shape
    C1->>FS: updateDoc(shapeId, {lockedBy: userId1})
    FS-->>C2: onSnapshot: shape locked
    C2->>C2: Show colored border, disable editing
    C1->>C1: Edit shape (drag, resize, rotate)
    C1->>FS: updateDoc(shapeId, newPosition)
    FS-->>C2: onSnapshot: shape updated
    C2->>C2: Render updated shape
    C1->>FS: updateDoc(shapeId, {lockedBy: null})
    FS-->>C2: onSnapshot: shape unlocked
```

### Cursor Tracking

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant RTDB as Realtime DB
    participant C2 as Client 2

    loop Every 50ms (throttled)
        C1->>C1: Mouse move
        C1->>RTDB: set(cursors/user1, {x, y})
        RTDB-->>C2: onValue: cursor update
        C2->>C2: Render remote cursor
    end

    C1->>C1: User closes tab
    RTDB->>RTDB: onDisconnect() trigger
    RTDB->>RTDB: remove(cursors/user1)
    RTDB-->>C2: onValue: cursor removed
    C2->>C2: Remove remote cursor
```

## Key Design Decisions

### Persistent vs. Ephemeral Data Split

**Why Firestore for shapes?**
- Shapes must persist across sessions
- Complex queries and indexing needed
- Transactional updates for locking mechanism
- Better suited for structured, relational data

**Why Realtime DB for cursors?**
- Cursors are ephemeral (no persistence needed)
- Lower latency than Firestore (~50ms vs ~200ms)
- Simple key-value structure
- Built-in `onDisconnect()` for automatic cleanup

### Locking Strategy

**Optimistic UI Updates**
- User sees immediate feedback on their actions
- Backend sync happens in background
- Conflicts prevented by `lockedBy` field

**Lock Lifecycle**
1. User selects shape → Lock acquired
2. User edits shape → Updates synced to Firestore
3. User deselects or closes tab → Lock released
4. Other users see colored border when locked

### Performance Optimizations

- **Throttled cursor updates**: 50ms (~20Hz) prevents excessive writes
- **Inverse scaling**: UI elements maintain constant size during zoom
- **Optimistic updates**: Local state updates immediately, sync in background
- **onDisconnect handlers**: Automatic cleanup prevents stale presence data

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | UI rendering and type safety |
| Build Tool | Vite | Fast development and optimized builds |
| State Management | Zustand | Lightweight, performant stores |
| Canvas Rendering | React Konva | Hardware-accelerated 2D graphics |
| Styling | TailwindCSS | Utility-first CSS framework |
| Authentication | Firebase Auth | User management and JWT tokens |
| Persistent Storage | Firestore | Shape data and user profiles |
| Ephemeral Storage | Realtime Database | Cursors and online presence |
| Hosting | Vercel | Static site hosting with CDN |
| Testing | Vitest | Unit and integration tests |

## Security Model

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users must be authenticated
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Shapes: Can only modify if not locked by another user
    match /shapes/{shapeId} {
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.lockedBy == null || 
         resource.data.lockedBy == request.auth.uid);
      allow delete: if request.auth != null &&
        (resource.data.lockedBy == null ||
         resource.data.lockedBy == request.auth.uid);
    }
    
    // Users: Can only write own profile
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Realtime Database Rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": false,
    "cursors": {
      "$userId": {
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "presence": {
      "$userId": {
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

## Scalability Considerations

### Current Limitations

- **Firestore writes**: ~1 write/second per user (shape updates)
- **RTDB writes**: ~20 writes/second per user (cursor updates)
- **Concurrent users**: No hard limit, scales with Firebase pricing tier

### Future Optimizations

- **Batch shape updates**: Combine multiple shape changes into single Firestore write
- **Cursor sampling**: Further reduce cursor update frequency for large rooms
- **Spatial partitioning**: Only sync shapes/cursors in viewport
- **Connection pooling**: Reuse Firebase connections across browser tabs

## Development Workflow

```mermaid
graph LR
    A[Local Development] -->|npm run dev| B[Vite Dev Server]
    B -->|Hot reload| C[Browser]
    C -->|API calls| D[Firebase Emulators]
    D -->|Test data| C
    
    A -->|npm test| E[Vitest]
    E -->|195 unit tests| F[Pass/Fail]
    E -->|9 integration tests| F
    
    A -->|git push| G[GitHub]
    G -->|Webhook| H[Vercel]
    H -->|Build + Deploy| I[Production]
    I -->|Live at| J[collab-canvas-ben-cohen.vercel.app]
```

## Monitoring & Debugging

- **Firebase Console**: Real-time database queries, auth logs, Firestore usage
- **Vercel Dashboard**: Deployment logs, analytics, performance metrics
- **Browser DevTools**: React DevTools, Konva layer inspection, network timing
- **Vitest Coverage**: 204 tests covering stores, hooks, utilities, Firebase integration

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Konva Documentation](https://konvajs.org/docs/react/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vercel Documentation](https://vercel.com/docs)

