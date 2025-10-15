# AI Canvas Agent Implementation Plan

## Overview

**Rubric Value**: 25 points (largest single section)  
**Target**: 15-18 points (Good tier)  
**Timeline**: Days 2-3 (after shapes + color + multi-select are complete)

## Prerequisites (Must be complete BEFORE starting AI)

- ✅ 4 shape types: rectangle, circle, line, text
- ✅ Color manipulation for all shapes
- ✅ Multi-select functionality
- ✅ All manipulation operations (move, resize, rotate, color)

## Rubric Requirements

### Command Breadth (10 points target: 7-8)
- Need 6-7 distinct command types minimum
- Must cover 4 categories: Creation, Manipulation, Layout, Complex

### Complex Command Execution (8 points target: 5-6)
- "Create login form" should produce 3+ properly arranged elements
- Basic layout quality
- Elements created and reasonably arranged

### AI Performance & Reliability (7 points target: 4-5)
- 2-3 second response times
- 80%+ accuracy
- Good UX with feedback
- Shared state works (multi-user AI)

## Architecture Design

### Option 1: Direct LLM → Canvas Operations (RECOMMENDED)
**Flow**: User prompt → LLM with structured prompt → JSON response → Parse → Execute canvas ops

**Pros**:
- Simple, fast implementation
- Full control over response format
- Easy to test and debug
- Sub-2 second responses achievable

**Cons**:
- Requires careful prompt engineering
- May need retries for malformed responses

**Recommended Provider**: OpenAI GPT-4 or GPT-4-turbo
- Proven JSON mode
- Good at following structured instructions
- Reasonable pricing ($0.01-0.03 per request estimated)

### Option 2: LLM + Function Calling
**Flow**: User prompt → LLM with function definitions → LLM calls functions → Execute

**Pros**:
- More "natural" for LLM
- Built-in validation

**Cons**:
- Slower (multiple round trips)
- More complex to implement
- May not hit sub-3s target

## Implementation Phases

### Phase 1: Infrastructure (4-6 hours)

**1. AI Provider Setup**
```typescript
// src/services/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For demo only - move to backend in production
});

export default openai;
```

**2. Environment Variables**
Add to `.env.local`:
```
VITE_OPENAI_API_KEY=sk-...
```

**3. AI Service Module**
```typescript
// src/services/aiAgent.ts
interface CanvasCommand {
  operation: 'create' | 'move' | 'resize' | 'rotate' | 'changeColor' | 'arrange' | 'delete';
  shapeType?: 'rectangle' | 'circle' | 'line' | 'text';
  properties: Record<string, any>;
}

export async function processAICommand(
  prompt: string,
  currentShapes: Shape[],
  userId: string
): Promise<CanvasCommand[]> {
  // Implementation in Phase 2
}
```

**4. UI Components**
```typescript
// src/components/AICommandInput.tsx
// Floating panel or toolbar addition
// Input field + submit button
// Loading state indicator
// Error display
```

### Phase 2: Command Implementation (8-10 hours)

**Prompt Structure** (Critical for success)

```typescript
const systemPrompt = `You are an AI assistant for a collaborative canvas application.
You can execute commands by returning JSON arrays of canvas operations.

Available shape types: rectangle, circle, line, text
Available operations: create, move, resize, rotate, changeColor, arrange

Available colors: red, blue, green, yellow, orange, purple, pink, gray, black, white

Canvas dimensions: 5000x5000 (center at 2500, 2500)
Typical viewport: ~1200x800 centered around 2500, 2500

IMPORTANT: Always return valid JSON array of commands. No explanations, just JSON.

Examples:

User: "Create a red circle at 100, 200"
Response: [{"operation":"create","shapeType":"circle","properties":{"x":100,"y":200,"radiusX":50,"radiusY":50,"color":"red"}}]

User: "Create a login form"
Response: [
  {"operation":"create","shapeType":"text","properties":{"x":2400,"y":2300,"text":"Login","fontSize":24}},
  {"operation":"create","shapeType":"rectangle","properties":{"x":2300,"y":2350,"width":300,"height":40,"color":"white"}},
  {"operation":"create","shapeType":"text","properties":{"x":2310,"y":2360,"text":"Username","fontSize":14}},
  {"operation":"create","shapeType":"rectangle","properties":{"x":2300,"y":2410,"width":300,"height":40,"color":"white"}},
  {"operation":"create","shapeType":"text","properties":{"x":2310,"y":2420,"text":"Password","fontSize":14}},
  {"operation":"create","shapeType":"rectangle","properties":{"x":2350,"y":2470,"width":200,"height":50,"color":"blue"}},
  {"operation":"create","shapeType":"text","properties":{"x":2420,"y":2485,"text":"Submit","fontSize":16,"color":"white"}}
]

