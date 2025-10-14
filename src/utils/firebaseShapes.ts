/**
 * Firebase Firestore Shape Sync
 * 
 * Handles real-time shape synchronization with Firestore
 */

import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore'
import { Shape } from '../types'

const SHAPES_COLLECTION = 'shapes'

/**
 * Add or update a shape in Firestore
 */
export async function saveShape(shape: Shape): Promise<void> {
  const shapeRef = doc(db, SHAPES_COLLECTION, shape.id)
  await setDoc(shapeRef, shape)
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
      shapes[doc.id] = {
        id: doc.id,
        type: data.type || 'rectangle',
        x: data.x || 0,
        y: data.y || 0,
        width: data.width || 0,
        height: data.height || 0,
        color: data.color || '#000000',
        createdBy: data.createdBy || '',
        lockedBy: data.lockedBy || null,
      }
    })
    
    callback(shapes)
  })
}

/**
 * Lock a shape (set lockedBy field)
 */
export async function lockShape(shapeId: string, userId: string): Promise<void> {
  await updateShapeFields(shapeId, { lockedBy: userId })
}

/**
 * Unlock a shape (clear lockedBy field)
 */
export async function unlockShape(shapeId: string): Promise<void> {
  const shapeRef = doc(db, SHAPES_COLLECTION, shapeId)
  // Use setDoc with merge to ensure we set lockedBy to null explicitly
  await setDoc(shapeRef, { lockedBy: null }, { merge: true })
}

