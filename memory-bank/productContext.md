# Product Context: CollabCanvas

## Problem Statement

Teams and individuals need lightweight, real-time collaboration tools for visual brainstorming and design work. Existing solutions (Figma, Miro) are feature-heavy and complex. There's a gap for a minimal, fast, browser-based whiteboard that "just works."

### Pain Points Addressed
1. **Setup friction**: No installation, just open browser and authenticate
2. **Learning curve**: Minimal UI, intuitive controls borrowed from familiar tools
3. **Real-time lag**: Sub-100ms cursor updates, optimistic UI updates
4. **Conflict resolution**: Visual locking prevents users from editing same shape
5. **Session persistence**: Canvas state survives page refreshes

## How It Works

### User Journey

**First Time User**
1. Visit production URL
2. Sign up with email/password and display name
3. Assigned a random color for cursor/avatar
4. Land on shared canvas with toolbar at bottom
5. Select rectangle tool, drag to create shape
6. See their cursor and avatar in header

**Returning User**
1. Log in with credentials
2. See existing shapes on canvas
3. See other online users' cursors and avatars
4. Select and manipulate shapes (drag, resize, rotate)
5. Canvas updates in real-time across all users

**Collaboration Flow**
1. User A selects a shape → border turns their color
2. User B sees the colored border, cannot edit
3. User A drags/resizes/rotates → User B sees live updates
4. User A deselects → lock released, User B can now edit
5. User A moves cursor → User B sees cursor move in real-time

### Key Interactions

**Canvas Controls**
- **Middle-click + drag**: Pan canvas
- **Mouse wheel**: Scroll vertically
- **Ctrl + wheel**: Zoom in/out
- **Spacebar**: Temporarily switch to pan mode

**Shape Manipulation** (Rectangles)
- **Click body**: Select shape (shows border and dimension label)
- **Drag body**: Move shape
- **Drag corners**: Resize diagonally (maintains aspect behavior)
- **Drag edges**: Resize width or height independently
- **Drag rotation zones**: Rotate around center (30px zones at corners)
- **Delete key**: Remove selected shape
- **Click canvas**: Deselect shape

**Toolbar** (Bottom-center)
- **Select tool**: Default mode for manipulating existing shapes
- **Rectangle tool**: Click+drag to create, auto-switches to select after
- **User avatar**: Shows online users (max 10 visible + overflow count)

### Visual Feedback

**Cursors**
- Each user has a unique color
- Cursor shows full name below pointer
- Cursors maintain constant size during zoom (inverse scaling)
- Cursors disappear instantly on disconnect

**Shape States**
- **Unselected**: No border
- **Selected by you**: Light blue border + dimension label
- **Selected by other**: Border in their color, uneditable
- **During manipulation**: Appropriate cursor (resize arrows, rotation)

**Dimension Labels**
- Shown below selected rectangles
- Format: "width × height"
- Remains horizontal regardless of rotation
- Hidden during drag/rotation, visible during resize

## User Experience Goals

### Performance
- **Target**: 60 FPS for smooth interactions
- **Current**: Stable under moderate load (5-10 concurrent users)
- **Cursor latency**: ~50ms (20Hz updates)
- **Shape sync latency**: ~200ms (Firestore limitation)
- **Optimistic updates**: Immediate local feedback, background sync

### Simplicity
- Minimal UI chrome, canvas-first design
- Toolbar only shows essential tools
- No menus, modals, or complex panels (yet)
- Contextual cursors guide user intent

### Reliability
- Automatic conflict prevention via locking
- Graceful handling of disconnects
- Persistent canvas state in Firestore
- Authentication protects data

### Collaboration Quality
- Real-time cursor tracking (feels like screen sharing)
- Visual feedback for who's editing what
- No merge conflicts or data loss
- Presence awareness (who's online)

## Design Philosophy

### Borrowed Patterns (Figma-inspired)
- Bottom-center toolbar with icon buttons
- Click-drag shape creation workflow
- Colored borders for selection state
- Rotation zones outside shape bounds
- Dimension labels for precise sizing

### Novel Decisions
- **Middle-click pan** instead of hand tool (keeps toolbar minimal)
- **Firestore + RTDB split** for optimal latency (persistent vs ephemeral)
- **Auto-switch to select** after creating shape (reduces clicks)
- **30px rotation zones** for easy triggering without handles

### Deliberate Trade-offs
- **Single canvas** over workspaces (simplicity > flexibility)
- **Email auth** over OAuth (privacy over convenience)
- **No undo** yet (real-time sync adds complexity)
- **Rectangles first** (prove concept before scaling)

## Target Use Cases

1. **Quick brainstorming**: Team sketches ideas in real-time meeting
2. **Layout mockups**: Designer arranges rectangles to prototype UI
3. **Visual teaching**: Educator demonstrates concepts with shapes
4. **Pair programming**: Developers plan architecture visually
5. **Testing ground**: Developers learning real-time sync patterns

## Non-Goals (Current Phase)

- Not a full design tool (no advanced shapes, effects, typography)
- Not a presentation tool (no slide mode or playback)
- Not a diagramming tool (no connectors, flowchart shapes)
- Not offline-capable (requires persistent connection)
- Not mobile-optimized (desktop browser experience)

## Future User Experience Vision

### Near-term (Next 2-3 PRs)
- Alt+drag to duplicate shapes quickly
- Circle and line shapes for more expression
- Text shapes for labeling and notes

### Mid-term
- Multi-select with Shift+click
- Properties panel for precise control
- Layers panel for organization
- Keyboard shortcuts (Cmd+D duplicate, Cmd+Z undo)

### Long-term
- AI agent that assists with layout and design
- Export canvas as image or JSON
- Collaborative cursors with chat
- Version history and time travel

