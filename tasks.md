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

## PR #9 - Rectangle Manipulation (Resize & Rotate) ✅

* [x] Implement corner resize (drag corners to resize diagonally)
* [x] Implement edge resize (drag edges to resize single axis)
* [x] Implement rotation from corner zones (30px hit areas outside shape)
* [x] Add dynamic cursors for manipulation zones (resize arrows, rotation)
* [x] Display dimension label below selected shape (width × height)
* [x] Hide dimension label during drag/rotation, show during resize
* [x] Rotate shapes around center point (not top-left)
* [x] Maintain opposite anchor during resize (smooth flipping)
* [x] Sync all manipulations to Firestore in real-time
* [x] Unit tests for manipulation logic (36 new tests, 203 total)
* [x] Manual test with zoom, pan, and multi-user scenarios

---

## PR #10 - Alt+Drag Shape Duplication ✅

* [x] Add Alt key state tracking with window event listeners
* [x] Create duplicate at original position on Alt+drag start
* [x] Drag original shape to new position (duplicate stays behind)
* [x] Works for both selected and unselected shapes
* [x] Sync duplicate to Firestore immediately on creation
* [x] Unit tests for duplication behavior (3 new tests, 204 total)
* [x] Manual test duplication in multi-user scenario

---

## Grade-Focused Enhancement Plan (4 Days to Completion)

**Current Grade: 44/100 (F)** | **Target: 70-75/100 (C/C+)** | **Stretch: 80+/100 (B)**

### Strategy:
1. **Days 1**: Build shape library + color editing (foundation for AI)
2. **Day 2**: Multi-select + keyboard shortcuts
3. **Days 2-3**: AI Canvas Agent (25 points available)
4. **Day 3**: Testing & performance validation
5. **Day 4**: Required deliverables (log + video)

---

## PR #11 - Circle/Ellipse Shape ⏳ NEXT

**Rubric Impact**: Section 2 (+1-2 pts), prepares for AI agent