Now process the user's command.`;
```

**Command Categories to Implement**

**Creation Commands (2-3 minimum)**:
1. "Create a [color] [shape] at [x], [y]"
2. "Add a text that says '[text]' at [x], [y]"
3. "Make a [width]x[height] rectangle"

**Manipulation Commands (2-3 minimum)**:
4. "Move [shape description] to [x], [y]" or "to the center"
5. "Change the color of [shape] to [color]"
6. "Resize [shape] to [dimensions]"

**Layout Commands (2 minimum)**:
7. "Arrange [shapes] in a horizontal/vertical row"
8. "Create a grid of [n]x[m] [shapes]"

**Complex Commands (2 minimum)**:
9. "Create a login form" (as shown above)
10. "Build a navigation bar with [n] menu items"
11. "Make a card with title, image placeholder, and description"
12. "Create a button with label [text]"

### Phase 3: Command Execution (4-6 hours)

```typescript
// src/services/commandExecutor.ts
export async function executeCommands(
  commands: CanvasCommand[],
  shapeStore: ShapeStore,
  userId: string
): Promise<void> {
  for (const cmd of commands) {
    switch (cmd.operation) {
      case 'create':
        const newShape = {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: cmd.shapeType,
          ...cmd.properties,
          createdBy: userId,
          createdAt: Date.now(),
          lockedBy: null,
        };
        shapeStore.addShape(newShape);
        break;
        
      case 'move':
        // Find shape(s) matching description
        // Update x, y
        break;
        
      case 'changeColor':
        // Find shape(s), update color
        break;
        
      case 'arrange':
        // Calculate new positions for layout
        break;
    }
  }
}
```

### Phase 4: Multi-User Support (2-3 hours)

**Considerations**:
1. AI commands create shapes with `createdBy` set to commanding user
2. Shapes immediately sync to Firestore (existing logic handles this)
3. Multiple users can issue AI commands simultaneously
4. Each command execution is atomic (all shapes created together)

**Conflict Prevention**:
- AI never modifies shapes locked by other users
- AI operations use same locking mechanism as manual edits
- Show attribution in UI (optional: "Created by AI at [user]'s request")

### Phase 5: Testing & Refinement (4-6 hours)

**Unit Tests** (10-15 tests):
- Prompt parsing
- JSON validation
- Command execution
- Shape creation from commands
- Error handling (malformed JSON, invalid commands)

**Integration Tests** (5-8 tests):
- Full flow: prompt → LLM → parse → execute
- Complex commands (login form, navigation bar)
- Multi-step layouts (grids, rows)
- Shape identification (move "the red circle")

**Accuracy Testing**:
- Test 20-30 diverse prompts
- Measure success rate (target 80%+)
- Document failures and edge cases
- Refine system prompt based on results

**Performance Testing**:
- Measure response times (target <3s)
- Test with concurrent AI commands (2+ users)
- Verify Firestore sync works under AI load

## Expected Time Investment

| Phase | Time Estimate | Priority |
|-------|--------------|----------|
| Phase 1: Infrastructure | 4-6 hours | High |
| Phase 2: Commands | 8-10 hours | Critical |
| Phase 3: Execution | 4-6 hours | High |
| Phase 4: Multi-User | 2-3 hours | Medium |
| Phase 5: Testing | 4-6 hours | High |
| **Total** | **22-31 hours** | **Spread over 1.5-2 days** |

## Risk Mitigation

**Risk 1: LLM returns malformed JSON**
- **Mitigation**: Try-catch with retry (max 2 retries)
- Show user-friendly error: "AI couldn't understand that command. Try rephrasing."

**Risk 2: Response times too slow (>3s)**
- **Mitigation**: Use GPT-4-turbo (faster), keep prompts concise
- Show progress indicator so user knows AI is thinking

**Risk 3: Accuracy below 80%**
- **Mitigation**: Extensive prompt engineering, provide more examples
- Add command validation layer (sanity check before execution)

**Risk 4: Cost concerns (OpenAI API)**
- **Mitigation**: Estimate ~$0.02 per command, acceptable for demo
- Document API costs in README
- Consider rate limiting (1 command per 5 seconds per user)

## Minimum Viable AI Agent (If Time Constrained)

If falling behind schedule, implement this reduced scope for satisfactory tier (13 pts):

**6 commands only**:
1. Create shape (any type, any position)
2. Move shape to center
3. Change color
4. Create row of shapes
5. Create login form (3 elements minimum)
6. Create button

**Simplified execution**:
- No shape identification (only work with "all shapes" or "new shapes")
- Basic layouts only (rows, no grids)
- Fixed positioning for complex commands

**Reduced testing**:
- 5-8 unit tests
- 3-5 integration tests
- Manual testing only for accuracy

This still achieves ~13 points (Satisfactory tier) and saves ~10 hours.

## Success Metrics

**Good Tier (Target: 15-18 points)**
- ✅ 7 command types
- ✅ 2-3 second responses
- ✅ Complex commands work (3-4 elements)
- ✅ 80%+ accuracy
- ✅ Multi-user works

**Satisfactory Tier (Fallback: 13-14 points)**
- ✅ 6 command types
- ✅ 3-5 second responses
- ✅ Basic complex commands (2-3 elements)
- ✅ 60%+ accuracy
- ✅ Basic multi-user

## Post-Implementation Checklist

- [ ] All 8+ commands working
- [ ] Response times measured (<3s)
- [ ] Accuracy rate measured (>80%)
- [ ] Multi-user testing done (2+ users)
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Error handling robust
- [ ] UI feedback clear (loading, errors)
- [ ] README updated with AI capabilities
- [ ] API keys documented
- [ ] Demo video includes 5-8 AI commands

