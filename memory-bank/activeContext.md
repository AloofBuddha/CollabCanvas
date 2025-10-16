# Active Context: CollabCanvas

## Current Status

**Phase**: Final Sprint - Rubric-Focused Enhancement (4 Days Remaining)  
**Version**: v1.2 → v2.0 (Major Upgrade)  
**Last Completed**: PR #12 - Line Shape ✅ COMPLETE  
**Live Production**: https://collab-canvas-ben-cohen.vercel.app/

**Current Grade**: **48/100 (F)** | **Target**: **70-75/100 (C/C+)** | **Stretch**: **80+/100 (B)**

## 🚨 Critical Priority Shift 🚨

The project is being evaluated against a comprehensive rubric. Based on analysis:
- **Biggest Gap**: AI Canvas Agent (0/25 points) - CRITICAL
- **Second Gap**: Limited shape types (only rectangles, need 3+)
- **Third Gap**: Performance/testing not validated against rubric standards

**Revised Strategy**: Build feature-rich canvas FIRST (shapes, colors, multi-select), THEN implement AI agent with meaningful commands.

## Recent Changes (PR #12 - Just Completed) ✅

### Line Shape Feature
- **New Shape Type**: Added line tool to toolbar with Minus icon
- **Two-Endpoint Architecture**: Lines defined by `(x, y)` and `(x2, y2)` properties
- **Full Feature Parity**: Lines support core shape features:
  - Click-and-drag creation with visual feedback
  - Endpoint manipulation (drag start/end points independently)
  - Drag to move entire line with proper center-based positioning
  - Dimension labels (length in pixels, positioned below lower endpoint)
  - Multi-user real-time sync (Firestore + RTDB)
  - Locking system and visual feedback (colored borders)
  - Visual endpoint handles when selected (blue circles)

### Technical Implementation
- **Type System**: `LineShape` interface with `x`, `y`, `x2`, `y2`, `strokeWidth` properties
- **DRY Refactoring**: Created centralized `shapeFactory.ts` for polymorphic shape operations
- **Unified Rendering**: New `ShapeRenderer.tsx` component handles all shape types
- **Group-Based Rendering**: Lines use Konva `Group` for proper drag/rotation behavior
- **Manipulation Zones**: New `start-point` and `end-point` zones for endpoint dragging
- **Firebase Sync**: Both Firestore and RTDB handle line properties with explicit type checks
- **Defensive Programming**: Replaced implicit `else` defaults with explicit type checking and error logging

### Code Quality Improvements
- **Constants Extraction**: Created `src/constants.ts` for UI colors (selection, handles, new shapes)
- **Zustand Pattern**: Refactored `CanvasPage.tsx` to use cleaner `getState()` destructuring pattern
- **ESLint Compliance**: Fixed all `any` type errors with proper type assertions
- **User Color System**: Deterministic hash-based user colors (20 distinct colors) for consistent remote user borders

### Bug Fixes
- **Line Dragging**: Fixed flicker, wrong drag origin, and border desync by using Konva Groups
- **Dimension Labels**: Lines now consistently show labels below the lower endpoint
- **Resize/Drag Conflict**: Fixed issue where drag would override resize by checking `isHoveringManipulationZone`
- **Sign Out/In Color**: Fixed race condition where user colors would reset to black after sign out/in
- **Double Unlock**: Fixed race condition causing double `unlockShape` calls with deferred Firestore sync

## Previous Changes (PR #9 - Completed)

### Rectangle Manipulation Features ✅
- **Dimension Display**: Width × height labels below selected rectangles
- **Cursor Feedback**: Dynamic cursors for different manipulation zones
  - Body: move (drag cursor)
  - Corners: resize diagonal (nwse/nesw cursors)
  - Edges: resize single axis (ew/ns cursors)
  - Rotation zones: rotate cursor (30px zones at corners)
- **Resize Functionality**: 
  - Corner resize: both dimensions change
  - Edge resize: single dimension changes
  - Smooth flipping that follows mouse cursor
  - Maintains opposite anchor point
- **Rotation Functionality**:
  - Pivots around shape center (using Konva offsetX/offsetY)
  - Large 30px hit zones for easy triggering
  - Real-time angle updates during drag
- **Visual Polish**:
  - Dimension labels hidden during drag/rotation
  - Selection persists after resize/rotate regardless of mouseup location
  - Fixed onClick firing before onMouseUp timing issue

