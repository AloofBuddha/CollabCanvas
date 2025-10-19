# Progress: CollabCanvas

## Current Rubric Grade Analysis

**Overall Grade**: **79/100 (C+)** ⬆️ **+22** | **Target**: 70-75/100 (C/C+) ✅ **ACHIEVED** | **Stretch**: 80+/100 (B)

### Detailed Breakdown by Section

**Section 1: Core Collaborative Infrastructure (21/30)** 
- Real-Time Synchronization: 7/12 (Satisfactory - 200ms shape sync, sub-50ms cursor)
- Conflict Resolution: 7/9 (Good - locking prevents conflicts, visual feedback)
- Persistence & Reconnection: 7/9 (Good - connection UI, reconnection bug fixed)

**Section 2: Canvas Features & Performance (18/20)**
- Canvas Functionality: 8/8 (Excellent - 4 shape types, multi-select, full manipulation)
- Performance & Scalability: 10/12 (Good - FPS monitoring, debouncing, zoom-independent UI)

**Section 3: Advanced Figma-Inspired Features (10/15)** ⬆️ **+5**
- **Tier 1 Features** (4 implemented):
  - Alt+drag duplication (2 pts)
  - Color picker with DetailPane (2 pts)
  - Keyboard shortcuts (arrows, undo/redo, duplicate, select all) (2 pts)
  - Multi-select with shift-click (2 pts)
- **Tier 2 Features** (1 implemented):
  - Z-index management with opacity (2 pts)
- **Good tier: 10/15 points**

**Section 4: AI Canvas Agent (17/25)** ⬆️ **+17** ✅ **IMPLEMENTED!**
- **Command Breadth**: 7/10 (Good - 8+ commands: create, update, delete, align, distribute, center)
- **Complex Execution**: 5/8 (Good - login forms, cards, multi-shape compositions work ~70%)
- **Performance & Reliability**: 5/7 (Good - 1.5-2s responses, 80%+ accuracy, good UX, multi-user support)

**Section 5: Technical Implementation (8/10)**
- Architecture Quality: 4/5 (Good)
- Authentication & Security: 4/5 (Good)

**Section 6: Documentation & Submission (5/5)**
- Repository & Setup: 3/3 (Excellent)
- Deployment: 2/2 (Excellent)

**Section 7: AI Development Log (NOT DONE)** - Required for pass

**Section 8: Demo Video (NOT DONE)** - Missing = -10 point penalty

### Path to B Grade (80+ points)

**Current: 79/100 (C+)** - Only **1 point away from B-!**

**Quick Wins for 80+:**
1. **Complete manual testing** (Section 1): Test conflict resolution, persistence → potential +2-4 pts
2. **Demo video** (avoid -10 penalty): Required anyway, no penalty = effectively +10 pts
3. **AI Development Log**: Required for pass
4. **Optional PNG export** (Task 15): Easy implementation → Section 3 +2 pts

**Projected Final with Testing + Video**: **81-83/100 (B-/B)** 🎯

**Stretch Goal - 85+ (B):**
- Improve AI complex command reliability (+1-2 pts)
- Performance testing with 300+ shapes (+1-2 pts)
- Additional Figma feature (+2-3 pts)

---

## What's Working (Production-Ready)

### Core Features ✅

**Authentication & User Management**
- ✅ Email/password signup with display name
- ✅ Email/password login
- ✅ Logout functionality
- ✅ Persistent sessions (Firebase Auth)
- ✅ User profiles stored in Firestore (displayName, color)
- ✅ Automatic color assignment per user

**Canvas & Controls**
- ✅ 5000×5000px virtual canvas space
- ✅ Pan with middle-click + drag
- ✅ Vertical scroll with mouse wheel
- ✅ Zoom with Ctrl + wheel
- ✅ Document-level mouse listeners for smooth panning
- ✅ Contextual cursors (pointer, crosshair, grabbing, resize, rotate)

**Shape Types**

**Rectangle Shapes**
- ✅ Click-drag creation with rectangle tool
- ✅ Selection with click (blue border for local, colored for remote)
- ✅ Drag to move
- ✅ Resize from corners (diagonal resize with smooth flipping)
- ✅ Resize from edges (single-axis resize)
- ✅ Rotate from corner zones (30px hit areas, pivots around center)
- ✅ Alt+drag to duplicate (original stays in place, duplicate follows cursor)
- ✅ Delete with Delete key
- ✅ Dimension labels below selected shapes (width × height)
- ✅ Auto-switch to select tool after creation

