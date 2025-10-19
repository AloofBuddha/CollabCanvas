# CollabCanvas Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing the collaborative canvas application, including connection status, performance under load, conflict resolution, and persistence/reconnection scenarios.

---

## ✅ What We've Implemented

### 1. Connection Status Indicator
- **Location**: Top-left of header, next to app title
- **States**:
  - 🟢 **Connected** (green): Both browser and Firebase are online
  - 🟡 **Connecting...** (yellow with pulse): Browser online but Firebase disconnected
  - 🔴 **Offline** (red): Browser is offline
- **How it works**: Listens to browser `online/offline` events and Firebase RTDB `.info/connected` path

### 2. FPS Monitor (Stats.js)
- **Toggle**: Press `Shift+F` to show/hide
- **Displays**:
  - **FPS**: Frames per second (top panel)
  - **MS**: Milliseconds per frame (middle panel)
  - **MB**: Memory usage (bottom panel, if available)
- **Location**: Top-left, below header

### 3. Multi-Shape Duplication (Ctrl+D)
- **Duplicate**: `Ctrl/Cmd+D` - Creates copies at exact same position
- **Behavior**: Original selection stays selected, duplicates appear underneath
- **Workflow**: Select shapes → Ctrl+D → Drag originals away
- **Multi-shape support**: Works with multiple selected shapes
- **Use case**: Quickly generate many shapes for performance testing

---

## 🧪 Testing Procedures

### Test 1: Connection Status UI

#### Scenario 1.1: Hard Disconnect
1. Open the app and ensure you're logged in
2. ✅ **Verify**: Connection indicator shows "Connected" (green)
3. Open Chrome DevTools (F12) → Network tab
4. Check the "Offline" checkbox
5. ✅ **Verify**: Indicator changes to "Offline" (red) within 1-2 seconds
6. Try to create a shape
7. ✅ **Verify**: Shape appears locally (localStorage)
8. Uncheck "Offline"
9. ✅ **Verify**: Indicator changes back to "Connected" (green)
10. ✅ **Verify**: Shape syncs to Firebase (open second browser window to confirm)

#### Scenario 1.2: Slow Connection
1. DevTools → Network tab → Dropdown: Select "Slow 3G"
2. Create/move shapes rapidly
3. ✅ **Verify**: Local updates are instant (optimistic UI)
4. ✅ **Verify**: Indicator might show "Connecting..." (yellow) temporarily
5. ✅ **Verify**: Shapes eventually sync (may take 5-10 seconds)
6. DevTools → Network tab → Dropdown: Select "No throttling"

#### Scenario 1.3: Intermittent Connection
1. Rapidly toggle Offline → Online → Offline several times
2. ✅ **Verify**: Indicator updates appropriately without crashing
3. ✅ **Verify**: Eventually stabilizes when connection is stable

---

### Test 2: Performance with High Shape Count

#### Preparation: Generate Test Shapes
**Method 1: Ctrl+D Duplication (Recommended)**
1. Create 3-5 different shapes (rectangle, circle, line, text)
2. Select all (`Ctrl/Cmd+A`)
3. Duplicate (`Ctrl/Cmd+D`) → Creates copies at same position
4. Drag originals aside to reveal duplicates
5. Select all again
6. Duplicate (`Ctrl/Cmd+D`) → Now you have 4x the shapes
7. Drag originals aside
8. Repeat: Select all → Ctrl+D → Drag until you have 50+ shapes
9. Continue to 100, 300, 500 shapes

**Method 2: AI Agent (if available)**
```
"Create 20 random rectangles"
"Create 20 circles in a grid"
"Create 10 lines"
```

#### Scenario 2.1: 100 Shapes Performance
1. Generate 100 shapes using copy/paste
2. Press `Shift+F` to show FPS monitor
3. Pan around the canvas
4. Zoom in/out
5. ✅ **Verify**: FPS stays above 30 (preferably 50-60)
6. ✅ **Record**: Average FPS, min FPS, max FPS

