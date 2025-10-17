/**
 * Firebase Shape Sync
 * 
 * Handles shape synchronization with both Firestore (persistence) and RTDB (real-time)
 * - Firestore: Source of truth, locking, persistence
 * - RTDB: Low-latency position updates during drag/resize/rotate
 */

import { db, rtdb } from './firebase'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore'
import { ref, set, onValue, remove, get } from 'firebase/database'
import { Shape } from '../types'

const SHAPES_COLLECTION = 'shapes'

/**
 * Remove undefined values from an object (Firebase doesn't accept undefined)
 */
function sanitizeForFirebase(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

/**
 * Add or update a shape in Firestore
 */
export async function saveShape(shape: Shape): Promise<void> {
  const shapeRef = doc(db, SHAPES_COLLECTION, shape.id)
  const sanitizedShape = sanitizeForFirebase(shape as unknown as Record<string, unknown>)
  await setDoc(shapeRef, sanitizedShape)
}

/**
 * Update specific fields of a shape in Firestore
 */
export async function updateShapeFields(
  shapeId: string,
  updates: Partial<Shape>
): Promise<void> {
  const shapeRef = doc(db, SHAPES_COLLECTION, shapeId)
  await updateDoc(shapeRef, updates)
}

/**
 * Update specific fields for multiple shapes in a single batch operation
 * This is much more efficient and prevents race conditions when updating many shapes at once
 */
export async function batchUpdateShapeFields(
  updates: Array<{ shapeId: string; fields: Partial<Shape> }>
): Promise<void> {
  const batch = writeBatch(db)
  
  updates.forEach(({ shapeId, fields }) => {
    const shapeRef = doc(db, SHAPES_COLLECTION, shapeId)
    // Use set with merge instead of update to avoid errors if doc doesn't exist
    batch.set(shapeRef, fields, { merge: true })
  })
  
  try {
    await batch.commit()
    
    // ALSO update RTDB for real-time sync (Firestore snapshots aren't triggering reliably)
    const rtdbPromises = updates.map(async ({ shapeId, fields }) => {
      const rtdbShapeRef = ref(rtdb, `shapes/${shapeId}`)
      const rtdbSnapshot = await get(rtdbShapeRef)
      if (rtdbSnapshot.exists()) {
        await set(rtdbShapeRef, {
          ...rtdbSnapshot.val(),
          ...fields,
        })
      }
    })
    await Promise.all(rtdbPromises)
  } catch (error) {
    console.error('Failed to batch update shapes:', error)
    throw error
  }
}

/**
 * Delete a shape from Firestore
 */
export async function deleteShape(shapeId: string): Promise<void> {
  const shapeRef = doc(db, SHAPES_COLLECTION, shapeId)
  await deleteDoc(shapeRef)
}

/**
 * Listen to all shapes in real-time
 * Returns an unsubscribe function
 */
export function listenToShapes(
  callback: (shapes: Record<string, Shape>) => void
): Unsubscribe {
  const shapesCollection = collection(db, SHAPES_COLLECTION)
  
  return onSnapshot(shapesCollection, (snapshot) => {
    const shapes: Record<string, Shape> = {}
    
    snapshot.forEach((doc) => {
      const data = doc.data()

      // Create shape based on type
      if (data.type === 'circle') {
        shapes[doc.id] = {
          id: doc.id,
          type: 'circle',
          x: data.x || 0,
          y: data.y || 0,
          radiusX: data.radiusX || 0,
          radiusY: data.radiusY || 0,
          rotation: data.rotation || 0,
          opacity: data.opacity ?? 1.0,
          zIndex: data.zIndex ?? Date.now(),
          color: data.color || '#000000',
          stroke: data.stroke,
          strokeWidth: data.strokeWidth,
          createdBy: data.createdBy || '',
          lockedBy: data.lockedBy || null,
        }
      } else if (data.type === 'line') {
        shapes[doc.id] = {
          id: doc.id,
          type: 'line',
          x: data.x || 0,
          y: data.y || 0,
          x2: data.x2 || 0,
          y2: data.y2 || 0,
          strokeWidth: data.strokeWidth || 2,
          rotation: data.rotation || 0,
          opacity: data.opacity ?? 1.0,
          zIndex: data.zIndex ?? Date.now(),
          color: data.color || '#000000',
          createdBy: data.createdBy || '',
          lockedBy: data.lockedBy || null,
        }
      } else if (data.type === 'text') {
        shapes[doc.id] = {
          id: doc.id,
          type: 'text',
          x: data.x || 0,
          y: data.y || 0,
          width: data.width || 100,
          height: data.height || 50,
          text: data.text || '',
          fontSize: data.fontSize || 16,
          fontFamily: data.fontFamily || 'Arial',
          textColor: data.textColor || '#000000',
          align: data.align,
          verticalAlign: data.verticalAlign,
          rotation: data.rotation || 0,
          opacity: data.opacity ?? 1.0,
          zIndex: data.zIndex ?? Date.now(),
          color: data.color || '#D1D5DB',
          createdBy: data.createdBy || '',
          lockedBy: data.lockedBy || null,
        }
      } else if (data.type === 'rectangle') {
        shapes[doc.id] = {
          id: doc.id,
          type: 'rectangle',
          x: data.x || 0,
          y: data.y || 0,
          width: data.width || 0,
          height: data.height || 0,
          rotation: data.rotation || 0,
          opacity: data.opacity ?? 1.0,
          zIndex: data.zIndex ?? Date.now(),
          color: data.color || '#000000',
          stroke: data.stroke,
          strokeWidth: data.strokeWidth,
          createdBy: data.createdBy || '',
          lockedBy: data.lockedBy || null,
        }
      } else {
        // Unknown shape type - log error and skip
        console.error(`[firebaseShapes] Unknown shape type "${data.type}" for shape ${doc.id}. Skipping.`, data)
      }
    })
    
    callback(shapes)
  })
}

/**
 * Lock a shape (set lockedBy field)
 */
export async function lockShape(shapeId: string, userId: string): Promise<void> {
  // Update Firestore
  await updateShapeFields(shapeId, { lockedBy: userId })
  
  // Also update RTDB for real-time sync
  const rtdbShapeRef = ref(rtdb, `shapes/${shapeId}`)
  const rtdbSnapshot = await get(rtdbShapeRef)
  if (rtdbSnapshot.exists()) {
    await set(rtdbShapeRef, {
      ...rtdbSnapshot.val(),
      lockedBy: userId,
    })
  }
}

/**
 * Unlock a shape (clear lockedBy field in both Firestore and RTDB)
 */
export async function unlockShape(shapeId: string): Promise<void> {
  const shapeRef = doc(db, SHAPES_COLLECTION, shapeId)
  // Use setDoc with merge to ensure we set lockedBy to null explicitly
  await setDoc(shapeRef, { lockedBy: null }, { merge: true })
  
  // Also update in RTDB if the shape exists there
  const rtdbShapeRef = ref(rtdb, `shapes/${shapeId}`)
  const rtdbSnapshot = await get(rtdbShapeRef)
  if (rtdbSnapshot.exists()) {
    const rtdbShape = rtdbSnapshot.val()
    await set(rtdbShapeRef, { ...rtdbShape, lockedBy: null })
  }
}

/**
 * Unlock all shapes locked by a specific user
 * Called on user disconnect or sign out
 */
export async function unlockUserShapes(userId: string, shapes: Record<string, Shape>): Promise<void> {
  const shapesToUnlock = Object.values(shapes).filter(shape => shape.lockedBy === userId)
  
  // Unlock in Firestore
  const firestorePromises = shapesToUnlock.map(shape => {
    const shapeRef = doc(db, SHAPES_COLLECTION, shape.id)
    return setDoc(shapeRef, { lockedBy: null }, { merge: true })
  })
  
  // Unlock in RTDB
  const rtdbPromises = shapesToUnlock.map(shape => {
    const rtdbShapeRef = ref(rtdb, `shapes/${shape.id}`)
    return set(rtdbShapeRef, { ...shape, lockedBy: null })
  })
  
  await Promise.all([...firestorePromises, ...rtdbPromises])
}

/**
 * Unlock all shapes in both Firestore and RTDB (for initial load cleanup)
 * This ensures stale locks from crashed sessions are cleared
 */
export async function unlockAllShapes(shapes: Record<string, Shape>): Promise<void> {
  const lockedShapes = Object.values(shapes).filter(shape => shape.lockedBy !== null)
  
  // Unlock in Firestore
  const firestorePromises = lockedShapes.map(shape => {
    const shapeRef = doc(db, SHAPES_COLLECTION, shape.id)
    return setDoc(shapeRef, { lockedBy: null }, { merge: true })
  })
  
  // Unlock in RTDB
  const rtdbPromises = lockedShapes.map(shape => {
    const rtdbShapeRef = ref(rtdb, `shapes/${shape.id}`)
    return set(rtdbShapeRef, { ...shape, lockedBy: null })
  })
  
  await Promise.all([...firestorePromises, ...rtdbPromises])
}

// ============================================================================
// RTDB Functions (Real-time, low-latency updates)
// ============================================================================

/**
 * Sync shape to RTDB for real-time updates
 * This should be throttled by the caller (50ms)
 */
export async function syncShapeToRTDB(shape: Shape): Promise<void> {
  const shapeRef = ref(rtdb, `shapes/${shape.id}`)
  const sanitizedShape = sanitizeForFirebase(shape as unknown as Record<string, unknown>)
  await set(shapeRef, sanitizedShape)
}

/**
 * Remove a shape from RTDB
 */
export async function removeShapeFromRTDB(shapeId: string): Promise<void> {
  const shapeRef = ref(rtdb, `shapes/${shapeId}`)
  await remove(shapeRef)
}

/**
 * Listen to all shapes in RTDB for real-time updates
 * Returns an unsubscribe function
 */
export function listenToRTDBShapes(
  callback: (shapes: Record<string, Shape>) => void
): () => void {
  const shapesRef = ref(rtdb, 'shapes')
  
  const unsubscribe = onValue(shapesRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) {
      callback({})
      return
    }

    // Transform data to Shape objects
    const shapes: Record<string, Shape> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(data).forEach(([shapeId, shapeData]: [string, any]) => {
      // Create shape based on type
      if (shapeData.type === 'circle') {
        shapes[shapeId] = {
          id: shapeId,
          type: 'circle',
          x: shapeData.x || 0,
          y: shapeData.y || 0,
          radiusX: shapeData.radiusX || 0,
          radiusY: shapeData.radiusY || 0,
          rotation: shapeData.rotation || 0,
          opacity: shapeData.opacity ?? 1.0,
          zIndex: shapeData.zIndex ?? Date.now(),
          color: shapeData.color || '#000000',
          stroke: shapeData.stroke,
          strokeWidth: shapeData.strokeWidth,
          createdBy: shapeData.createdBy || '',
          lockedBy: shapeData.lockedBy || null,
        }
      } else if (shapeData.type === 'line') {
        shapes[shapeId] = {
          id: shapeId,
          type: 'line',
          x: shapeData.x || 0,
          y: shapeData.y || 0,
          x2: shapeData.x2 || 0,
          y2: shapeData.y2 || 0,
          strokeWidth: shapeData.strokeWidth || 2,
          rotation: shapeData.rotation || 0,
          opacity: shapeData.opacity ?? 1.0,
          zIndex: shapeData.zIndex ?? Date.now(),
          color: shapeData.color || '#000000',
          createdBy: shapeData.createdBy || '',
          lockedBy: shapeData.lockedBy || null,
        }
      } else if (shapeData.type === 'text') {
        shapes[shapeId] = {
          id: shapeId,
          type: 'text',
          x: shapeData.x || 0,
          y: shapeData.y || 0,
          width: shapeData.width || 100,
          height: shapeData.height || 50,
          text: shapeData.text || '',
          fontSize: shapeData.fontSize || 16,
          fontFamily: shapeData.fontFamily || 'Arial',
          textColor: shapeData.textColor || '#000000',
          align: shapeData.align,
          verticalAlign: shapeData.verticalAlign,
          rotation: shapeData.rotation || 0,
          opacity: shapeData.opacity ?? 1.0,
          zIndex: shapeData.zIndex ?? Date.now(),
          color: shapeData.color || '#D1D5DB',
          createdBy: shapeData.createdBy || '',
          lockedBy: shapeData.lockedBy || null,
        }
      } else if (shapeData.type === 'rectangle') {
        shapes[shapeId] = {
          id: shapeId,
          type: 'rectangle',
          x: shapeData.x || 0,
          y: shapeData.y || 0,
          width: shapeData.width || 0,
          height: shapeData.height || 0,
          rotation: shapeData.rotation || 0,
          opacity: shapeData.opacity ?? 1.0,
          zIndex: shapeData.zIndex ?? Date.now(),
          color: shapeData.color || '#000000',
          stroke: shapeData.stroke,
          strokeWidth: shapeData.strokeWidth,
          createdBy: shapeData.createdBy || '',
          lockedBy: shapeData.lockedBy || null,
        }
      } else {
        // Unknown shape type - log error and skip
        console.error(`[firebaseShapes] Unknown shape type "${shapeData.type}" for shape ${shapeId}. Skipping.`, shapeData)
      }
    })

    callback(shapes)
  })

  return unsubscribe
}

/**
 * Initialize RTDB shape sync
 * Note: RTDB is treated as ephemeral cache - shapes are loaded from Firestore on app start
 * and stay in RTDB until explicitly removed or app refresh
 */
export function initShapeRTDBSync(): void {
  // RTDB is ephemeral - we repopulate from Firestore on each app load
  // No disconnect cleanup needed as RTDB is just a cache
  // This keeps implementation simple and avoids race conditions with multiple users
}

/**
 * Populate RTDB with shapes from Firestore
 * Call this on app load to sync Firestore → RTDB
 */
export async function populateRTDBFromFirestore(shapes: Record<string, Shape>): Promise<void> {
  const promises = Object.values(shapes).map(shape => syncShapeToRTDB(shape))
  await Promise.all(promises)
}

/**
 * Clear all shapes from RTDB
 * Called on logout or when needed
 */
export async function clearAllShapesFromRTDB(): Promise<void> {
  const shapesRef = ref(rtdb, 'shapes')
  await remove(shapesRef)
}