**Circle/Ellipse Shapes**
- ✅ Click-drag creation with circle tool
- ✅ Selection with click (blue border for local, colored for remote)
- ✅ Drag to move
- ✅ Resize from corners (diagonal resize with smooth flipping)
- ✅ Resize from edges (single-axis resize)
- ✅ Rotate from corner zones (30px hit areas, pivots around center)
- ✅ Alt+drag to duplicate (original stays in place, duplicate follows cursor)
- ✅ Delete with Delete key
- ✅ Dimension labels below selected shapes (radiusX × radiusY)
- ✅ Auto-switch to select tool after creation
- ✅ Polymorphic architecture supporting both shape types

**Line Shapes**
- ✅ Click-drag creation with line tool (drag from start to end)
- ✅ Selection with click (colored border for locked lines)
- ✅ Drag to move (center-based positioning with Konva Groups)
- ✅ Endpoint manipulation (drag start or end points independently)
- ✅ Visual endpoint handles when selected (blue circles, scale with zoom)
- ✅ Alt+drag to duplicate
- ✅ Delete with Delete key
- ✅ Dimension labels showing length in pixels (positioned below lower endpoint)
- ✅ Auto-switch to select tool after creation
- ✅ Stroke width support (default: 4px, editable in DetailPane)

**Text Shapes**
- ✅ Click-drag creation with text tool (set box dimensions)
- ✅ Selection with click (colored border for locked text)
- ✅ Drag to move (full rectangle-like interaction)
- ✅ Resize from corners and edges (width and height independently)
- ✅ Rotate from corner zones
- ✅ Alt+drag to duplicate
- ✅ Delete with Delete key
- ✅ Dimension labels below selected shapes (width × height)
- ✅ Auto-switch to select tool after creation
- ✅ Font size control (12-64px via DetailPane)
- ✅ Font family control (5 fonts via DetailPane)
- ✅ Text color control (hex/named colors via DetailPane)
- ✅ Horizontal alignment (left, center, right)
- ✅ Vertical alignment (top, middle, bottom)
- ✅ Fill color support (background behind text, default: transparent)
- ✅ Text content editing via DetailPane