### Technical Improvements ✅
- 36 new unit tests for manipulation logic (203 total)
- Anonymous auth for Firebase integration tests
- Fixed React key warning using Fragment components
- Rotation zones start right at corner edge (no gap)

## Current Work Focus - 4-Day Sprint Plan

### **Day 1: Shape Library + Color Foundation**
**PRs #11-14**: Circle, Line, Text shapes + Color Picker  
**Rubric Impact**: Section 2 (+5-6 pts), Section 3 (+2 pts)

This builds the foundation for the AI agent. Without these, AI commands would be limited to rectangles only.

### **Day 2: Multi-Select + Keyboard Shortcuts**
**PRs #15-16**: Multi-select with shift-click, Arrow nudging, keyboard shortcuts  
**Rubric Impact**: Section 2 (+2-3 pts), Section 3 (+2 pts)

Multi-select enables group operations for AI ("arrange these shapes in a row").

### **Days 2-3: AI Canvas Agent (CRITICAL 25 POINTS)**
**PR #17**: Full AI integration with 8+ commands  
**Rubric Impact**: Section 4 (target 15-18/25 pts = Good tier)

Now the AI has:
- 4 shape types (rectangle, circle, line, text)
- Color manipulation
- Multi-select and group operations
- Rich command possibilities ("create a login form", "make a navigation bar")

### **Day 3: Testing & Performance Validation**
**PR #18**: Rubric-specific testing scenarios  
**Rubric Impact**: Section 1 (+3-5 pts), Section 2 (+2-3 pts)

Validate conflict resolution, persistence, reconnection, and performance with 100-300+ shapes.

### **Day 4: Required Deliverables**
- AI Development Log (required for pass)
- Demo Video (avoid -10 penalty)
- Final polish

### Next Immediate Task: PR #13 - Text Shape with Inline Editing

**Implementation Focus**:
1. **Text rendering** - Use Konva Text component (already scaffolded in `shapeFactory.ts`)
2. **Click-to-create** - Single click creates text box, enters edit mode
3. **HTML overlay editing** - Position HTML input/textarea at canvas position for editing
4. **Double-click to edit** - Existing text can be edited
5. **Exit edit mode** - Click outside or press Escape saves and syncs to Firestore
6. **Text properties** - Support `text`, `fontSize`, `fontFamily`, `textColor`, `width` fields

## Active Decisions & Considerations

### Rubric-Driven Decisions

