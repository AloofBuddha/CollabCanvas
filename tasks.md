# CollabCanvas MVP - Task Checklist

## PR #1 - Project Initialization & Firebase Setup ✅

* [x] Initialize Vite + React + TypeScript project
* [x] Install dependencies: react, react-dom, react-konva, zustand, firebase, tailwindcss, vitest
* [x] Configure TailwindCSS
* [x] Create Firebase project
* [x] Enable Firestore, Realtime DB, Auth, Hosting in Firebase console
* [x] Add Firebase SDK config (`src/utils/firebase.ts`)
* [x] Verify project builds and runs on localhost

---

## PR #2 - Zustand Stores Setup

* [ ] Implement `useUserStore` (userId, displayName, color, online, authStatus)
* [ ] Implement `useCursorStore` (localCursor, remoteCursors)
* [ ] Implement `useShapeStore` (shapes dictionary, add/update/remove methods)
* [ ] Define TypeScript types for Shape, Cursor, User
* [ ] Unit tests for all stores using Vitest
* [ ] Verify store state updates correctly on local actions

---

## PR #3 - Authentication & Auth Page

* [ ] Create login/signup Auth page/component
* [ ] Add input fields: email, password, displayName (signup)
* [ ] Add validation: required fields, email format, password min length
* [ ] Display validation errors and login/signup errors
* [ ] Implement Firebase Auth for login/signup
* [ ] Connect auth state to `useUserStore`
* [ ] Save displayName and color in Firestore on signup
* [ ] Implement logout functionality
* [ ] Protect canvas route for authenticated users only
* [ ] Unit tests for login, signup, logout, store updates, route protection
* [ ] Manual test login, signup, logout flows across browsers

---

## PR #4 - Basic Canvas & Local Shape Rendering

* [ ] Add React Konva Stage and Layer
* [ ] Implement rectangle creation using toolbar click+drag
* [ ] Implement local rectangle dragging
* [ ] Show rectangle border in user color during drag
* [ ] Add toolbar (bottom-center) with rectangle/select tools
* [ ] Unit tests for local shape creation and movement
* [ ] Manual test rectangle creation and dragging

---

## PR #5 - Cursor & Presence Rendering

* [ ] Display cursors with user initials label
* [ ] Sync cursor positions via Realtime DB
* [ ] Show avatars for online users at top-right
* [ ] Ensure cursors disappear instantly on disconnect
* [ ] Throttle cursor updates (~20Hz)
* [ ] Unit tests for cursor store and presence updates
* [ ] Manual test multi-user cursors and disconnect handling

---

## PR #6 - Real-Time Shape Sync

* [ ] Add Firestore CRUD for shapes (add/update/remove)
* [ ] Implement real-time listeners for Firestore shapes
* [ ] Sync shape drag/move events to Firestore
* [ ] Handle temporary lock during drag (`lockedBy`)
* [ ] Merge local and remote shapes correctly
* [ ] Unit tests with Firestore mocks
* [ ] Manual test multi-user shape sync, drag locks, and updates

---

## PR #7 - Local Storage Persistence

* [ ] Save shapes to localStorage on change
* [ ] Load shapes from localStorage on app start
* [ ] Merge localStorage state with Firestore on reconnect
* [ ] Unit tests for persistence logic
* [ ] Manual test reload and state restoration

---

## PR #8 - UI Polish & Performance Tweaks

* [ ] Ensure toolbar positioned bottom-center
* [ ] Add subtle grid background to canvas
* [ ] Adjust Konva rendering for smooth dragging
* [ ] CSS/Tailwind styling polish for minimal Figma feel
* [ ] Verify FPS (~60) under moderate load
* [ ] Manual test toolbar, grid, and dragging performance

---

## PR #9 - Unit Testing & Smoke Test

* [ ] Unit tests for shape store (add/update/remove/lock)
* [ ] Unit tests for cursor store (local/remote update, throttle)
* [ ] Unit tests for user store (login/logout, presence, authStatus)
* [ ] Manual multi-browser smoke tests: login, canvas, shapes, cursors, persistence
