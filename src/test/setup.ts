import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Extend globalThis type
declare global {
  // eslint-disable-next-line no-var
  var expect: typeof import('vitest').expect
}

// Make expect available globally
globalThis.expect = expect

