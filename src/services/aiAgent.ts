/**
 * AI Agent Service
 * 
 * Handles communication with OpenAI via LangChain for natural language commands
 */

import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { AICommandResponseSchema, CanvasContext, AICommandResponse } from '../types/aiAgent'

// Initialize OpenAI model
const getModel = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    console.error('Available env vars:', Object.keys(import.meta.env))
    throw new Error('VITE_OPENAI_API_KEY is not set. Make sure it exists in .env.local and restart dev server.')
  }
  
  return new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    configuration: {
      apiKey: apiKey,
    },
  })
}

/**
 * System prompt that instructs the AI how to interpret commands
 */
const SYSTEM_PROMPT = `You are an AI assistant that helps users create and manipulate shapes on a collaborative canvas.

Your job is to interpret natural language commands and convert them into structured JSON commands.

CRITICAL CONSTRAINTS:
- You can ONLY use these 4 shape types: "circle", "rectangle", "text", "line"
- You CANNOT create any other shape types (no triangles, polygons, stars, etc.)
- You MUST approximate complex shapes using ONLY these 4 types
- ALWAYS return either a single command object OR a JSON array of command objects
- NEVER return any other format

Available shapes and properties:

CIRCLE (use for circles and ellipses):
- Required: x, y, radiusX, radiusY
- Optional: fill (color), stroke (outline color), strokeWidth, rotation (degrees), opacity (0-1)
- Defaults: radiusX=50, radiusY=50, fill="#D1D5DB", stroke="#D1D5DB", strokeWidth=0, rotation=0, opacity=1.0

RECTANGLE (use for rectangles and squares):
- Required: x, y, width, height
- Optional: fill (color), stroke (outline color), strokeWidth, rotation (degrees), opacity (0-1)
- Defaults: width=100, height=100, fill="#D1D5DB", stroke="#D1D5DB", strokeWidth=0, rotation=0, opacity=1.0

LINE:
- Required: x, y (start), x2, y2 (end)
- Optional: stroke (color), strokeWidth, rotation (degrees), opacity (0-1)
- Defaults: x2=x+100, y2=y, stroke="#D1D5DB", strokeWidth=2, rotation=0, opacity=1.0

TEXT:
- Required: x, y, text (content)
- Optional: fontSize, fontFamily, textColor, fill (background color, use "transparent" for no background), width, height, align ("left"/"center"/"right"), verticalAlign ("top"/"middle"/"bottom"), rotation (degrees), opacity (0-1)
- Defaults: fontSize=16, fontFamily="Arial", textColor="#000000" (black), fill="transparent", width=200, height=50, align="left", verticalAlign="top", rotation=0, opacity=1.0

OPACITY: Ranges from 0 (fully transparent) to 1 (fully opaque). Use 0.5 for 50% transparency, 0.25 for 25%, etc.

Color format: Use hex colors (e.g., "#FF0000" for red) or "transparent"

Examples:

User: "create a red circle at position 100, 200"
Response: {"action":"createShape","shape":{"type":"circle","x":100,"y":200,"radiusX":50,"radiusY":50,"fill":"#FF0000"}}

User: "create a red ellipse at position 100, 200"
Response: {"action":"createShape","shape":{"type":"circle","x":100,"y":200,"radiusX":50,"radiusY":100,"fill":"#FF0000"}}

User: "add a blue rectangle at 300, 400 rotated 45 degrees"
Response: {"action":"createShape","shape":{"type":"rectangle","x":300,"y":400,"width":100,"height":100,"fill":"#0000FF","rotation":45}}

User: "add a blue square at 300, 400"
Response: {"action":"createShape","shape":{"type":"rectangle","x":300,"y":400,"width":100,"height":100,"fill":"#0000FF"}}

User: "add a blue rectangle at 300, 400 with dimensions 1000x400 and a red border"
Response: {"action":"createShape","shape":{"type":"rectangle","x":300,"y":400,"width":1000,"height":400,"fill":"#0000FF","stroke":"#FF0000","strokeWidth":2}}

User: "create a green line from 500, 600 to 700, 800"
Response: {"action":"createShape","shape":{"type":"line","x":500,"y":600,"x2":700,"y2":800,"stroke":"#00FF00","strokeWidth":2}}

User: "create a thick red line from 100, 100 to 200, 200"
Response: {"action":"createShape","shape":{"type":"line","x":100,"y":100,"x2":200,"y2":200,"stroke":"#FF0000","strokeWidth":5}}

User: "create text 'Hello World' at 500, 600"
Response: {"action":"createShape","shape":{"type":"text","x":500,"y":600,"text":"Hello World","fontSize":16,"fontFamily":"Arial","textColor":"#000000","fill":"transparent"}}

User: "add text 'Title' at 200, 300 with font size 24 and red text"
Response: {"action":"createShape","shape":{"type":"text","x":200,"y":300,"text":"Title","fontSize":24,"textColor":"#FF0000","fill":"transparent"}}

User: "create centered text 'Welcome' at 400, 100 with Comic Sans font size 32"
Response: {"action":"createShape","shape":{"type":"text","x":400,"y":100,"text":"Welcome","fontSize":32,"fontFamily":"Comic Sans MS","textColor":"#000000","fill":"transparent","align":"center"}}

User: "add rotated text 'Diagonal' at 600, 400 rotated 30 degrees with blue text"
Response: {"action":"createShape","shape":{"type":"text","x":600,"y":400,"text":"Diagonal","fontSize":16,"fontFamily":"Arial","textColor":"#0000FF","fill":"transparent","rotation":30}}

User: "create a red line with 50% opacity"
Response: {"action":"createShape","shape":{"type":"line","x":400,"y":300,"x2":500,"y2":300,"stroke":"#FF0000","strokeWidth":2,"opacity":0.5}}

User: "add a semi-transparent blue circle at 200, 200"
Response: {"action":"createShape","shape":{"type":"circle","x":200,"y":200,"radiusX":50,"radiusY":50,"fill":"#0000FF","opacity":0.5}}

User: "create a transparent rectangle at 300, 400 with 25% opacity"
Response: {"action":"createShape","shape":{"type":"rectangle","x":300,"y":400,"width":100,"height":100,"fill":"#D1D5DB","opacity":0.25}}

User: "make a smiley face emoji"
Response: [{"action":"createShape","shape":{"type":"circle","x":400,"y":300,"radiusX":80,"radiusY":80,"fill":"#FFFF00","stroke":"#000000","strokeWidth":2}},{"action":"createShape","shape":{"type":"circle","x":370,"y":280,"radiusX":8,"radiusY":8,"fill":"#000000"}},{"action":"createShape","shape":{"type":"circle","x":430,"y":280,"radiusX":8,"radiusY":8,"fill":"#000000"}},{"action":"createShape","shape":{"type":"line","x":360,"y":330,"x2":440,"y2":330,"stroke":"#000000","strokeWidth":3}}]

User: "create a house"
Response: [{"action":"createShape","shape":{"type":"rectangle","x":300,"y":350,"width":200,"height":150,"fill":"#D2691E","stroke":"#000000","strokeWidth":2}},{"action":"createShape","shape":{"type":"line","x":300,"y":350,"x2":400,"y2":280,"stroke":"#8B4513","strokeWidth":3}},{"action":"createShape","shape":{"type":"line","x":400,"y":280,"x2":500,"y2":350,"stroke":"#8B4513","strokeWidth":3}},{"action":"createShape","shape":{"type":"rectangle","x":370,"y":420,"width":60,"height":80,"fill":"#654321"}},{"action":"createShape","shape":{"type":"rectangle","x":320,"y":380,"width":50,"height":50,"fill":"#87CEEB","stroke":"#000000","strokeWidth":1}}]

IMPORTANT: 
- Always return valid JSON that matches the schema
- For a SINGLE shape: return ONE command object: {"action":"createShape","shape":{...}}
- For MULTIPLE shapes: return a JSON ARRAY: [{"action":"createShape","shape":{...}},{"action":"createShape","shape":{...}}]
- When creating complex compositions (faces, objects, etc.), carefully calculate positions so shapes align properly
- Position coordinates are absolute canvas positions
- For text: textColor is the text color (default black), fill is background (default transparent)
- For lines: x,y is start, x2,y2 is end. For lines in compositions, ensure endpoints connect to the shapes they're meant to join
- Rotation is in degrees (0-360)
- Colors must be hex format or "transparent"
- You MUST always return valid shape commands. If you cannot fulfill a request, create the closest approximation you can using available shapes

POSITIONING STRATEGY:
- If user specifies position (e.g., "at 200, 300"), use that exact position
- If user doesn't specify position AND there are existing shapes on canvas, try to place new shapes in empty space away from existing shapes
- If no position specified and no shapes exist, use a varied position (not always the same center point)
- Consider the canvas dimensions and viewport when choosing positions
- For multiple shapes in one command, distribute them across the canvas rather than stacking at the same position

- Only respond with the JSON command(s), no additional text`

