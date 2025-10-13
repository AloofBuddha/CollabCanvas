# CollabCanvas MVP - Task Checklist

## PR #1 - Project Initialization & Firebase Setup

* [ ] Initialize Vite + React + TypeScript project
* [ ] Install dependencies: react, react-dom, react-konva, zustand, firebase, tailwindcss, vitest
* [ ] Configure TailwindCSS
* [ ] Create Firebase project
* [ ] Enable Firestore, Realtime DB, Auth, Hosting in Firebase console
* [ ] Add Firebase SDK config (`src/utils/firebase.ts`)
* [ ] Verify project builds and runs on localhost

**Files Affected:**

* `package.json`
* `tsconfig.json`
* `vite.config.ts`
* `public/index.html`
* `src/main.tsx`
* `src/App.tsx`
* `src/utils/firebase.ts`

---

## PR #2 - Zustand Stores Setup

* [ ] Implement `useUserStore` (userId, displayName, color, online)
* [ ] Implement `useCursorStore` (localCursor, remoteCursors)
* [ ] Implement `useShapeStore` (shapes dictionary, add/update/remove methods)
* [ ] Define TypeScript types for Shape, Cursor, User in `src/types/index.ts`
* [ ] Add basic unit tests with Vitest (mock Firebase) for all stores

**Files Affected:**

* `src/stores/useUserStore.ts`
* `src/stores/useCursorStore.ts`
* `src/stores/useShapeStore.ts`
* `src/types/index.ts`
* `tests/unit/userStore.test.ts`
* `tests/unit/cursorStore.test.ts`
* `tests/unit/shapeStore.test.ts`

---

## PR #3 - Authentication with Firebase

* [ ] Implement Firebase Auth (email/password)
* [ ] Connect auth state to `useUserStore`
* [ ] Implement presence system in Realtime DB
* [ ] Update online status on login/logout
* [ ] Unit tests for auth and presence (mock Firebase)

**Files Affected:**

* `src/utils/firebase.ts`
* `src/stores/useUserStore.ts`
* `src/components/App.tsx`
* `src/components/AuthForm.tsx` (optional)

---

## PR #4 - Basic Canvas & Local Shape Rendering

* [ ] Add React Konva Stage + Layer in `Canvas.tsx`
* [ ] Implement rectangle creation using toolbar click+drag
* [ ] Implement rectangle dragging locally
* [ ] Show border on drag (user color)
* [ ] Add toolbar (bottom-center) with rectangle/select tools
* [ ] Unit tests for local shape creation and movement

**Files Affected:**

* `src/components/Canvas.tsx`
* `src/components/Toolbar.tsx`
* `src/stores/useShapeStore.ts`

---

## PR #5 - Cursor & Presence Rendering

* [ ] Display cursors with label (initials from displayName)
* [ ] Update cursor positions via Realtime DB
* [ ] Show avatars (top-right) for online users
* [ ] Ensure cursors vanish instantly on disconnect
* [ ] Throttle cursor updates (~20Hz)
* [ ] Unit tests for cursor store (mock Firebase)

**Files Affected:**

* `src/components/Cursor.tsx`
* `src/components/AvatarBar.tsx`
* `src/stores/useCursorStore.ts`
* `src/stores/useUserStore.ts`

---

## PR #6 - Real-Time Shape Sync

* [ ] Add Firestore CRUD for shapes (add/update/remove)
* [ ] Implement real-time listeners for Firestore shapes
* [ ] Sync shape drag/move events to Firestore
* [ ] Handle temporary lock during drag (`lockedBy`)
* [ ] Merge local + remote shapes correctly
* [ ] Unit tests for shape store with Firestore mocks

**Files Affected:**

* `src/stores/useShapeStore.ts`
* `src/components/Canvas.tsx`
* `src/utils/firebase.ts`

---

## PR #7 - Local Storage Persistence

* [ ] Save current shapes to localStorage on change
* [ ] Load shapes from localStorage on app start
* [ ] Merge with Firestore state on reconnect
* [ ] Unit tests for persistence logic

**Files Affected:**

* `src/stores/useShapeStore.ts`
* `src/utils/helpers.ts`

---

## PR #8 - UI Polish & Performance Tweaks

* [ ] Ensure toolbar positioned bottom-center
* [ ] Add subtle grid in canvas background
* [ ] Adjust Konva rendering for smooth dragging
* [ ] CSS/tailwind styling polish for minimal Figma feel
* [ ] Verify reasonable FPS (~60) on moderate load

**Files Affected:**

* `src/components/Toolbar.tsx`
* `src/components/AvatarBar.tsx`
* `src/components/Canvas.tsx`
* `src/styles/index.css`

---

## PR #9 - Unit Testing & Smoke Test

* [ ] Write unit tests for shape store (add/update/remove/lock)
* [ ] Write unit tests for cursor store (local/remote update, throttle)
* [ ] Write unit tests for user store (login/logout, presence)
* [ ] Manual multi-browser smoke tests (local and incognito)

**Files Affected:**

* `tests/unit/shapeStore.test.ts`
* `tests/unit/cursorStore.test.ts`
* `tests/unit/userStore.test.ts`
