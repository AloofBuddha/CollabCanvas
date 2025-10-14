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

## PR #7 - Real-Time Shape Sync ✅

* [x] Add Firestore CRUD for shapes (add/update/remove)
* [x] Implement real-time listeners for Firestore shapes
* [x] Sync shape drag/move events to Firestore
* [x] Handle temporary lock during drag (`lockedBy`)
* [x] Merge local and remote shapes correctly
* [x] Unit tests for shape store locking and setShapes
* [x] Visual feedback: colored borders for remote-locked shapes
* [x] Prevent dragging shapes locked by other users
* [x] Prevent stealing locks from other users
* [x] Fix remote cursor positioning for zoom/pan
* [x] Render cursors inside Konva Layer for proper transformation
* [x] Remote cursors maintain constant size during zoom (inverse scaling)
* [x] Extract Header component with online user presence (max 10 visible + overflow)
* [x] Manual test multi-user shape sync, drag locks, and updates

---

## PR #8 - Deployment & Production Setup ✅

* [x] Create production Firebase environment variables
* [x] Configure Vercel project
* [x] Set up environment variables in Vercel dashboard
* [x] Configure build settings (npm run build)
* [ ] Set up custom domain (optional)
* [x] Deploy to Vercel
* [x] Verify Firebase services work in production
* [x] Test authentication flow in production
* [x] Test real-time collaboration with multiple users
* [x] Document deployment process in README
* [x] Deploy Firebase security rules (Firestore + Realtime DB)
* [x] Fix Realtime Database permission issues
* [x] Update README with production URL: https://collab-canvas-ben-cohen.vercel.app/

---

## MVP Checkpoint ✅

**Core Requirements:**
- [x] Basic canvas with pan/zoom (middle-click pan, wheel scroll, Ctrl+wheel zoom)
- [x] At least one shape type (rectangle with drag functionality)
- [x] Ability to create and move objects
- [x] Real-time sync between 2+ users via Firestore
- [x] Multiplayer cursors with name labels and colors
- [x] Presence awareness (who's online in header)
- [x] User authentication (email/password signup/login with profiles)
- [x] Deployed and publicly accessible (Vercel + Firebase)

**🎉 Live at: https://collab-canvas-ben-cohen.vercel.app/**

**Test Coverage:**
- [x] 146 unit tests across 10 test suites
- [x] All core stores tested (user, cursor, shape)
- [x] Authentication and validation tested
- [x] Firebase presence and locking logic tested

---

## Future Enhancements

### Additional Shape Types
* [ ] Implement circle/ellipse shape creation
* [ ] Implement line/arrow shape creation
* [ ] Implement text shape with inline editing
* [ ] Add shape type selector to toolbar

### Shape Manipulation
* [ ] Resize shapes with corner/edge handles
* [ ] Rotate shapes with rotation handle
* [ ] Alt+drag to duplicate shapes
* [ ] Display shape dimensions in label below selected shape

### Selection Features
* [ ] Multiple selection with Shift+click
* [ ] Drag-to-select rectangle (translucent selection box)
* [ ] Group move for multi-selected shapes
* [ ] Delete multiple shapes at once

### Properties Panel
* [ ] Right-aligned properties panel (visible when shape selected)
* [ ] Editable position (X, Y coordinates)
* [ ] Editable rotation angle
* [ ] Color picker for fill color
* [ ] Opacity slider (0-100%)
* [ ] Width/height inputs for dimensions

### Layers Panel
* [ ] Left-aligned layers panel
* [ ] List all shapes with names/icons
* [ ] Drag-n-drop to reorder shape z-index
* [ ] Show/hide layer visibility toggle
* [ ] Lock/unlock layers for editing

### Performance & Architecture
* [ ] **Clarify "persistence layer" requirement** - Local storage backup? Session restore?
* [ ] **Clarify "refresh mid-edit" requirement** - Should maintain position/selection on reload?
* [ ] **Measure and optimize for 60 FPS goal:**
  * Set up FPS monitoring/profiling
  * Identify bottlenecks (Firebase latency? Rendering?)
  * Evaluate Firebase Realtime DB performance limits
  * Consider Firebase paid tier for higher throughput
  * Consider optimistic updates for better perceived performance
  * Evaluate batching shape updates vs individual writes

### UX Improvements
* [ ] Add subtle grid background to canvas
* [ ] Keyboard shortcuts (Cmd/Ctrl+D duplicate, Cmd/Ctrl+Z undo)
* [ ] Context menu (right-click) for shape actions
* [ ] Snap-to-grid functionality
* [ ] Export/import canvas state (JSON)
* [ ] Anonymous guest access for quick testing