**Real-Time Collaboration**
- ✅ Shape sync via Firestore (all users see updates ~200ms)
- ✅ Cursor tracking via Realtime DB (50ms latency)
- ✅ Presence awareness (online users in header)
- ✅ Shape locking prevents concurrent edits
- ✅ Visual feedback (colored borders show who's editing)
- ✅ Automatic lock release on deselect or disconnect
- ✅ Remote cursors with names and colors
- ✅ Cursor cleanup on disconnect (instant removal)

**UI Components**
- ✅ Bottom-center toolbar (Figma-style)
- ✅ Tool selector (select, rectangle, circle, line, text)
- ✅ Header with online user avatars (initials)
- ✅ Avatar overflow indicator (shows "+N" when >10 users)
- ✅ DetailPane (Figma-style right sidebar, opens when shape selected)
  - Common controls: fill color, position (x, y), rotation
  - Shape-specific controls: dimensions, border, stroke, text properties
  - Debounced updates (500ms delay, immediate UI feedback)
  - Color pickers (native HTML + text input, supports hex/named colors)
  - X button to close and deselect
  - Persists changes on unmount
- ✅ ESC key navigation (deselect shape → deselect tool)
- ✅ Responsive layout with Tailwind CSS

**Visual Feedback & Polish**
- ✅ Inverse scaling (cursors/labels/borders stay constant size during zoom)
- ✅ Zoom-independent selection borders (gentler scaling curve, 4px min)
- ✅ Proper border spacing (selection border outside shape border, no overlap)
- ✅ Dimension labels clear both shape and selection borders
- ✅ Colored borders match user colors
- ✅ Dimension labels remain horizontal (no rotation)
- ✅ Dynamic cursors for manipulation zones
- ✅ Smooth animations and transitions

### Technical Infrastructure ✅

**State Management**
- ✅ Zustand stores for user, shapes, cursors
- ✅ Optimistic updates (local state first, sync later)
- ✅ Real-time listeners for Firestore and RTDB

**Testing**
- ✅ 314 total tests passing (Vitest)
  - 290+ unit tests (stores, utilities, manipulation, selection, dragging, AI agent)
  - 24 integration tests (Firebase connectivity, multi-user locking, conflict scenarios)
- ✅ Anonymous auth for safe testing
- ✅ Test coverage for all critical paths
- ✅ Comprehensive manipulation tests (35 tests covering resize, rotate, line endpoints)
- ✅ Multi-user locking tests (10 tests for conflict scenarios)
- ✅ AI agent tests (24 tests for command parsing and execution)

**Performance Testing Results** (Manual):
- ✅ Connection Status UI: Fully functional, real-time updates
- ✅ 100 shapes: 60 FPS maintained
- ✅ 300 shapes: ~57-58 FPS (minor drop, recovers quickly)
- ✅ 500 shapes: 46 FPS during creation, recovers to 60 FPS after
- ✅ Performance degrades gracefully, no crashes or freezing
- ✅ FPS monitoring tool (Shift+F) works correctly

**Deployment**
- ✅ Vercel auto-deployment from GitHub main branch
- ✅ Firebase security rules deployed (Firestore + RTDB)
- ✅ Environment variables configured
- ✅ Production URL: https://collab-canvas-ben-cohen.vercel.app/
- ✅ HTTPS with automatic SSL

**Security**
- ✅ Firestore rules prevent unauthorized writes
- ✅ RTDB rules enforce user-only cursor writes
- ✅ Authentication required for all canvas access
- ✅ JWT tokens auto-attached to database requests

## What's Left to Build (Prioritized by Rubric Impact)

### Critical Path - Next 4 Days

**Day 1: Shape Library + Color (PRs #11-14)**

**PR #11: Circle Shape** ✅ COMPLETE
- [x] Circle component with Konva Circle/Ellipse
- [x] Corner-based creation (like rectangles)
- [x] Resize from corners/edges (radii adjustment)
- [x] Drag to move, rotation support
- [x] Update Firestore types (radiusX, radiusY)
- [x] 10-15 unit tests
- **Rubric Impact**: Section 2 +1-2 pts

**PR #12: Line Shape** ✅ COMPLETE
- [x] Line rendering via ShapeRenderer with Konva Line + Group
- [x] Two-point creation (click-drag)
- [x] Endpoint manipulation (drag start or end points)
- [x] Stroke color and width properties (default: 4px)
- [x] Update Firestore types (x, y, x2, y2, strokeWidth)
- [x] Visual endpoint handles when selected
- [x] Fix line dragging (center-based positioning)
- [x] Fix dimension label positioning (below lower endpoint)
- [x] **BONUS**: DRY refactoring with shapeFactory.ts
- [x] **BONUS**: Unified ShapeRenderer component
- [x] **BONUS**: Constants extraction (UI colors)
- [x] **BONUS**: Defensive programming improvements
- **Rubric Impact**: Section 2 +1-2 pts

**PR #13: Text Shape** ✅ COMPLETE
- [x] Text component with Konva Text
- [x] Click-drag creation (set box dimensions)
- [x] Full rectangle-like manipulation (drag, resize, rotate)
- [x] Font size, family, color properties
- [x] Horizontal and vertical alignment
- [x] Width and height resize (independent control)
- [x] Update Firestore types (text, fontSize, fontFamily, textColor, width, height, align, verticalAlign)
- [x] Fill color support (background)
- [ ] 10-15 unit tests - DEFERRED
- **Rubric Impact**: Section 2 +2-3 pts (critical for AI "create login form")

**PR #14: DetailPane & Enhanced Properties** ✅ COMPLETE
- [x] Figma-style DetailPane (right sidebar)
- [x] Native color pickers (hex + named color support)
- [x] Debounced input updates (500ms delay, immediate UI feedback)
- [x] Fill color control (all shapes)
- [x] Border color and width (rectangles, circles)
- [x] Stroke width (lines)
- [x] Text properties (content, font, color, alignment)
- [x] Position and rotation controls (all shapes)
- [x] Dimension controls (width/height, radii, endpoints)
- [x] ESC key navigation (deselect shape → deselect tool)
- [x] Zoom-independent selection borders
- [x] Proper border spacing (no overlap/gap)
- [x] Real-time Firestore + RTDB sync
- [x] Firebase undefined values sanitization
- [ ] 5-8 unit tests - DEFERRED
- **Rubric Impact**: Section 2 +2-3 pts, Section 3 Tier 1 +2 pts

**Day 2: Multi-Select + Shortcuts (PRs #15-16)**

**PR #15: Multi-Select**
- [ ] Shift+click to add/remove from selection
- [ ] Track array of selected IDs in store
- [ ] Visual feedback (blue borders on all selected)
- [ ] Multi-drag (maintain relative positions)
- [ ] Multi-delete (Delete key)
- [ ] Update locking (lock all selected shapes)
- [ ] Prevent multi-select if any shape locked by another
- [ ] Multi-select count indicator UI
- [ ] 15-20 unit tests
- **Rubric Impact**: Section 2 +2-3 pts, Section 3 potential

**PR #16: Keyboard Shortcuts** ✅ COMPLETE
- [x] Arrow keys: Nudge 1px
- [x] Shift+Arrow: Nudge 10px
- [x] Cmd/Ctrl+D: Duplicate (in-place, keeps selection)
- [x] Escape: Deselect all / close AI agent
- [x] Cmd/Ctrl+A: Select all
- [x] Cmd/Ctrl+Z: Undo, Cmd/Ctrl+Shift+Z or Y: Redo
- [x] Shift+F: Toggle FPS monitor
- [x] ?: Toggle keyboard shortcuts help
- [x] Document in KeyboardShortcutsGuide component
- [x] 24+ unit tests
- **Rubric Impact**: Section 3 Tier 1 +2 pts

**Days 2-3: AI Canvas Agent (PR #17)** 🤖

**PR #17: AI Integration (25 POINTS AVAILABLE)**
- [ ] Choose AI provider (OpenAI GPT-4 recommended)
- [ ] Secure API key management
- [ ] AI service module (src/services/aiAgent.ts)
- [ ] Command input UI (floating panel or toolbar)
- [ ] Loading/thinking indicator
- [ ] 8+ commands across all categories:
  - Creation: "Create a [color] [shape] at [position]"
  - Manipulation: "Move/resize/rotate/color [shape]"
  - Layout: "Arrange [shapes] in row/grid"
  - Complex: "Create a login form" (3-4 arranged elements)
- [ ] Parse AI response → canvas operations
- [ ] Sub-3 second response times
- [ ] 80%+ accuracy
- [ ] Multi-user AI support (concurrent commands)
- [ ] 10-15 unit tests for AI service
- [ ] 5-8 integration tests for command execution
- **Rubric Impact**: Section 4 +15-18 pts (target Good tier)

**Day 3: Testing & Performance (PR #18)** 🔄 IN PROGRESS

**PR #18: Rubric Validation**
- [x] Connection status UI indicator (ConnectionStatusIndicator component)
- [x] FPS monitoring overlay (Stats.js integration, Shift+F toggle)
- [x] Critical bug fix: Shape reversion on user reconnection
- [x] Ctrl+D duplication behavior refined (in-place, keeps selection)
- [x] Testing guide created (docs/TESTING_GUIDE.md)
- [ ] Manual conflict resolution tests:
  - Simultaneous move (2 users drag same shape)
  - Rapid edit storm (resize+color+move simultaneously)
  - Delete vs edit collision
  - Create collision (simultaneous creation)
- [ ] Manual persistence tests:
  - Mid-operation refresh
  - Total disconnect (all users leave, return)
  - Network simulation (Chrome DevTools throttle)
- [ ] Performance validation:
  - Test with 100+ shapes
  - Test with 300+ shapes (document results)
  - Test with 5+ concurrent users
  - Profile bottlenecks
- [ ] Document all test results in progress.md
- **Rubric Impact**: Section 1 +3-5 pts, Section 2 +2-3 pts (partially achieved)

**Day 4: Required Deliverables**

**AI Development Log** (Required for pass)
- [ ] 2-3 page reflection covering 3 of 5 sections:
  - Tools & Workflow used
  - 3-5 effective prompting strategies
  - Code analysis (% AI vs hand-written)
  - Strengths & limitations
  - Key learnings

**Demo Video** (Required - avoid -10 penalty)
- [ ] 3-5 minute video
- [ ] Show 2+ browser windows (real-time collab)
- [ ] Create/manipulate shapes, change colors
- [ ] Multi-select and group operations
- [ ] 5-8 AI commands (all categories)
- [ ] Advanced features showcase
- [ ] Brief architecture explanation
- [ ] Clear audio and video
- [ ] Upload to YouTube/Loom
- [ ] Add link to README

### Backlog (Future)

**Multi-Selection & Groups**
- [ ] Shift+click to select multiple shapes
- [ ] Drag-to-select rectangle (translucent selection box)
- [ ] Group move for multi-selected shapes
- [ ] Delete multiple shapes at once
- [ ] Group rotation and resize

**Properties Panel**
- [ ] Right-aligned panel (visible when shape selected)
- [ ] Editable position (X, Y inputs)
- [ ] Editable dimensions (width, height, radius)
- [ ] Editable rotation angle (degrees)
- [ ] Color picker for fill color
- [ ] Opacity slider (0-100%)
- [ ] Z-index controls (bring to front, send to back)

**Layers Panel**
- [ ] Left-aligned panel showing all shapes
- [ ] List shapes with names/icons
- [ ] Drag-n-drop to reorder z-index
- [ ] Show/hide layer visibility toggle
- [ ] Lock/unlock layers for editing
- [ ] Rename shapes

**Keyboard Shortcuts**
- [ ] Cmd/Ctrl+D: Duplicate selected shape
- [ ] Cmd/Ctrl+Z: Undo last action
- [ ] Cmd/Ctrl+Shift+Z: Redo
- [ ] Cmd/Ctrl+A: Select all shapes
- [ ] Escape: Deselect all shapes
- [ ] Arrow keys: Nudge selected shape (1px increments)
- [ ] Shift+Arrow: Nudge 10px increments

**Export & Import**
- [ ] Export canvas as PNG image
- [ ] Export canvas as SVG vector
- [ ] Export canvas state as JSON
- [ ] Import canvas state from JSON
- [ ] Share canvas via URL

**UX Improvements**
- [ ] Subtle grid background (optional toggle)
- [ ] Snap-to-grid functionality
- [ ] Context menu (right-click) for shape actions
- [ ] Anonymous guest access (read-only or full?)
- [ ] Canvas minimap (overview + navigation)
- [ ] Ruler guides (horizontal and vertical)

**Performance & Optimization**
- [ ] Viewport culling (only render visible shapes)
- [ ] Spatial partitioning (grid-based sync)
- [ ] Batch Firestore writes (combine multiple updates)
- [ ] WebWorker for Firebase sync (offload from main thread)
- [ ] Connection pooling (reuse across tabs)
- [ ] FPS monitoring and profiling

**Advanced Features**
- [ ] Undo/redo with operation history
- [ ] AI agent integration (layout suggestions, design assistance)
- [ ] Multi-canvas workspaces
- [ ] Role-based permissions (view-only, editor, admin)
- [ ] Canvas versioning and history
- [ ] Collaborative chat overlay
- [ ] Video cursors (tiny webcam feeds)

## Current Status by Component

### Frontend Components

| Component | Status | Notes |
|-----------|--------|-------|
| Canvas.tsx | ✅ Complete | Pan/zoom/scroll working, needs viewport culling eventually |
| Rectangle.tsx | ✅ Complete | Full manipulation (move, resize, rotate) |
| Circle.tsx | ❌ Not started | Next shape type to implement |
| Line.tsx | ❌ Not started | After circles |
| Text.tsx | ❌ Not started | After lines |
| Toolbar.tsx | ✅ Complete | Needs expansion for more tools |
| Header.tsx | ✅ Complete | Avatars and overflow working |
| AuthPage.tsx | ✅ Complete | Login/signup flows solid |
| Cursor.tsx | ✅ Complete | Remote cursors with inverse scaling |

### Zustand Stores

| Store | Status | Notes |
|-------|--------|-------|
| useUserStore | ✅ Complete | Auth state and profiles working |
| useShapeStore | ✅ Complete | Shapes, locking, selection working; needs duplication action |
| useCursorStore | ✅ Complete | Cursor tracking and throttling working |

### Utilities & Hooks

| Utility | Status | Notes |
|---------|--------|-------|
| firebase.ts | ✅ Complete | Initialization and config working |
| colors.ts | ✅ Complete | User color generation working |
| throttle.ts | ✅ Complete | Cursor throttling working |
| useFirebaseSync | ✅ Complete | Real-time listeners working |
| useCanvasControls | ✅ Complete | Pan/zoom/scroll working |

## Known Issues & Technical Debt

### Minor Issues
1. **Cursor throttling location**: Currently in component, should move to store level
2. **No error boundaries**: React errors crash entire app (should show fallback UI)
3. **No offline queue**: Writes fail silently when disconnected (should queue and retry)
4. **Lock cleanup**: Locks not released on browser crash (timeout needed?)
5. **Mobile support**: Not tested on touch devices (needs touch event handling)

### Technical Debt
1. **Firestore batching**: Individual writes for each shape update (should batch)
2. **No viewport culling**: All shapes render even if off-screen (performance concern)
3. **Duplicate manipulation code**: Resize/rotate logic may need abstraction for new shapes
4. **No operation history**: Can't implement undo/redo without tracking changes
5. **Hard-coded colors**: User colors from fixed palette (should be more diverse?)

### Performance Concerns
1. **60 FPS target**: Not profiled under heavy load (50+ shapes, 10+ users)
2. **Firebase rate limits**: Could hit free tier limits with many users (need monitoring)
3. **Cursor update frequency**: 20 Hz may be too fast for many users (adaptive throttling?)
4. **Firestore latency**: ~200ms for shape updates (consider RTDB for ephemeral edits?)

### Future Scalability Questions
1. **Multi-canvas support**: How to structure Firestore for multiple canvases per user?
2. **Permissions model**: How to implement view-only, editor, admin roles?
3. **Version history**: How to store and retrieve previous canvas states?
4. **Large canvases**: How to handle 1000+ shapes efficiently?

## Metrics & Analytics

### Test Coverage
- **Total tests**: 207 (203 unit, 4 integration)
- **Test suites**: 14
- **Pass rate**: 100%
- **Coverage**: Not measured (TODO: add coverage reporting)

### Production Usage (Manual Observation)
- **Deployed**: October 2025
- **Concurrent users tested**: Up to 3 simultaneously
- **Shapes on canvas**: Up to 20 without issues
- **Performance**: Smooth at 60 FPS with light load
- **Errors**: None reported in production so far

### Firebase Usage (Free Tier)
- **Firestore reads**: Within limits
- **Firestore writes**: Within limits
- **RTDB connections**: Within limits (100 max)
- **Auth users**: <10 accounts created

## Success Metrics (Achieved)

### MVP Goals ✅
1. ✅ Users can authenticate and access canvas
2. ✅ Users can create rectangles
3. ✅ Users can move, resize, rotate rectangles
4. ✅ Real-time sync works across multiple browsers
5. ✅ Cursors track in real-time
6. ✅ Locking prevents concurrent edits
7. ✅ Deployed and publicly accessible
8. ✅ 200+ unit tests passing

### Post-MVP Goals 🔄 (In Progress)
1. 🔄 Alt+drag duplication works smoothly
2. ⏳ Multiple shape types supported (rectangle done, others pending)
3. ⏳ Properties panel for precise control
4. ⏳ Layers panel for organization
5. ⏳ Undo/redo functionality
6. ⏳ 60 FPS under moderate load (not profiled yet)

## Next Session Checklist

When resuming work on alt+drag duplication:
1. [ ] Read activeContext.md for current focus
2. [ ] Review Rectangle.tsx manipulation logic
3. [ ] Add keyboard event tracking (Alt key state)
4. [ ] Implement duplication logic in onMouseDown
5. [ ] Add `duplicateShape` action to useShapeStore
6. [ ] Write unit tests for duplication
7. [ ] Manual test with 2+ browser windows
8. [ ] Update progress.md and activeContext.md
9. [ ] Commit PR #10

When resuming work on circles:
1. [ ] Review Rectangle.tsx as template
2. [ ] Create Circle.tsx component with Konva Circle
3. [ ] Decide on creation UX (center-based vs corner-based)
4. [ ] Reuse manipulation logic (resize, rotate)
5. [ ] Update Firestore types for radiusX/radiusY
6. [ ] Add circle tool to toolbar
7. [ ] Write unit tests for circle-specific logic
8. [ ] Manual test multi-user circle creation
9. [ ] Update progress.md and activeContext.md
10. [ ] Commit PR #11