* [ ] Create `Circle.tsx` component using Konva Circle/Ellipse
* [ ] Add circle tool to toolbar with icon
* [ ] Implement click-drag creation (corner-based, like rectangle)
* [ ] Support resize from corners/edges (maintains circular or elliptical shape)
* [ ] Support rotation (for consistency, though visually subtle for circles)
* [ ] Support drag to move
* [ ] Support color fill (will add color picker in PR #14)
* [ ] Dimension label (radiusX × radiusY or diameter)
* [ ] Update Firestore types to support `radiusX`, `radiusY` fields
* [ ] Sync circle operations to Firestore
* [ ] Respect locking mechanism (lock on selection, unlock on deselect)
* [ ] Unit tests for circle creation, resize, and manipulation (10-15 tests)
* [ ] Manual test with multi-user scenarios

---

## PR #12 - Line Shape ⏳

**Rubric Impact**: Section 2 (+1-2 pts), prepares for AI agent

* [ ] Create `Line.tsx` component using Konva Line
* [ ] Add line tool to toolbar with icon
* [ ] Implement two-point creation (click for start, drag for end)
* [ ] Endpoint manipulation (drag either end to resize/reposition)
* [ ] Support rotation implicitly via endpoints
* [ ] Support stroke color (when color picker added in PR #14)
* [ ] Support stroke width property (default: 2px)
* [ ] Update Firestore types to support `x1`, `y1`, `x2`, `y2`, `strokeWidth` fields
* [ ] Sync line operations to Firestore
* [ ] Respect locking mechanism
* [ ] Unit tests for line creation and endpoint dragging (8-12 tests)
* [ ] Manual test with multi-user scenarios

---

## PR #13 - Text Shape with Inline Editing ⏳

**Rubric Impact**: Section 2 (+2-3 pts), critical for AI agent ("create login form")

* [ ] Create `Text.tsx` component using Konva Text
* [ ] Add text tool to toolbar with icon
* [ ] Click-to-create: single click creates text box, enters edit mode
* [ ] Inline editing: double-click existing text to edit
* [ ] Edit mode: Show HTML input or textarea overlaid on canvas position
* [ ] Exit edit mode: Click outside or press Escape
* [ ] Support basic formatting: fontSize (default: 16px), fontFamily (default: Arial)
* [ ] Support text color (when color picker added in PR #14)
* [ ] Support drag to move (when not in edit mode)
* [ ] Support resize to adjust text box width (text wraps)
* [ ] Update Firestore types to support `text`, `fontSize`, `fontFamily`, `textColor` fields
* [ ] Sync text content and properties to Firestore
* [ ] Respect locking mechanism (lock when editing, unlock when done)
* [ ] Unit tests for text creation, editing, and sync (10-15 tests)
* [ ] Manual test multi-user text editing (prevent concurrent edit conflicts)

---

## PR #14 - Color Picker for Shape Fill ⏳

**Rubric Impact**: Section 3 Tier 1 feature (+2 pts)

* [ ] Add color picker UI component (use library like `react-color` or build simple custom)
* [ ] Show color picker when shape is selected (in toolbar or floating panel)
* [ ] Allow changing fill color for rectangles and circles
* [ ] Allow changing stroke color for lines
* [ ] Allow changing text color for text shapes
* [ ] Update shape color in Firestore immediately on change
* [ ] Support color presets (8-10 common colors for quick selection)
* [ ] Show "recent colors" (last 5 used colors)
* [ ] Sync color changes in real-time to all users
* [ ] Unit tests for color change logic (5-8 tests)
* [ ] Manual test multi-user color changes

---

## PR #15 - Multi-Select with Shift+Click ⏳

**Rubric Impact**: Section 2 (+2-3 pts), Section 3 potential

* [ ] Track multiple selected shape IDs in `useShapeStore`
* [ ] Implement shift+click to add/remove shapes from selection
* [ ] Visual feedback: all selected shapes show blue border
* [ ] Support dragging multiple shapes together (maintain relative positions)
* [ ] Support delete key to delete all selected shapes
* [ ] Update locking mechanism: lock all selected shapes on selection
* [ ] Prevent multi-select if any shape locked by another user
* [ ] Unlock all shapes on deselect (click canvas background)
* [ ] Show multi-select count indicator in UI (e.g., "3 shapes selected")
* [ ] Update Firestore to handle multi-shape operations efficiently
* [ ] Unit tests for multi-select logic (15-20 tests)
* [ ] Manual test multi-user multi-select scenarios (conflicts, locking)

---

## PR #16 - Additional Keyboard Shortcuts ⏳

**Rubric Impact**: Section 3 Tier 1 feature (+2 pts)

* [ ] Arrow keys: Nudge selected shape(s) by 1px in direction
* [ ] Shift+Arrow keys: Nudge by 10px (coarse movement)
* [ ] Cmd/Ctrl+D: Duplicate selected shape(s) (alternative to alt+drag)
* [ ] Escape: Deselect all shapes
* [ ] Cmd/Ctrl+A: Select all shapes on canvas
* [ ] Delete/Backspace: Delete selected shape(s) (already works, ensure consistency)
* [ ] Document all shortcuts in a help panel or README
* [ ] Unit tests for keyboard shortcut handlers (8-10 tests)
* [ ] Manual test shortcuts with multi-user scenarios

---

## PR #17 - AI Canvas Agent 🤖 CRITICAL (25 POINTS)

**Rubric Impact**: Section 4 (25 pts total, target 15-18 pts = Good tier)

### Phase 1: Infrastructure (Day 2 evening)
* [ ] Choose AI provider (OpenAI GPT-4, Anthropic Claude, or Google Gemini)
* [ ] Set up API integration with secure key management
* [ ] Create AI service module (`src/services/aiAgent.ts`)
* [ ] Design prompt structure for canvas operations
* [ ] Add AI command input UI (bottom toolbar or floating panel)
* [ ] Show loading state while AI processes command

### Phase 2: Command Implementation (Day 3 morning)
**Target: 8+ commands across all categories**

**Creation Commands (2-3 required)**
* [ ] "Create a [color] [shape] at position X, Y"
* [ ] "Add a text that says '[text]' at [position]"
* [ ] "Make a [width]x[height] rectangle"

**Manipulation Commands (2-3 required)**
* [ ] "Move [shape identifier] to [position/direction]"
* [ ] "Change the color of [shape] to [color]"
* [ ] "Resize [shape] to [dimensions]"
* [ ] "Rotate [shape] [degrees] degrees"

**Layout Commands (2 required)**
* [ ] "Arrange [shapes] in a horizontal/vertical row"
* [ ] "Create a grid of [n]x[m] [shapes]"
* [ ] "Center [shape] on the canvas"
* [ ] "Distribute [shapes] evenly"

**Complex Commands (2 required)**
* [ ] "Create a login form" → username field, password field, submit button, title
* [ ] "Build a navigation bar with [n] menu items"
* [ ] "Make a card layout with title, description, and image placeholder"
* [ ] "Create a button with label [text]"

### Phase 3: AI Performance & UX (Day 3 afternoon)
* [ ] Parse AI response to extract canvas operations
* [ ] Execute operations atomically (all or nothing for complex commands)
* [ ] Target sub-3 second response times
* [ ] Show AI thinking indicator with progress
* [ ] Handle errors gracefully (show user-friendly message)
* [ ] Support natural language variations (synonyms, informal language)
* [ ] Log AI commands and success rate for debugging

### Phase 4: Multi-User AI (Day 3 evening)
* [ ] Ensure AI-created shapes sync immediately to Firestore
* [ ] Handle concurrent AI commands from multiple users
* [ ] Show attribution (who triggered AI command) in shape metadata
* [ ] Test with 2+ users issuing AI commands simultaneously
* [ ] Prevent AI conflicts with locking mechanism

### Phase 5: Testing & Refinement
* [ ] Unit tests for AI service parsing logic (10-15 tests)
* [ ] Integration tests for AI command execution (5-8 tests)
* [ ] Test all 8+ commands with various phrasings
* [ ] Measure command accuracy (target 80%+)
* [ ] Measure response times (target <3 seconds)
* [ ] Document AI capabilities in README

---

## PR #18 - Testing & Performance Validation 📊

**Rubric Impact**: Section 1 (+3-5 pts), Section 2 (+2-3 pts)

### Conflict Resolution Testing (Section 1: +3 pts)
* [ ] Test simultaneous move: Two users drag same shape → verify consistent final state
* [ ] Test rapid edit storm: User A resizes, User B changes color, User C moves → no corruption
* [ ] Test delete vs edit: User A deletes while User B edits → verify clean resolution
* [ ] Test create collision: Two users create shapes at same time → both persist
* [ ] Document conflict resolution strategy in architecture.md
* [ ] Fix any identified issues

### Persistence & Reconnection Testing (Section 1: +2 pts)
* [ ] Test mid-operation refresh: Drag shape, refresh browser → position preserved
* [ ] Test total disconnect: All users leave, wait 2 min, return → canvas intact
* [ ] Test network simulation: Throttle to 0 for 30s, restore → syncs without loss
* [ ] Add connection status UI indicator (online/offline badge)
* [ ] Consider implementing offline queue for writes

### Performance Testing (Section 2: +2-3 pts)
* [ ] Add FPS monitoring overlay (show current FPS in corner)
* [ ] Test with 100+ shapes on canvas → measure performance
* [ ] Test with 300+ shapes → document results
* [ ] Test with 5+ concurrent users → measure latency and performance
* [ ] Profile bottlenecks (Firebase latency, rendering, event handlers)
* [ ] Optimize if needed (viewport culling, batch updates)
* [ ] Document performance results in progress.md

---

## PR #19 - Export Canvas as PNG 📸 (Optional Tier 1 Feature)

**Rubric Impact**: Section 3 Tier 1 (+2 pts) - Quick win if time permits

* [ ] Add "Export" button to toolbar
* [ ] Use Konva's `toDataURL()` to generate PNG from canvas
* [ ] Download PNG with filename `collab-canvas-{timestamp}.png`
* [ ] Export entire canvas or visible viewport (configurable)
* [ ] Unit test export logic (2-3 tests)
* [ ] Manual test export quality

---

## PR #20 - Undo/Redo System 🔄 (Optional Tier 1 Feature)

**Rubric Impact**: Section 3 Tier 1 (+2 pts) - High value but complex

* [ ] Implement operation history stack in Zustand
* [ ] Track operations: create, delete, move, resize, rotate, color change
* [ ] Cmd/Ctrl+Z: Undo last operation
* [ ] Cmd/Ctrl+Shift+Z: Redo last undone operation
* [ ] Sync undo/redo with Firestore (tricky with multi-user)
* [ ] Show undo/redo indicators in UI
* [ ] Unit tests for history stack (10-15 tests)
* [ ] Multi-user undo considerations (document limitations)

---

## Required Deliverables - Day 4 📋

### AI Development Log (Required for Pass - Day 4 morning)
* [ ] Write 2-3 page reflection covering 3 of 5 sections:
  * Tools & Workflow (Cursor AI, Claude, GitHub Copilot usage)
  * Effective prompting strategies (3-5 examples with outcomes)
  * Code analysis (estimate % AI-generated vs hand-written)
  * Strengths & limitations (where AI excelled, where it struggled)
  * Key learnings (insights about AI pair programming)

### Demo Video (Required - Day 4 afternoon)
* [ ] Record 3-5 minute video demonstrating:
  * Real-time collaboration (show 2+ browser windows side-by-side)
  * Create shapes, manipulate, change colors
  * Multi-select and group operations
  * 5-8 AI commands executing (creation, manipulation, layout, complex)
  * Advanced features (keyboard shortcuts, export, etc.)
  * Brief architecture explanation (React Konva, Firebase, Zustand)
* [ ] Ensure clear audio and video quality
* [ ] Upload to YouTube or Loom
* [ ] Add link to README

---

## Projected Final Grade Breakdown

**With Core Plan (PRs #11-17 + Deliverables):**
- Section 1: 22-24/30 (conflict tests + connection status)
- Section 2: 15-17/20 (4 shapes, multi-select, 300+ shapes tested)
- Section 3: 8-10/15 (3-4 Tier 1 features: color picker, keyboard shortcuts, multi-select)
- Section 4: 15-18/25 (8 commands, good execution, multi-user works)
- Section 5: 8/10 (solid architecture + security)
- Section 6: 5/5 (docs + deployment)
- **Estimated Total: 73-82/100 = C to B-**

**With Optional PRs (#19-20):**
- Section 3: +4 pts (export + undo/redo) → 12-14/15
- **Stretch Total: 80-86/100 = B to B+**

**Bonus Points Opportunities (+5 max):**
- Polish (+2): Smooth animations, professional UI
- Scale (+1): 500+ shapes or 10+ users tested
- Innovation (+2): Novel AI features (design suggestions, smart layouts)
- **Potential Total: 85-91/100 = B+ to A-**