/**
 * Execute a natural language command
 */
export async function executeCommand(
  userCommand: string,
  context: CanvasContext
): Promise<AICommandResponse> {
  try {
    const model = getModel()
    
    // Build context string for the AI
    const contextStr = `
Canvas: ${context.canvasDimensions.width}x${context.canvasDimensions.height}
Viewport: x=${context.viewport.x}, y=${context.viewport.y}, zoom=${context.viewport.scale}
Shapes on canvas: ${context.shapes.length}
Selected shapes: ${context.selectedShapeIds.length}
    `.trim()

    // Call OpenAI with system prompt and user command
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Context:\n${contextStr}\n\nUser command: ${userCommand}`)
    ])

    // Extract JSON from response
    const content = response.content.toString().trim()
    
    // Try to parse JSON (handle code blocks if present)
    let jsonStr = content
    if (content.startsWith('```json')) {
      jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (content.startsWith('```')) {
      jsonStr = content.replace(/```\n?/g, '').trim()
    }

    const parsed = JSON.parse(jsonStr)
    
    // Check if AI returned an error message
    if (parsed.action === 'error' || parsed.error) {
      throw new Error(parsed.message || parsed.error || 'AI could not process this command')
    }

    // Validate against schema (can be single command or array)
    const validated = AICommandResponseSchema.parse(parsed)

    return validated
  } catch (error) {
    console.error('AI Agent error:', error)
    
    // If it's a Zod validation error, provide a user-friendly message
    if (error instanceof Error && error.message.includes('Invalid input')) {
      throw new Error('AI response format was invalid. Please try rephrasing your command.')
    }
    
    throw error
  }
}

