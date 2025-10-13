# CollabCanvas MVP - Product Requirements Document (PRD)

## 1. Overview

**Goal:** Build a real-time collaborative whiteboard MVP (minimal Figma-style) with multiple users editing a shared canvas simultaneously.

**Core Idea:** Users can create and move rectangles in real time, see each other’s cursors and presence, and have a smooth collaborative experience. Users must authenticate to access the canvas.

---

## 2. MVP Scope

**In Scope:**

* One shared canvas for all authenticated users
* Authentication via Firebase (email/password)
* Auth page for login/sign-up
* Real-time cursor and shape synchronization via Firebase
* Rectangle creation, selection, and movement
* User presence with colored cursors and avatar initials (derived from username)
* Toolbar UI mimicking minimal Figma aesthetics (bottom-center)
* Locking during drag/move
* Local storage persistence for state recovery
* Unit tests via Vitest

**Out of Scope:**

* Additional shapes (text, circles, lines)
* Permissions or roles beyond createdBy metadata
* Undo/redo
* Advanced performance optimization (FPS >60 is a goal, not MVP requirement)
* Integration/E2E tests

---

## 3. User Stories

1. Sign up with email/password or log in via auth page.
2. Create a rectangle using the toolbar and click+drag on canvas.
3. Move rectangles via drag, with real-time sync.
4. See other users’ cursors, names, and colors.
5. Active shape drag shows border in user's color.
6. Avatars (initials derived from username) displayed top-right for online users.
7. Disconnecting removes cursors instantly.
8. Canvas state persists and restores via Firestore + localStorage.

---

## 4. Technical Design

### 4.1 Architecture (Text Diagram)

```
Frontend: React + TypeScript + Konva
├── Zustand Stores
│   ├── useUserStore -> auth info + presence
│   ├── useCursorStore -> local + remote cursor positions
│   └── useShapeStore -> shapes synced with Firestore
├── Canvas Renderer: React Konva
├── Toolbar + UI Components (TailwindCSS, bottom-center)
├── Auth Page -> login/signup forms, validation, Firebase integration
└── Event Handlers -> dispatch actions to Zustand

Backend: Firebase
├── Firestore -> persistent shapes, user info
├── Realtime DB -> ephemeral cursors/presence
└── Auth -> email/password login
```

### 4.2 Firebase Data Model

**Firestore (Persistent)**

```
/canvas/state
  shapes: [
    {
      id: string,
      type: 'rectangle',
      x: number,
      y: number,
      width: number,
      height: number,
      color: string,
      createdBy: string,
      lockedBy: string | null
    }
  ]

/users/{userId}
  - displayName: string
  - color: string
```

**Realtime DB (Ephemeral)**

```
/presence/{userId}
  - cursor: { x: number, y: number }
  - online: true
```

### 4.3 Zustand Store Structure

```ts
// useUserStore
interface UserState {
  userId: string | null;
  displayName: string;
  color: string;
  online: boolean;
  authStatus: 'authenticated' | 'unauthenticated' | 'loading';
}

// useCursorStore
interface CursorState {
  localCursor: { x: number; y: number };
  remoteCursors: Record<string, { x: number; y: number; color: string; name: string }>;
}

// useShapeStore
interface Shape {
  id: string;
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdBy: string;
  lockedBy: string | null;
}
interface ShapeState {
  shapes: Record<string, Shape>;
  addShape: (shape: Shape) => void;
  updateShape: (shape: Shape) => void;
  removeShape: (id: string) => void;
}
```

---

## 5. UX & Interaction Specs

### Auth Page

* Full-screen modal or dedicated page before canvas access
* Fields: Email, Password, Display Name (on signup)
* Buttons: `Sign Up`, `Login`, `Logout` (after login)
* Validation: required fields, email format, password minimum length
* Error messages for failed login/sign-up
* Redirect to canvas after successful authentication

### Toolbar

* Positioned bottom-center, Figma-style
* Tools: `Select`, `Rectangle`
* Rectangle tool: click+drag to create preview rectangle, commit on mouseup

### Cursor & Presence

* Distinct user color for cursor + avatar
* Cursor label: initials derived from username in rounded rectangle
* Dragged shape shows border in user color
* Cursors vanish instantly on disconnect

### Canvas

* Fixed 5000x5000px virtual space
* Pan via spacebar or toolbar icon
* White background with subtle light-gray grid

### Avatars

* Top-right display of online users, initials derived from displayName

---

## 6. Implementation Phases

### Phase 1 – Core Canvas & Auth

* Render empty canvas for authenticated users only
* Implement auth page with email/password sign-up and login
* Save displayName and color in Firestore on signup
* Protect canvas routes from unauthenticated access

### Phase 2 – Core Canvas Interaction

* Create and move rectangles locally
* Implement locking visual feedback

### Phase 3 – Real-Time Collaboration

* Sync shapes and positions via Firestore
* Implement presence + cursors via Realtime DB
* Handle disconnect + cursor cleanup

### Phase 4 – UI & Persistence

* Add toolbar (bottom-center) and avatar bar
* Implement localStorage persistence

### Phase 5 – Unit Testing

* Unit tests for auth flow, shape logic, locks, and cursor throttling

---

## 7. Testing Plan

**Manual Tests:**

* Auth page: sign-up, login, logout flows
* Multi-user live updates
* Locking behavior and visual feedback
* Cursor disappearance on disconnect
* Canvas state persistence

**Automated Tests:**

* Unit tests using Vitest
* Auth store: sign-up, login, logout
* Shape creation, movement, and lock logic

---

## 8. Success Criteria

* Authenticated users only can access canvas
* Real-time sync with multiple users
* Accurate cursors and avatars
* Locking works smoothly with visual feedback
* Canvas state persists and restores on reload
* Stable performance under moderate load

---

## 9. Future Extensions

* Additional shapes (text, line, circle)
* Undo/redo
* Multi-canvas workspaces
* Role-based permissions
* Advanced performance optimization (FPS >60)
* AI Agent integration in v2

---

**Author:** Benjamin Cohen
**Version:** MVP v1.3
**Date:** Octob
