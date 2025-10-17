# CollabCanvas - Product Requirements Document

## 1. Executive Summary

**Product Name:** CollabCanvas  
**Version:** MVP + Enhancements (v1.5)  
**Status:** In Development  
**Live URL:** [https://collab-canvas-ben-cohen.vercel.app/](https://collab-canvas-ben-cohen.vercel.app/)  

**Goal:** Build a real-time collaborative whiteboard application where multiple users can simultaneously create, manipulate, and organize shapes on a shared canvas, with AI-powered natural language commands for rapid prototyping.

---

## 2. Core Features

### 2.1 Canvas & Shapes ✅
- **4 Shape Types:** Rectangle, Circle, Line, Text
- **Shape Creation:** Click-drag to create shapes with any tool
- **Shape Manipulation:**
  - Drag to move
  - Resize from corners/edges
  - Rotate from corner zones (rectangles, circles, text)
  - Alt+drag to duplicate
- **Shape Properties:**
  - Fill color
  - Border color & width
  - Opacity (0-100%)
  - Z-index layering (bring to front/back, send forward/backward)
  - Rotation angle
  - Dimensions (width/height for rectangles, radiusX/radiusY for circles)

### 2.2 Multi-Select ✅
- **Drag-to-Select:** Click and drag to create selection rectangle
- **Shift+Click:** Add/remove shapes from selection
- **Multi-Drag:** Move all selected shapes maintaining relative positions
- **Multi-Delete:** Delete all selected shapes with Delete key
- **Visual Feedback:** Blue dashed borders around selected shapes
- **Locking:** Multi-select respects user locks (can't select locked shapes)

### 2.3 Canvas Controls ✅
- **Pan:** Middle-click and drag (or Space+drag)
- **Zoom:** Ctrl+Wheel or pinch gesture
- **Vertical Scroll:** Mouse wheel
- **Selection:** Click shape to select
- **Deselection:** Click canvas background or press ESC

### 2.4 Real-Time Collaboration ✅
- **Multi-User Support:** Unlimited concurrent users
- **Real-Time Sync:** Shape changes sync instantly via Firebase
- **Cursor Tracking:** See other users' cursors with names and colors
- **User Presence:** Online user list in header with avatars
- **Locking Mechanism:**
  - Shapes lock when selected/dragged
  - Visual feedback with colored borders
  - Prevents concurrent editing conflicts
  - Hover tooltip shows who's editing
- **Instant Updates:** Sub-second latency for shape operations

### 2.5 Text Editing ✅
- **Inline Editing:** Double-click text to edit in-place
- **Rich Formatting:**
  - Font size (12-64px)
  - Font family (5 options: Arial, Times New Roman, Courier New, Georgia, Verdana)
  - Text color
  - Horizontal alignment (left, center, right)
  - Vertical alignment (top, middle, bottom)
- **Rotation Support:** Text rotates with shape
- **Width Resize:** Drag corners to adjust text box width (text wraps)

### 2.6 DetailPane ✅
- **Property Editing:** Right sidebar opens when shape selected
- **Editable Properties:**
  - Shape name (for AI commands)
  - Position (x, y)
  - Dimensions (width/height or radiusX/radiusY)
  - Rotation angle
  - Fill color (color picker + hex input)
  - Border color & width
  - Opacity slider
  - Text-specific: font size, font family, text color, alignment
  - Line-specific: endpoint positions, stroke width
- **Z-Index Controls:**
  - Bring to Front
  - Send to Back
  - Bring Forward
  - Send Backward
- **Debounced Updates:** Changes save automatically after 500ms

### 2.7 AI Canvas Agent 🚀 (IN PROGRESS)
**Goal:** Enable natural language commands for rapid canvas prototyping

**Current Capabilities:**
- ✅ **Creation Commands:** "Create a red circle at 100, 200"
- ✅ **Manipulation Commands:** "Make circle-1 blue", "Move rectangle-2 to 300, 400"
- ✅ **Shape Identification:** Auto-generated names (rectangle-1, circle-2) + user-editable
- ✅ **Multi-Shape Creation:** "Create a smiley face" → generates face + eyes + mouth
- ✅ **Property Support:** Color, position, size, rotation, opacity, text properties
- ✅ **Context Awareness:** AI sees all shapes, canvas dimensions, viewport position

**In Development:**
- 🔄 **Layout Commands:** "Align all circles horizontally", "Distribute shapes evenly"
- 🔄 **Complex Commands:** "Create a login form", "Make a button with text Submit"
- 🔄 **Delete Commands:** "Delete all red shapes", "Remove circle-1"

**Technical Details:**
- **AI Provider:** OpenAI (gpt-4o-mini) via LangChain
- **Architecture:** Two-stage (intent classification → execution)
- **Response Time:** Target <3 seconds
- **Error Handling:** Toast notifications with user-friendly messages
- **Testing:** Unit tests with mocked AI calls

---

## 3. User Authentication

### 3.1 Sign Up ✅
- Email/password registration
- Display name required
- Random color assignment
- User profile stored in Firestore

### 3.2 Login ✅
- Email/password authentication
- Session persistence
- Redirect to canvas on success

### 3.3 User Profile ✅
- Display name
- Unique user color (for cursors/locks)
- User ID

---

## 4. Technical Architecture

### 4.1 Frontend Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Canvas Library:** React Konva (HTML5 Canvas wrapper)
- **State Management:** Zustand (lightweight Redux alternative)
- **Styling:** TailwindCSS
- **Icons:** Lucide React

### 4.2 Backend Stack
- **Database:** Firebase Firestore (persistent data)
- **Real-Time Sync:** Firebase Realtime Database (cursors, presence, locks)
- **Authentication:** Firebase Auth
- **Hosting:** Vercel (frontend) + Firebase (backend)

### 4.3 Data Model

**Firestore Collections:**
```
/shapes/{shapeId}
  - type: 'rectangle' | 'circle' | 'line' | 'text'
  - name: string (optional, for AI commands)
  - x, y: number
  - width, height, radiusX, radiusY, x2, y2 (shape-specific)
  - color: string (hex)
  - stroke, strokeWidth: string, number (optional)
  - rotation: number (degrees)
  - opacity: number (0-1)
  - zIndex: number (for layering)
  - createdBy: string (userId)
  - lockedBy: string | null (userId or null)
  - text, fontSize, fontFamily, textColor, align, verticalAlign (text-specific)

/users/{userId}
  - displayName: string
  - color: string (hex)
```

**Realtime Database:**
```
/presence/{userId}
  - cursor: { x: number, y: number }
  - online: boolean
  - lastSeen: timestamp

/locks/{shapeId}
  - userId: string
  - timestamp: number
```

### 4.4 Zustand Stores
- **useUserStore:** Authentication state, user profile
- **useCursorStore:** Local cursor + remote cursor tracking
- **useShapeStore:** Shape CRUD operations, selection state

---

## 5. Performance & Scale

### 5.1 Current Performance
- **Test Coverage:** 259 unit tests + 30 integration tests
- **Shape Capacity:** Tested with 50+ shapes
- **Concurrent Users:** Tested with 3+ simultaneous users
- **Latency:** Sub-second shape sync

### 5.2 Performance Targets (In Progress)
- 🔄 Test with 300+ shapes
- 🔄 Test with 5+ concurrent users
- 🔄 FPS monitoring overlay
- 🔄 Optimize viewport culling for large canvases

---

## 6. Security

### 6.1 Firebase Security Rules ✅
- **Firestore:** Users can read all shapes, write only their own
- **Realtime DB:** Users can read all presence, write only their own
- **Authentication:** Required for all canvas operations

### 6.2 Data Validation ✅
- Input validation on all user inputs
- XSS protection via React's built-in escaping
- CORS configured for production domain

---

## 7. Testing Strategy

### 7.1 Unit Tests ✅
- **Coverage:** 259 tests across 16 test suites
- **Stores:** User, cursor, shape state management
- **Hooks:** Selection, dragging, manipulation logic
- **Components:** Canvas, toolbar, detail pane
- **AI Agent:** Command parsing, intent classification

### 7.2 Integration Tests ✅
- Firebase connectivity
- Authentication flow
- Real-time sync

### 7.3 Manual Testing (In Progress)
- 🔄 Multi-user conflict scenarios
- 🔄 Network disconnection/reconnection
- 🔄 Performance under load

---

## 8. Deployment

### 8.1 Production Environment ✅
- **URL:** https://collab-canvas-ben-cohen.vercel.app/
- **Platform:** Vercel (auto-deploy from main branch)
- **Backend:** Firebase Production project
- **Monitoring:** Vercel Analytics + Firebase Console

### 8.2 Environment Variables ✅
- Firebase configuration
- API keys (OpenAI for AI agent)
- Production URLs

---

## 9. Future Enhancements

### 9.1 Planned Features
- ⏳ **Keyboard Shortcuts:** Arrow keys for nudging, Ctrl+D for duplicate
- ⏳ **PNG Export:** Export canvas as image
- ⏳ **Undo/Redo:** Command history with Ctrl+Z
- ⏳ **AI Layout Commands:** Align, distribute, center shapes
- ⏳ **AI Complex Commands:** Generate multi-shape UI components

### 9.2 Possible Future Work
- Pen/pencil drawing tool
- Image upload
- Comments/annotations
- Version history
- Teams/workspaces
- WebRTC for voice/video

---

## 10. Success Metrics

### 10.1 MVP Success Criteria ✅
- [x] 4+ shape types
- [x] Real-time collaboration
- [x] Multi-user cursor tracking
- [x] Shape manipulation (resize, rotate, color)
- [x] User authentication
- [x] Deployed and accessible
- [x] 200+ unit tests

### 10.2 Enhancement Success Criteria
- [x] Multi-select functionality
- [x] Opacity & z-index layering
- [x] AI agent infrastructure
- [ ] 8+ AI commands (6/8 complete)
- [ ] Layout commands
- [ ] Performance testing (300+ shapes)

---

## 11. Known Limitations

### 11.1 Current Limitations
- Single canvas (no multiple boards)
- No offline mode (requires internet)
- No undo/redo yet
- AI commands limited to English
- No mobile optimization (desktop-first)

### 11.2 Browser Compatibility
- **Supported:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Not Supported:** IE11, older mobile browsers

---

## 12. Documentation

### 12.1 User Documentation
- **README.md:** Setup instructions, features, deployment
- **SETUP.md:** Detailed local development setup
- **DEPLOYMENT.md:** Production deployment guide

### 12.2 Developer Documentation
- **architecture.md:** System architecture and design decisions
- **PRE_DEPLOYMENT_CHECKLIST.md:** Pre-deployment verification
- **tasks.md:** Historical development checklist
- **TASKS.md:** Current status and remaining work

---

## Appendix: Keyboard Shortcuts

### Current Shortcuts ✅
- **Delete/Backspace:** Delete selected shape(s)
- **ESC:** Deselect shapes, then deselect tool
- **Alt+Drag:** Duplicate shape
- **Middle Click+Drag:** Pan canvas
- **Ctrl+Wheel:** Zoom in/out
- **Mouse Wheel:** Vertical scroll
- **Shift+Click:** Add/remove from multi-select
- **Double-Click (text):** Enter edit mode

### Planned Shortcuts 🔄
- **Arrow Keys:** Nudge selected shape(s) 1px
- **Shift+Arrow:** Nudge selected shape(s) 10px
- **Ctrl+D:** Duplicate selected shape(s)
- **Ctrl+A:** Select all shapes
- **Ctrl+Z:** Undo (future)
- **Ctrl+Shift+Z:** Redo (future)

---

**Last Updated:** October 17, 2025  
**Document Version:** 1.5  
**Author:** Benjamin Cohen