#### Scenario 2.2: 300 Shapes Performance
1. Continue pasting to reach 300 shapes
2. Monitor FPS while panning/zooming
3. ✅ **Verify**: FPS stays reasonable (20-30+ acceptable)
4. ✅ **Record**: Performance metrics
5. ✅ **Observe**: Any slowdowns, lag, or stuttering

#### Scenario 2.3: 500 Shapes (Stress Test)
1. Continue to 500 shapes
2. Monitor FPS and browser responsiveness
3. ✅ **Record**: At what point does performance degrade significantly?
4. ✅ **Document**: Any crashes, freezes, or memory issues

---

### Test 3: Multi-User Conflict Resolution

#### Preparation: Multi-User Setup
1. Open the app in 3 browser windows/tabs
2. Log in as different users:
   - Window 1: `user1@test.com` / `password123`
   - Window 2: `user2@test.com` / `password123`
   - Window 3: `user3@test.com` / `password123`
3. Create a few test shapes visible to all users

#### Scenario 3.1: Simultaneous Move
1. In **Window 1**: Select a rectangle
2. In **Window 2**: Try to select the same rectangle
3. ✅ **Verify**: Window 2 sees red border (locked by user1)
4. ✅ **Verify**: Window 2 cannot drag it
5. In **Window 1**: Drag the shape to a new position
6. ✅ **Verify**: Window 2 and 3 see the shape move in real-time
7. In **Window 1**: Deselect (click canvas)
8. ✅ **Verify**: Border disappears in all windows
9. In **Window 2**: Now select and drag the same shape
10. ✅ **Verify**: Works without conflict

#### Scenario 3.2: Rapid Edit Storm
1. **Window 1**: Select shape → change color in DetailPane
2. **Window 2**: Select different shape → resize it
3. **Window 3**: Select third shape → rotate it
4. Do the above simultaneously/rapidly
5. ✅ **Verify**: No conflicts, all changes sync correctly
6. ✅ **Verify**: No data loss or corruption

#### Scenario 3.3: Delete vs Edit Conflict
1. **Window 1**: Select a shape and start resizing
2. **Window 2**: Try to delete the same shape (press Delete)
3. ✅ **Verify**: Window 2 cannot delete (shape is locked)
4. **Window 1**: Deselect
5. **Window 2**: Now delete the shape
6. ✅ **Verify**: Shape disappears in all windows immediately

---

### Test 4: Persistence & Reconnection

#### Scenario 4.1: Page Refresh During Operation
1. Create a few shapes
2. Select a shape and start dragging
3. **Mid-drag**, refresh the page (F5)
4. ✅ **Verify**: Shapes are restored from Firestore
5. ✅ **Verify**: No partial/corrupted shapes

#### Scenario 4.2: Network Disconnect/Reconnect
1. Create 3 shapes while online
2. DevTools → Offline
3. Create 2 more shapes (stored in localStorage only)
4. Move an existing shape
5. DevTools → Online
6. ✅ **Verify**: New shapes sync to Firestore
7. ✅ **Verify**: Moved shape syncs correctly
8. Open second window
9. ✅ **Verify**: All 5 shapes appear

#### Scenario 4.3: Extended Offline Period
1. DevTools → Offline
2. Create 10 shapes, move several around
3. Wait 2-3 minutes
4. DevTools → Online
5. ✅ **Verify**: All changes sync correctly
6. ✅ **Verify**: Indicator shows "Connected" (green)
7. ✅ **Verify**: No data loss

#### Scenario 4.4: Network Simulation (Realistic)
1. DevTools → Network tab → "Slow 3G"
2. Create shapes and edit rapidly
3. ✅ **Observe**: Optimistic UI (instant local updates)
4. ✅ **Verify**: Eventually syncs (may take 10-20 seconds)
5. DevTools → Network tab → "No throttling"

---

## 📊 Performance Metrics to Record

### FPS Benchmarks (Target: 30+ FPS under load)
- **Baseline (0-10 shapes)**: ___ FPS
- **Light load (50 shapes)**: ___ FPS
- **Medium load (100 shapes)**: ___ FPS
- **Heavy load (300 shapes)**: ___ FPS
- **Stress test (500 shapes)**: ___ FPS

