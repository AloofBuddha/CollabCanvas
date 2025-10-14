# Project Brief: CollabCanvas

## Vision
Build a real-time collaborative whiteboard application (minimal Figma-style) where multiple users can edit a shared canvas simultaneously with smooth, responsive interactions.

## Core Objective
Create a production-ready MVP that demonstrates real-time collaboration fundamentals with rectangles, cursor tracking, and presence awareness, then expand with additional shape types and manipulation features.

## MVP Scope (✅ COMPLETE)

### In Scope
- ✅ One shared canvas for all authenticated users
- ✅ Authentication via Firebase (email/password)
- ✅ Real-time cursor and shape synchronization
- ✅ Rectangle creation, selection, movement, resize, and rotation
- ✅ User presence with colored cursors and avatar initials
- ✅ Toolbar UI mimicking minimal Figma aesthetics (bottom-center)
- ✅ Shape locking mechanism to prevent concurrent edit conflicts
- ✅ Canvas controls: pan (middle-click), zoom (Ctrl+wheel), scroll (wheel)
- ✅ Unit tests via Vitest (203 passing tests)
- ✅ Production deployment on Vercel

### Out of Scope (MVP)
- Additional shapes (circles, lines, text) - **NOW IN PROGRESS**
- Permissions or roles beyond createdBy metadata
- Undo/redo functionality
- Advanced performance optimization (60 FPS is goal, not MVP requirement)
- Multiple canvas workspaces
- Properties panel or layers panel

## Success Criteria

### MVP Success Criteria (✅ ACHIEVED)
1. ✅ Authenticated users only can access canvas
2. ✅ Real-time sync with multiple users
3. ✅ Accurate cursors and avatars
4. ✅ Locking works smoothly with visual feedback
5. ✅ Canvas state persists and restores on reload
6. ✅ Stable performance under moderate load
7. ✅ Deployed and publicly accessible

### Current Success Criteria (Post-MVP)
1. Alt+drag duplication works smoothly
2. Multiple shape types supported (circle, line, text)
3. All shapes support full manipulation (move, resize, rotate)
4. Maintain 60 FPS performance with multiple shapes
5. Maintain test coverage >90%

## Target Users
- Teams needing lightweight collaboration tools
- Designers prototyping basic layouts
- Educators teaching visual concepts
- Developers testing real-time sync patterns

## Key Constraints
- Stateless frontend (all state in Firebase or local memory)
- Firebase free tier limitations (writes/reads per second)
- Single shared canvas (no workspaces in MVP)
- Browser-based only (no native apps)

## Future Vision (Post-MVP)
1. **Shape Library**: Circles, ellipses, lines, arrows, text with inline editing
2. **Advanced Manipulation**: Multi-select, group operations, duplication
3. **UI Panels**: Properties panel (right), layers panel (left)
4. **Productivity**: Undo/redo, keyboard shortcuts, export/import
5. **AI Integration**: AI agent assistance (v2 feature)
6. **Performance**: Spatial partitioning, viewport-only sync, connection pooling

## Live Application
**Production URL**: https://collab-canvas-ben-cohen.vercel.app/

## Version History
- **v1.0** - MVP Complete (9 PRs)
  - PR #1: Project initialization & Firebase setup
  - PR #2: Zustand stores
  - PR #3: Authentication & auth page
  - PR #4: Basic canvas & local rendering
  - PR #5: Cursor & presence
  - PR #6: Shape selection & deletion
  - PR #7: Real-time shape sync
  - PR #8: Deployment & production
  - PR #9: Rectangle manipulation (resize & rotate)
- **v1.1** - Enhancement Phase Part 1 (COMPLETE)
  - PR #10: Alt+drag duplication
- **v1.2** - Enhancement Phase Part 2 (IN PROGRESS)
  - Next: Additional shape types (circle, line, text)

## Author
Benjamin Cohen - October 2025

