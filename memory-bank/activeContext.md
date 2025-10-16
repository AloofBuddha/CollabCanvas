# Active Context: CollabCanvas

## Current Status

**Phase**: Final Sprint - Rubric-Focused Enhancement (3.5 Days Remaining)  
**Version**: v2.0 (Major Canvas Enhancement Complete)  
**Last Completed**: PR #14 - DetailPane & Enhanced Shape Properties ✅ COMPLETE  
**Live Production**: https://collab-canvas-ben-cohen.vercel.app/

**Current Grade**: **53/100 (F)** ⬆️ **+5** | **Target**: **70-75/100 (C/C+)** | **Stretch**: **80+/100 (B)**

## 🚨 Critical Priority Shift 🚨

The project is being evaluated against a comprehensive rubric. Based on analysis:
- **Biggest Gap**: AI Canvas Agent (0/25 points) - CRITICAL
- **Second Gap**: Limited shape types (only rectangles, need 3+)
- **Third Gap**: Performance/testing not validated against rubric standards

**Revised Strategy**: Build feature-rich canvas FIRST (shapes, colors, multi-select), THEN implement AI agent with meaningful commands.

## Recent Changes (PR #13-14 - Just Completed) ✅

### Text Shape Feature (PR #13)
- **New Shape Type**: Added text tool to toolbar with Type icon
- **Rectangle-Like Manipulation**: Text shapes behave like rectangles (drag, resize, rotate)
- **Click-drag Creation**: Set box dimensions during drag, automatically add default "Text" content
- **Full Property Control**: Font size (12-64px), font family (5 fonts), text color
- **Text Alignment**: Horizontal (left, center, right) and vertical (top, middle, bottom)
- **Fill Color Support**: Background fill (default: transparent) behind text
- **Type System**: `TextShape` interface with `text`, `width`, `height`, `fontSize`, `fontFamily`, `textColor`, `align`, `verticalAlign`
- **Firebase Sync**: All text properties sync to Firestore and RTDB

### DetailPane & Enhanced Properties (PR #14)
- **Figma-Style UI**: Right sidebar opens when shape selected, closes on X or ESC
- **Debounced Updates**: 500ms delay for shape updates, but input UI updates immediately
- **Color System**: Native HTML color pickers + text inputs, supports hex and named colors (blue, transparent, etc.)
- **Universal Controls**: Fill color, position (x, y), rotation available for all shapes
- **Shape-Specific Controls**:
  - Rectangles: width, height, border color, border width
  - Circles: radiusX, radiusY, border color, border width
  - Lines: x2, y2, stroke width (no rotation control)
  - Text: content, font size, font family, text color, horizontal align, vertical align
- **Keyboard Navigation**: ESC key deselects shape, second ESC deselects tool
- **Input Safety**: Backspace/Delete in inputs doesn't delete the shape
- **Cleanup Logic**: Flushes pending debounced updates on unmount

### Visual Polish & Bug Fixes
- **Zoom-Independent Borders**: Selection borders use gentler scaling curve (`Math.pow(stageScale, -0.6)`) with 4px minimum
- **Perfect Border Spacing**: Selection border appears directly outside shape border with no overlap or gap
- **Dimension Label Clearance**: Labels positioned below both shape border and selection border
- **Text Hitboxes**: Fixed janky dragging, missing resize cursors, and incorrect hitbox by treating text like rectangles
- **Toolbar Focus**: Removed focus outline after tool selection with `blur()`
- **Firebase Sanitization**: Added `sanitizeForFirebase` to remove `undefined` values before syncing
- **Linting**: All ESLint errors fixed, unused imports removed

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

### 1. **PR #15: Multi-Select with Shift+Click** ⏳ NEXT (Start immediately)
   - Track array of `selectedShapeIds` in store (replace single `selectedShapeId`)
   - Shift+click to add/remove shapes from selection
   - Visual feedback: all selected shapes show blue border
   - Multi-drag: maintain relative positions during drag
   - Multi-delete: Delete key removes all selected shapes
   - Locking: lock all selected shapes on selection
   - Prevent multi-select if any shape locked by another user
   - Show selection count indicator in UI ("3 shapes selected")
   - 15-20 unit tests

### 2. **PR #16: Additional Keyboard Shortcuts** (Early Day 2)
   - Arrow keys: Nudge selected shape(s) 1px
   - Shift+Arrow: Nudge 10px
   - Cmd/Ctrl+D: Duplicate selected shape(s)
   - Cmd/Ctrl+A: Select all shapes
   - Document shortcuts in README or help panel
   - 8-10 unit tests

### 3. **PR #17: AI Canvas Agent** 🤖 (Days 2-3) - CRITICAL 25 POINTS
   - Set up AI provider (OpenAI GPT-4 or Claude)
   - Implement 8+ natural language commands
   - Commands should leverage all 4 shape types and properties
   - Target 80%+ command accuracy
   - Target <3s response time
   - AI Development Log (required for pass)

### 4. **PR #18: Testing & Performance Validation** (Day 3)
   - Conflict resolution scenarios (2+ users editing same shape)
   - Performance testing (100-300+ shapes, 60 FPS target)
   - Reconnection testing (offline → online recovery)
   - Multi-user stress testing (5+ concurrent users)

### 5. **Required Deliverables** (Day 4)
   - Complete AI Development Log
   - Record demo video (avoid -10 penalty)
   - Final polish and deployment

## Context for Next Session

**Current Rubric Score**: **53/100 (F)** ⬆️ **+5 from 48**  
**Critical Gap**: AI Agent (0/25 points)  
**Canvas Foundation**: ✅ COMPLETE - 4 shape types, DetailPane, color controls  
**Strategy**: Now implement Multi-Select, then AI Agent with rich command possibilities

**Major Accomplishments This Session**:
1. ✅ Text shapes with full manipulation and alignment controls
2. ✅ Figma-style DetailPane with debounced updates
3. ✅ Color system (fill, border, stroke, text color) with named color support
4. ✅ Zoom-independent selection borders with perfect spacing
5. ✅ ESC key navigation (deselect shape → deselect tool)
6. ✅ Firebase sanitization (no more undefined values errors)
7. ✅ 243 tests passing (213 unit + 30 integration)

**Key Files Modified**:
- `src/components/DetailPane.tsx` - NEW: Figma-style properties panel
- `src/components/ShapeRenderer.tsx` - Border spacing, text alignment
- `src/types/index.ts` - Added `align`, `verticalAlign`, `stroke`, `strokeWidth`
- `src/utils/firebaseShapes.ts` - Added `sanitizeForFirebase` helper
- `src/utils/shapeManipulation.ts` - Text shapes behave like rectangles
- `src/utils/shapeFactory.ts` - Default alignment values for text

**Implementation Patterns Established**:
- **Debouncing**: Use local state + `debouncedUpdate` + refs for cleanup
- **Type Safety**: Use discriminated unions, explicit type checks, no implicit defaults
- **Firebase**: Always sanitize objects before syncing (remove undefined)
- **Visual Polish**: Inverse scaling, border spacing calculations, dimension clearance
- **Keyboard UX**: Check `document.activeElement` to prevent input conflicts

**Next Task: Multi-Select Implementation Strategy**:
1. Replace `selectedShapeId: string | null` with `selectedShapeIds: string[]` in store
2. Update selection logic: Shift+click toggles shape in array
3. Update visual feedback: all shapes in array show blue border
4. Update dragging: calculate center of selection, maintain relative offsets
5. Update locking: lock all shapes in array on selection
6. Add UI indicator: "3 shapes selected" below toolbar
7. Update keyboard handlers: Delete removes all, arrows nudge all

