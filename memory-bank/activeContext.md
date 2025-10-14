# Active Context: CollabCanvas

## Current Status

**Phase**: Post-MVP Enhancement Phase  
**Version**: v1.1 (In Progress)  
**Last Completed**: PR #9 - Rectangle Manipulation (Resize & Rotate)  
**Live Production**: https://collab-canvas-ben-cohen.vercel.app/

## Recent Changes (PR #9 - Completed)

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

## Current Work Focus

### Next Feature: Alt+Drag Duplication 🔄

**Goal**: Allow users to duplicate shapes by holding Alt while dragging

**User Experience**:
1. User selects a shape
2. User holds Alt key and starts dragging
3. Original shape stays in place
4. New duplicate shape follows cursor
5. On release, duplicate is created at new position
6. Auto-select the new duplicate

**Technical Approach**:
- Detect Alt key in `onMouseDown` handler
- If Alt held, create new shape with same properties but new ID
- Change drag target from original to duplicate
- Original shape releases lock immediately
- New shape acquires lock automatically
- Write duplicate to Firestore on `onMouseUp`

**Implementation Tasks**:
1. [ ] Add keyboard state tracking (Alt key down/up)
2. [ ] Modify shape `onMouseDown` to detect Alt+click
3. [ ] Create duplicate shape with new ID in store
4. [ ] Swap drag target from original to duplicate
5. [ ] Update cursor to show "duplicate" visual feedback (optional)
6. [ ] Handle edge cases:
   - Alt released during drag (cancel duplication?)
   - Alt pressed after drag started (ignore)
   - Duplicate while shape locked by another user (prevent)
7. [ ] Write unit tests for duplication logic
8. [ ] Manual testing in multi-user scenario

**Open Questions**:
- Should releasing Alt mid-drag cancel duplication or commit it?
- Should we show visual indicator that duplication mode is active?
- Should duplicate be created with slight offset from original?

### After Duplication: Additional Shape Types 📋

**Priority Order**:
1. **Circle/Ellipse**
   - Reuse manipulation logic from rectangles
   - Resize from corners/edges
   - Rotation less relevant (but keep for consistency)
   - Center-based creation vs corner-based?

2. **Line/Arrow**
   - Two-point creation (start and end)
   - Resize by dragging endpoints
   - Rotation implicitly handled by endpoints
   - Arrow head as optional property

3. **Text**
   - Click to create, enter text mode
   - Inline editing with contentEditable or input
   - Font size, color, alignment properties
   - Auto-resize vs fixed width?

**Shared Concerns**:
- Shape type selector in toolbar (radio buttons or dropdown?)
- Polymorphic shape type in Firestore (add `type` field, already exists)
- Shape-specific rendering logic (switch statement or component map?)
- Manipulation zone differences per shape type

## Active Decisions & Considerations

### Alt+Drag Duplication Decisions
- **Decision needed**: Cancel or commit duplication if Alt released mid-drag?
  - **Option A**: Cancel and revert to moving original (complex undo logic)
  - **Option B**: Commit duplication regardless (simpler, predictable)
  - **Recommendation**: Option B (commit regardless, simpler UX)

- **Decision needed**: Offset duplicate from original?
  - **Option A**: Place exactly under cursor (user explicitly positions it)
  - **Option B**: Offset by 20px down-right (avoids perfect overlap)
  - **Recommendation**: Option A (cursor position is explicit, user can offset manually)

### Shape Type Architecture Decisions
- **Decision needed**: How to extend shape rendering?
  - **Option A**: Single Shape component with type switch
  - **Option B**: Separate components (Rectangle, Circle, Line) with shared base
  - **Recommendation**: Option B (better separation, easier to maintain)

- **Decision needed**: How to unify manipulation logic?
  - **Option A**: Shared hooks (useManipulation) for all shapes
  - **Option B**: Per-shape manipulation with duplicated code
  - **Recommendation**: Option A (DRY principle, consistent behavior)

## Current Blockers

**None** - Ready to implement alt+drag duplication

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

## Next Session Priorities

1. **Immediate**: Implement alt+drag duplication
   - Start with keyboard event tracking
   - Add duplication logic to Rectangle component
   - Write unit tests
   - Manual test multi-user duplication

2. **Next PR**: Add circle/ellipse shape
   - Create Circle component with Konva Circle primitive
   - Reuse manipulation logic (resize, rotate)
   - Add circle tool to toolbar
   - Update Firestore types to support circle fields

3. **Follow-up PR**: Add line/arrow shape
   - Create Line component with Konva Line primitive
   - Two-point manipulation (drag endpoints)
   - Optional arrow head rendering
   - Add line tool to toolbar

## Context for Next Session

When resuming work:
1. **Read this file first** to understand current state
2. **Check tasks.md** for detailed PR checklist
3. **Review architecture.md** for system design patterns
4. **Check progress.md** for what's working and what's not
5. Start with alt+drag duplication implementation

**Key files to focus on**:
- `src/components/Rectangle.tsx` - Add duplication logic here
- `src/stores/useShapeStore.ts` - Add duplicate action
- `tests/unit/components/Rectangle.test.tsx` - Add duplication tests

**Helpful context from previous work**:
- PR #9 added comprehensive manipulation zones (body, corners, edges, rotation)
- Locking mechanism prevents concurrent edits
- Firestore sync happens on `onMouseUp` for performance
- Cursor updates throttled to 50ms for performance

