/**
 * AI Intent Classifier
 * 
 * Stage 1: Classifies user commands into specific intents
 */

import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'

// Intent types
export const IntentSchema = z.object({
  intent: z.enum(['create', 'update', 'delete', 'layout', 'arrange']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(), // For debugging
})

export type Intent = z.infer<typeof IntentSchema>

const CLASSIFICATION_PROMPT = `You are an intent classifier for a canvas manipulation system.

Your job is to classify user commands into ONE of these intents:

1. **create**: User wants to CREATE new shapes
   - Examples: "add a circle", "create a red rectangle", "make a house", "draw text"
   
2. **update**: User wants to MODIFY existing shapes
   - Examples: "make circle-1 red", "move rectangle-2 to 100,200", "rotate my-shape 45 degrees", "change selected to blue"
   - KEY: If a shape NAME is mentioned (like "circle-1", "my-box"), it's ALWAYS an update
   
3. **delete**: User wants to REMOVE shapes
   - Examples: "delete circle-1", "remove all rectangles", "delete selected shapes"
   
4. **layout**: User wants to ARRANGE shapes in a pattern
   - Examples: "arrange in a grid", "distribute horizontally", "align to center"
   
5. **arrange**: User wants to ORGANIZE or GROUP shapes
   - Examples: "group these shapes", "bring to front", "send to back"

CRITICAL RULES:
- If a shape name is mentioned (e.g., "circle-1", "my-box", "rectangle-2"), the intent is ALWAYS "update" or "delete"
- "make X" can be create OR update depending on context:
  - "make a circle" → create (no specific shape referenced)
  - "make circle-1 red" → update (specific shape referenced)
- Return ONLY valid JSON matching the schema

Response format:
{
  "intent": "create|update|delete|layout|arrange",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Examples:

User: "create a red circle"
Response: {"intent":"create","confidence":1.0,"reasoning":"Explicitly creating new shape"}

User: "make circle-1 blue"
Response: {"intent":"update","confidence":1.0,"reasoning":"Referencing specific shape by name"}

User: "move rectangle-2 to 500, 600"
Response: {"intent":"update","confidence":1.0,"reasoning":"Moving existing shape"}

User: "delete all circles"
Response: {"intent":"delete","confidence":1.0,"reasoning":"Removing shapes"}

User: "remove my-shape"
Response: {"intent":"delete","confidence":1.0,"reasoning":"Deleting specific shape"}

User: "make selected shapes bigger"
Response: {"intent":"update","confidence":1.0,"reasoning":"Modifying selected shapes"}

User: "add a square"
Response: {"intent":"create","confidence":1.0,"reasoning":"Creating new shape"}

User: "arrange in a grid"
Response: {"intent":"layout","confidence":1.0,"reasoning":"Organizing shapes in pattern"}

Respond ONLY with the JSON, no other text.`

const getModel = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not set')
  }
  
  return new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.3, // Lower temp for more consistent classification
    configuration: {
      apiKey: apiKey,
    },
  })
}

/**
 * Classify a user command into an intent
 */
export async function classifyIntent(userCommand: string): Promise<Intent> {
  try {
    const model = getModel()
    
    const response = await model.invoke([
      new SystemMessage(CLASSIFICATION_PROMPT),
      new HumanMessage(`User command: ${userCommand}`)
    ])

    const content = response.content.toString().trim()
    
    // Parse JSON
    let jsonStr = content
    if (content.startsWith('```json')) {
      jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (content.startsWith('```')) {
      jsonStr = content.replace(/```\n?/g, '').trim()
    }

    const parsed = JSON.parse(jsonStr)
    const validated = IntentSchema.parse(parsed)

    console.log('🎯 Intent classified:', validated)
    
    return validated
  } catch (error) {
    console.error('Intent classification error:', error)
    // Default to 'create' if classification fails
    return {
      intent: 'create',
      confidence: 0.5,
      reasoning: 'Classification failed, defaulting to create'
    }
  }
}

