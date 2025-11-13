// lib/bookingTokens.ts
import crypto from 'crypto'

/**
 * Tiny in-memory booking-token store.
 * For production replace with a Redis/Upstash implementation.
 */

// ---------------------- Types ----------------------
export type TokenEntry = {
    availableTimes: string[] // ISO strings
    createdAt: number
    expiresAt: number
}

// ---------------------- Global store ----------------------
// Explicitly declare the global variable with proper typing so TS doesn't infer `any`.
declare global {
    // eslint-disable-next-line no-var
    var __BOOKING_TOKENS__: Map<string, TokenEntry> | undefined
}

// Create a typed alias for globalThis so we can read/write the property without implicit any.
const G = globalThis as unknown as { __BOOKING_TOKENS__?: Map<string, TokenEntry> }

// Initialize the store if not already present
const TOKENS: Map<string, TokenEntry> = G.__BOOKING_TOKENS__ ?? new Map<string, TokenEntry>()
G.__BOOKING_TOKENS__ = TOKENS

// ---------------------- Config ----------------------
export const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ---------------------- Helpers ----------------------

// Secure random hex string using Node's crypto.
// lengthBytes = number of bytes; resulting hex length = lengthBytes * 2
function randomHex(lengthBytes = 24): string {
    return crypto.randomBytes(lengthBytes).toString('hex')
}

/**
 * Create a one-time booking token that stores the provided availableTimes for ttlMs.
 * Returns the token string.
 */
export function createBookingToken(availableTimes: string[], ttlMs: number = DEFAULT_TTL_MS): string {
    const token = randomHex(24)
    const now = Date.now()
    const entry: TokenEntry = {
        availableTimes: Array.from(availableTimes),
        createdAt: now,
        expiresAt: now + ttlMs,
    }
    TOKENS.set(token, entry)

    // best-effort cleanup
    setTimeout(() => {
        const e = TOKENS.get(token)
        if (e && e.expiresAt <= Date.now()) TOKENS.delete(token)
    }, ttlMs + 1000)

    return token
}

/**
 * Peek at a booking token without consuming it.
 * Returns a copy of availableTimes or null if missing/expired.
 */
export function peekBookingToken(token: string): string[] | null {
    const entry = TOKENS.get(token)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
        TOKENS.delete(token)
        return null
    }
    return Array.from(entry.availableTimes)
}

/**
 * Consume the booking token (one-time). Returns true if the token was valid and contained the chosenStartTime.
 * Token is removed in any case (one-time).
 */
export function consumeBookingTokenIfValid(token: string, chosenStartTime: string): boolean {
    const entry = TOKENS.get(token)
    if (!entry) return false
    if (entry.expiresAt <= Date.now()) {
        TOKENS.delete(token)
        return false
    }
    const ok = entry.availableTimes.includes(chosenStartTime)
    TOKENS.delete(token)
    return ok
}

/**
 * Utility: delete a token explicitly.
 */
export function deleteBookingToken(token: string): void {
    TOKENS.delete(token)
}

// Ensure this file is treated as a module
export { }