### Sync Latency (Target: <500ms)
- **Shape creation**: ___ ms (time from create to appear in second window)
- **Shape movement**: ___ ms
- **Color change**: ___ ms
- **Delete**: ___ ms

### Memory Usage
- **Initial load**: ___ MB
- **After 100 shapes**: ___ MB
- **After 300 shapes**: ___ MB
- **After 500 shapes**: ___ MB

### Conflict Resolution
- **Simultaneous edits**: ✅ / ❌ (no data loss)
- **Delete vs edit**: ✅ / ❌ (locking prevents conflict)
- **Rapid changes**: ✅ / ❌ (all synced correctly)

### Reconnection
- **Offline → Online**: ✅ / ❌ (all shapes sync)
- **Page refresh**: ✅ / ❌ (state restored)
- **Network throttle**: ✅ / ❌ (eventual consistency)

---

## 🐛 Known Issues to Document

### Expected Behavior (Not Bugs)
- **Ctrl+D duplication**: Creates duplicates at same position (drag originals to reveal)
- **Alt+drag duplication**: Only works for single shape
- **200ms shape sync**: Firestore limitation, not real-time DB

### Potential Issues to Watch For
- Browser memory leak with 500+ shapes
- FPS drops below 20 with many shapes
- Connection status indicator stuck in "Connecting"
- Shapes not syncing after long offline period
- Race conditions with simultaneous edits

---

## 📝 Documentation Template

Copy this template for your test results:

```markdown
## Test Results - [Date]

### Environment
- Browser: Chrome/Firefox/Safari [version]
- OS: Windows/Mac/Linux
- Network: WiFi/Ethernet/Mobile
- Firebase Region: [region]

### Connection Status Tests
- [x] Hard disconnect/reconnect: PASSED
- [x] Slow connection handling: PASSED
- [ ] Intermittent connection: FAILED - [describe issue]

### Performance Tests
- Baseline (10 shapes): 60 FPS
- 100 shapes: 55 FPS
- 300 shapes: 35 FPS
- 500 shapes: 18 FPS - Noticeable lag when panning
- Memory: Started at 80MB, reached 250MB at 500 shapes

### Conflict Resolution Tests
- [x] Simultaneous move: PASSED
- [x] Delete vs edit: PASSED
- [ ] Rapid edit storm: PARTIAL - [describe issue]

### Persistence Tests
- [x] Page refresh: PASSED
- [x] Network disconnect/reconnect: PASSED
- [x] Extended offline: PASSED

### Notable Findings
- [List any interesting observations]
- [Performance bottlenecks identified]
- [Unexpected behaviors]

### Recommendations
- [Suggested optimizations]
- [Areas needing improvement]
```

---

## 🚀 Quick Start Checklist

Before you begin testing:
- [ ] Dev server running (`npm run dev`)
- [ ] Multiple test accounts created
- [ ] Chrome DevTools familiar with Network tab
- [ ] FPS monitor keyboard shortcut memorized (`Shift+F`)
- [ ] Duplication shortcut ready (`Ctrl/Cmd+D`)
- [ ] Second browser window open for multi-user tests
- [ ] Notepad/document ready for recording results

---

## 💡 Testing Tips

1. **Take screenshots** of interesting states (high FPS, low FPS, connection status changes)
2. **Record short videos** of smooth/laggy performance
3. **Use Chrome DevTools Performance tab** to identify bottlenecks
4. **Test on different devices** if possible (laptop, desktop, different browsers)
5. **Don't close browser windows** until you've documented results
6. **Save interesting edge cases** for future debugging

---

## 📧 Reporting Issues

When documenting issues, include:
- **Steps to reproduce**: Exact sequence of actions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happened
- **Screenshots/videos**: Visual evidence
- **Console logs**: Any errors in browser console
- **Environment**: Browser, OS, network conditions
- **Performance metrics**: FPS, memory, sync latency

---

Good luck with testing! 🎉

