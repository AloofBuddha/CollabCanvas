# Project Brief: CollabCanvas

## Vision
Build a real-time collaborative whiteboard application (minimal Figma-style) where multiple users can edit a shared canvas simultaneously with smooth, responsive interactions.

## Core Objective
Create a production-ready collaborative canvas application that demonstrates real-time collaboration with multiple shape types, AI-powered canvas commands, and robust multi-user support. The project is evaluated against a comprehensive rubric (100 points total) covering infrastructure, features, AI integration, and technical quality.

**Current Status**: MVP Complete (v1.1) | **Target Grade**: 70-75/100 (C/C+) | **Stretch**: 80+/100 (B)

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

### Current Success Criteria (Rubric-Driven - 4 Days Remaining)

**Section 1: Core Collaborative Infrastructure (Target: 22-24/30)**
1. ✅ Sub-50ms cursor sync (achieved)
2. ⏳ Connection status UI indicator
3. ⏳ Conflict resolution testing (simultaneous edits, rapid edit storm)
4. ⏳ Persistence testing (mid-refresh, network simulation)

**Section 2: Canvas Features & Performance (Target: 15-17/20)**
1. ⏳ 4+ shape types (rectangle ✅, circle, line, text)
2. ⏳ Multi-select with shift-click
3. ⏳ Performance validated with 100-300+ shapes
4. ⏳ 5+ concurrent users tested

**Section 3: Advanced Figma-Inspired Features (Target: 8-10/15)**
1. ✅ Alt+drag duplication (Tier 1)
2. ⏳ Color picker with presets (Tier 1)
3. ⏳ Keyboard shortcuts - arrow nudging, Cmd+D, Cmd+A (Tier 1)
4. ⏳ Export canvas as PNG (Optional Tier 1)

**Section 4: AI Canvas Agent (Target: 15-18/25)** 🚨 CRITICAL
1. ⏳ 8+ commands across all categories (creation, manipulation, layout, complex)
2. ⏳ Sub-3 second response times
3. ⏳ 80%+ accuracy rate
4. ⏳ Multi-user AI support (concurrent commands)

**Section 5: Technical Implementation (8/10)** ✅ STRONG
1. ✅ Clean architecture with good separation
2. ✅ Robust authentication and security

**Section 6: Documentation & Submission (5/5)** ✅ EXCELLENT
1. ✅ Comprehensive documentation
2. ✅ Stable deployment on Vercel

**Required Deliverables**
1. ⏳ AI Development Log (2-3 pages, 3 of 5 sections)
2. ⏳ Demo Video (3-5 min, multi-user + AI commands)

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

### v1.0 - MVP Complete (PRs #1-9) ✅
- PR #1: Project initialization & Firebase setup
- PR #2: Zustand stores
- PR #3: Authentication & auth page
- PR #4: Basic canvas & local rendering
- PR #5: Cursor & presence
- PR #6: Shape selection & deletion
- PR #7: Real-time shape sync
- PR #8: Deployment & production
- PR #9: Rectangle manipulation (resize & rotate)

### v1.1 - Enhancement Phase (PR #10) ✅
- PR #10: Alt+drag duplication

### v2.0 - Rubric-Driven Final Sprint (PRs #11-20) ⏳ IN PROGRESS
**4 Days Remaining | Target Grade: 70-75/100**

**Day 1: Shape Library + Color (PRs #11-14)**
- PR #11: Circle shape with full manipulation
- PR #12: Line shape with endpoint dragging
- PR #13: Text shape with inline editing
- PR #14: Color picker for all shapes

**Day 2: Multi-Select + Shortcuts (PRs #15-16)**
- PR #15: Multi-select with shift-click
- PR #16: Keyboard shortcuts (arrows, Cmd+D, Cmd+A)

**Days 2-3: AI Agent (PR #17)** 🤖 CRITICAL
- PR #17: AI Canvas Agent (8+ commands, 25 points available)

**Day 3: Testing (PR #18)**
- PR #18: Rubric validation (conflict tests, performance tests)

**Day 4: Deliverables**
- AI Development Log (required for pass)
- Demo Video (3-5 min, avoid -10 penalty)

**Optional (Time Permitting)**
- PR #19: Export canvas as PNG
- PR #20: Undo/redo system

## Author
Benjamin Cohen - October 2025

