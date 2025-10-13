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

## PR #2 - Zustand Stores Setup ✅

* [x] Implement `useUserStore` (userId, displayName, color, online, authStatus)
* [x] Implement `useCursorStore` (localCursor, remoteCursors)
* [x] Implement `useShapeStore` (shapes dictionary, add/update/remove methods)
* [x] Define TypeScript types for Shape, Cursor, User
* [x] Unit tests for all stores using Vitest
* [x] Verify store state updates correctly on local actions

---

## PR #3 - Authentication & Auth Page ✅

* [x] Create login/signup Auth page/component
* [x] Add input fields: email, password, displayName (signup)
* [x] Add validation: required fields, email format, password min length
* [x] Display validation errors and login/signup errors
* [x] Implement Firebase Auth for login/signup
* [x] Connect auth state to `useUserStore`
* [x] Save displayName and color in Firestore on signup
* [x] Implement logout functionality
* [x] Protect canvas route for authenticated users only
* [x] Unit tests for login, signup, logout, store updates, route protection
* [x] Manual test login, signup, logout flows across browsers

---

## PR #4 - Basic Canvas & Local Shape Rendering ✅

* [x] Add React Konva Stage and Layer
* [x] Implement rectangle creation using toolbar click+drag
* [x] Implement local rectangle dragging
* [x] Selection system: light blue border on select, disappears during drag
* [x] Add toolbar (bottom-center) with rectangle/select tools
* [x] Unit tests for local shape creation, movement, selection, and panning
* [x] Manual test rectangle creation and dragging
* [x] Implement mouse/wheel canvas controls (middle-click pan, wheel scroll, ctrl+wheel zoom)
* [x] Auto-switch to select tool after creating rectangle
* [x] Implement contextual cursors (pointer, crosshair, grabbing)
* [x] Auto-select newly created rectangles
* [x] Fixed coordinate system for panning (use getRelativePointerPosition)
* [x] Document-level mouse listeners for smooth panning outside window
* [x] Comprehensive test coverage (109 tests passing)

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

---

## Future Enhancements

### Multi-Select Feature
* [ ] Implement translucent selection box on canvas drag
* [ ] Detect shapes within selection box
* [ ] Support multi-shape selection state
* [ ] Allow group dragging of selected shapes
* [ ] Clear selection on click outside
* [ ] Unit tests for multi-select logic