**1. AI Provider Choice (PR #17)**
- **Options**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Consideration**: Cost, latency (<3s target), accuracy (80%+)
- **Recommendation**: Start with OpenAI GPT-4 (proven canvas/code generation), fallback to Claude if needed

**2. Color Picker Implementation (PR #14)**
- **Options**: Library (react-color) vs custom simple picker
- **Consideration**: Time constraint vs feature richness
- **Recommendation**: Custom simple picker (8-10 presets + recent colors) - faster to implement

**3. Multi-Select State Management (PR #15)**
- **Options**: Array of IDs vs Set vs new selection object
- **Consideration**: Firestore locking (multiple shapes), performance
- **Recommendation**: Array of IDs in `selectedShapeIds` - simple, works with existing lock logic

**4. Text Editing UX (PR #13)**
- **Options**: Konva Text + Transformer vs HTML overlay vs contentEditable
- **Consideration**: Real-time sync, multi-user conflicts, cursor positioning
- **Recommendation**: HTML input overlay (absolute positioned) - easier to handle editing state

### Shape Type Architecture (Decided)
- ✅ **Separate components** (Rectangle, Circle, Line, Text) with shared manipulation patterns
- ✅ **Polymorphic Firestore schema** - `type` field + nullable shape-specific fields
- ✅ **Component map** - Canvas component switches rendering based on `shape.type`

## Current Blockers

**None** - Clear path forward with rubric-focused plan

## Open Technical Questions

1. **Performance**: Will adding 3 more shape types degrade 60 FPS target?
   - Need to profile with 50+ shapes on canvas
   - May need to implement viewport culling

2. **Firestore schema**: Should we add shape-specific fields or keep flat?
   - Rectangles: x, y, width, height, rotation
   - Circles: x, y, radiusX, radiusY, rotation
   - Lines: x1, y1, x2, y2
   - Text: x, y, text, fontSize, fontFamily
   - **Recommendation**: Keep flat, use nullable fields (text: null for non-text shapes)

3. **Toolbar UX**: How to display 5+ shape tools without clutter?
   - Current: 2 buttons (select, rectangle)
   - Future: 5+ buttons (select, rectangle, circle, line, text, ...)
   - **Options**: Dropdown menu, icon grid, collapsible panel
   - **Recommendation**: Keep flat icon buttons for now, revisit if >6 tools

## Recent Learnings

### Konva Rotation Pivot
- Shapes rotate around top-left by default
- Use `offsetX={width/2}, offsetY={height/2}` to pivot around center
- Update `x, y` to compensate for offset change

### Event Timing Edge Case
- Konva fires `onClick` before `onMouseUp` sometimes
- Can cause selection state bugs (click fires, then mouseup clears)
- Solution: Check current operation state before handling onClick

### Smooth Shape Flipping
- When resizing past anchor point, shape dimensions become negative
- Naive approach: flip sign and reposition
- Better approach: Keep dimensions positive, move x/y to follow mouse
- Result: Shape smoothly follows cursor, no visual jump

### Firebase Anonymous Auth for Tests
- Integration tests need real Firebase connection
- Anonymous auth perfect for testing (no signup required)
- Must enable in Firebase Console > Authentication > Sign-in methods

## Environment & Deployment Status

**Local Development**:
- Node: v18+
- npm: Latest
- Vite dev server: http://localhost:5173
- Firebase: Connected to production project

**Production**:
- Vercel: Auto-deploys from `main` branch
- URL: https://collab-canvas-ben-cohen.vercel.app/
- Firebase: us-central1 region
- Security rules: Deployed and enforced

**Testing**:
- Unit tests: 203 passing (Vitest)
- Integration tests: 4 passing (Firebase connectivity)
- Manual testing: Regularly tested with 2-3 browser windows

## Next Session Priorities (In Order)

### 1. **PR #13: Text Shape with Inline Editing** (Start immediately)
   - Implement HTML overlay for text editing
   - Click-to-create workflow
   - Double-click to edit existing text
   - Sync text content and properties to Firestore
   - Respect locking mechanism during editing
   - 10-15 unit tests

### 2. **PR #14: Color Picker** (End of Day 1)
   - Simple custom picker (presets + recent colors)
   - Show when shape selected
   - Update all shape types to support color changes
   - 5-8 unit tests

### 3. **PR #15: Multi-Select** (Early Day 2)
   - Shift+click to add to selection
   - Multi-drag, multi-delete
   - Update locking for multiple shapes
   - 15-20 unit tests

### 4. **PR #16: Keyboard Shortcuts** (Day 2)
   - Arrow keys for nudging shapes
   - Delete/Backspace for deletion
   - Ctrl+A for select all
   - 8-12 unit tests

## Context for Next Session

**Current Rubric Score**: 44/100 (F)  
**Critical Gap**: AI Agent (0/25 points)  
**Strategy**: Build rich canvas features first, then AI agent can create "login forms" and "navigation bars"

**Key Implementation Pattern to Follow**:
1. Copy `Rectangle.tsx` as starting template
2. Modify shape-specific rendering (Konva.Circle vs Konva.Rect)
3. Adapt manipulation zones (circles: radii, lines: endpoints, text: width)
4. Update Firestore type union in `types/shape.ts`
5. Add to Canvas component's shape renderer
6. Add tool button to Toolbar
7. Write unit tests for creation, manipulation, sync

**Files to Focus On**:
- `src/components/Rectangle.tsx` - Reference implementation
- `src/types/shape.ts` - Add new shape type unions
- `src/components/Canvas.tsx` - Add shape rendering logic
- `src/components/Toolbar.tsx` - Add new tool buttons
- `src/stores/useShapeStore.ts` - Should work without changes (polymorphic)

**Helpful Context**:
- Manipulation zones: body (move), corners (resize diagonal), edges (resize axis), rotation zones (30px outside)
- Locking: Set `lockedBy` on mouseDown, clear on mouseUp or deselect
- Firestore sync: Optimistic local update, background Firestore write
- All shapes use same base fields: `id`, `type`, `lockedBy`, `createdBy`, `createdAt`

