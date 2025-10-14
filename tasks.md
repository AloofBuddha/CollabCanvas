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
* [x] Add toolbar (bottom-center) with rectangle/select tools
* [x] Unit tests for local shape creation, movement, and panning
* [x] Manual test rectangle creation and dragging
* [x] Implement mouse/wheel canvas controls (middle-click pan, wheel scroll, ctrl+wheel zoom)
* [x] Auto-switch to select tool after creating rectangle
* [x] Implement contextual cursors (pointer, crosshair, grabbing)
* [x] Document-level mouse listeners for smooth panning outside window

---

## PR #5 - Cursor & Presence Rendering ✅

* [x] Display remote cursors with users full name and color
* [x] Sync cursor positions via Realtime DB
* [x] Show avatars for online users at top-right
* [x] Ensure cursors disappear instantly on disconnect
* [x] Throttle cursor updates (~20Hz = 50ms)
* [x] Unit tests for cursor store, throttle, and presence updates
* [x] Firebase Realtime DB integration complete
* [x] Manual test multi-user cursors and disconnect handling

---

## PR #6 - Shape Selection & Deletion ✅

* [x] Implement shape selection with light blue border on click
* [x] Clicking canvas background deselects current shape
* [x] Add keyboard listener for Delete key
* [x] Delete selected shape when Delete key is pressed
* [x] Add selectedShapeId state to track selected shape
* [x] Ensure selection border only shows when shape is selected (not dragging)
* [x] Add removeShape function call on delete
* [x] Unit tests for shape selection logic
* [x] Unit tests for keyboard deletion
* [x] Manual test selection and deletion across multiple shapes

---

## PR #7 - Real-Time Shape Sync

* [ ] Add Firestore CRUD for shapes (add/update/remove)
* [ ] Implement real-time listeners for Firestore shapes
* [ ] Sync shape drag/move events to Firestore
* [ ] Handle temporary lock during drag (`lockedBy`)
* [ ] Merge local and remote shapes correctly
* [ ] Unit tests with Firestore mocks
* [ ] Manual test multi-user shape sync, drag locks, and updates

---

## PR #8 - Local Storage Persistence

* [ ] Save shapes to localStorage on change
* [ ] Load shapes from localStorage on app start
* [ ] Merge localStorage state with Firestore on reconnect
* [ ] Unit tests for persistence logic
* [ ] Manual test reload and state restoration

---

## PR #9 - UI Polish & Performance Tweaks

* [ ] Ensure toolbar positioned bottom-center
* [ ] Add subtle grid background to canvas
* [ ] Adjust Konva rendering for smooth dragging
* [ ] CSS/Tailwind styling polish for minimal Figma feel
* [ ] Verify FPS (~60) under moderate load
* [ ] Manual test toolbar, grid, and dragging performance

---

## PR #10 - Unit Testing & Smoke Test

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
