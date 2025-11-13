// app/api/book/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CALENDLY_TOKEN = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN ?? ''
const CALENDLY_EVENT_TYPE_URI = process.env.CALENDLY_EVENT_TYPE_URI ?? ''

const MONTHLY_INCOME_OPTIONS = [
    '500$-1000$',
    '1000$-5000$',
    '5000$-8000$',
    "I don’t have an income",
] as const

const WILLINGNESS_OPTIONS = [
    '$0-$499 - I am not interested in investing alot, its too risky.',
    '$500-$999 - I have some money, but not ready to invest alot to get rich with crypto.',
    '$1000-$5000 - I am willing to invest a decent bit into actually getting rich with crypto, I have the capital and I am ready to start.',
    '$5000+ - I see people making millions, ill do whatever it takes to get rich. I have the money ready to invest, lets get to work.',
] as const

// schema expects the original form values + start_time + tz + bookingToken
const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    based: z.string().min(1),
    otherBased: z.string().optional(),
    occupation: z.string().min(1),
    monthlyIncome: z.enum(MONTHLY_INCOME_OPTIONS),
    willingnessToInvest: z.enum(WILLINGNESS_OPTIONS),
    message: z.string().optional(),
    consent: z.boolean().optional(),
    start_time: z.string().min(1),
    tz: z.string().optional(),
    bookingToken: z.string().min(8),
})
type Payload = z.infer<typeof schema>

/**
 * Custom error class to carry Calendly response details
 */
class CalendlyApiError extends Error {
    public status: number
    public payload: unknown
    constructor(status: number, payload: unknown, message?: string) {
        super(message ?? 'Calendly API error')
        this.name = 'CalendlyApiError'
        this.status = status
        this.payload = payload
    }
}

/**
 * Call Calendly Scheduling API: POST /invitees
 * Throws CalendlyApiError on non-2xx responses.
 */
// app/api/book/route.ts — replace createEventInviteeUsingSchedulingApi with this
async function createEventInviteeUsingSchedulingApi(eventTypeUri: string, startTimeRaw: string, payload: Payload) {
    if (!CALENDLY_TOKEN) throw new Error('Missing CALENDLY_PERSONAL_ACCESS_TOKEN')

    // Normalize the provided startTime string into canonical UTC ISO
    const startDate = new Date(startTimeRaw)
    if (isNaN(startDate.getTime())) {
        throw new CalendlyApiError(400, { message: 'Invalid start_time format' }, 'Invalid start_time format')
    }
    const canonicalStart = startDate.toISOString()

    // Extra sanity: start must be in the future (with small buffer)
    const minFutureMs = 30 * 1000 // 30 seconds buffer
    if (startDate.getTime() <= Date.now() + minFutureMs) {
        throw new CalendlyApiError(400, { message: 'start_time must be in the future' }, 'start_time must be in the future')
    }

    // ---- robust name handling to satisfy Calendly ----
    const rawName = String(payload.name ?? '').trim()
    // attempt to split into first and last name
    let first_name = ''
    let last_name = ''

    if (rawName.length === 0 && payload.email) {
        // fallback to email local-part when name missing
        const local = String(payload.email).split('@')[0] ?? 'Attendee'
        first_name = local
        last_name = 'NotProvided'
    } else if (rawName.includes(' ')) {
        const parts = rawName.split(/\s+/)
        first_name = parts.shift() ?? ''
        last_name = parts.join(' ') || 'NotProvided'
    } else {
        // single token name — use it as first name and try email local-part or default for last name
        first_name = rawName
        const emailLocal = payload.email ? String(payload.email).split('@')[0] : ''
        last_name = emailLocal ? `${emailLocal}` : 'NotProvided'
    }

    // Ensure non-empty strings (Calendly validates last_name)
    if (!first_name) first_name = 'Attendee'
    if (!last_name) last_name = 'NotProvided'

    const invitee = {
        name: rawName || `${first_name} ${last_name}`,
        first_name,
        last_name,
        email: payload.email,
        timezone: payload.tz ?? 'UTC',
        text_reminder_number: payload.phone ?? undefined,
    }

    const questions_and_answers = [
        { question: 'Phone Number', answer: payload.phone ?? '', position: 0 },
        { question: 'Where are you based?', answer: payload.based ?? payload.otherBased ?? '', position: 1 },
        { question: 'What do you do for a living?', answer: payload.occupation ?? '', position: 2 },
        { question: "What’s your current monthly income?", answer: payload.monthlyIncome ?? '', position: 3 },
        {
            question: 'How much are you willing to invest into yourself to get rich with crypto?',
            answer: payload.willingnessToInvest ?? '',
            position: 4,
        },
    ]

    const body = {
        event_type: eventTypeUri,
        start_time: canonicalStart, // canonical UTC ISO
        invitee,
        questions_and_answers,
        location: { kind: 'zoom_conference' }, // only if the event type lists 'zoom_conference'
    }

    // helpful debug log if you want to inspect what is being sent to Calendly
    // (remove or lower log level in production)
    console.info('Creating Calendly invitee', { start_time: canonicalStart, invitee: { first_name, last_name, email: invitee.email } })

    const res = await fetch('https://api.calendly.com/invitees', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${CALENDLY_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
    })

    const text = await res.text()
    let parsed: unknown
    try {
        parsed = JSON.parse(text)
    } catch {
        parsed = text
    }

    if (!res.ok) {
        // attach the exact payload we sent in logs so you can debug server-side
        console.error('Calendly create invitee failed', { status: res.status, bodySent: body, response: parsed })
        throw new CalendlyApiError(res.status, parsed, `Calendly create invitee failed (${res.status})`)
    }

    return parsed
}


/**
 * Heuristic to map Calendly error payloads => our client-facing error codes.
 * Returns object { code, message, calendlyPayload } where code is one of:
 * - 'SLOT_TAKEN' (slot already booked / conflict)
 * - 'INVALID_TIME' (invalid time / out of range / bad param)
 * - 'CALENDLY_ERROR' (other Calendly problem)
 */
function mapCalendlyErrorToCode(status: number, payload: unknown) {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {})

    // 409 => conflict / already booked
    if (status === 409) {
        return { code: 'SLOT_TAKEN', message: 'Selected slot already booked', calendlyPayload: payload }
    }

    // 400 with details mentioning start_time/end_time => invalid time selection
    if (status === 400) {
        try {
            const p = payload as any
            if (Array.isArray(p?.details)) {
                const params = p.details.map((d: any) => String(d.parameter ?? '').toLowerCase())
                if (params.includes('start_time') || params.includes('end_time')) {
                    return { code: 'INVALID_TIME', message: 'Selected time is invalid or out of range', calendlyPayload: payload }
                }
            }
            // some payloads have message text indicating invalid time
            if (typeof p?.message === 'string' && /start_time|end_time|invalid|in the future|range/i.test(p.message)) {
                return { code: 'INVALID_TIME', message: p.message, calendlyPayload: payload }
            }
        } catch {
            /* ignore parsing errors */
        }
    }

    // treat common "unavailable" / "already" text as slot taken
    if (/unavailable|already|taken|conflict/i.test(payloadStr)) {
        return { code: 'SLOT_TAKEN', message: 'Selected slot is no longer available', calendlyPayload: payload }
    }

    // fallback
    return { code: 'CALENDLY_ERROR', message: 'Calendly API error', calendlyPayload: payload }
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json()

        // CSRF double-submit
        const headerToken = req.headers.get('x-csrf-token')
        const cookieToken = req.cookies.get('csrfToken')?.value
        if (!headerToken || !cookieToken || headerToken !== cookieToken) {
            return NextResponse.json({ ok: false, error: 'Invalid CSRF token' }, { status: 403 })
        }

        const parsed = schema.safeParse(raw)
        if (!parsed.success) {
            return NextResponse.json({ ok: false, errors: parsed.error.format() }, { status: 400 })
        }
        const payload = parsed.data as Payload

        if (!CALENDLY_EVENT_TYPE_URI) {
            return NextResponse.json({ ok: false, error: 'Missing CALENDLY_EVENT_TYPE_URI in server env' }, { status: 500 })
        }

        // NOTE: bookingToken validation (peek/consume) should have happened before calling this route in your current flow.
        // Here we expect the token was already consumed by the caller (or you can keep your existing token consumption logic).

        try {
            const calendlyResp = await createEventInviteeUsingSchedulingApi(CALENDLY_EVENT_TYPE_URI, payload.start_time, payload)
            return NextResponse.json({ ok: true, calendly: calendlyResp })
        } catch (err) {
            if (err instanceof CalendlyApiError) {
                // Map Calendly error to friendly code and return structured info
                const mapped = mapCalendlyErrorToCode(err.status, err.payload)
                // Log the Calendly payload server-side for debugging (avoid logging secrets)
                console.error('Calendly API error', { status: err.status, code: mapped.code, payload: err.payload })
                if (mapped.code === 'SLOT_TAKEN') {
                    return NextResponse.json({ ok: false, code: 'SLOT_TAKEN', error: mapped.message, calendly: mapped.calendlyPayload }, { status: 409 })
                }
                if (mapped.code === 'INVALID_TIME') {
                    return NextResponse.json({ ok: false, code: 'INVALID_TIME', error: mapped.message, calendly: mapped.calendlyPayload }, { status: 400 })
                }
                // fallback for other calendly errors
                return NextResponse.json({ ok: false, code: 'CALENDLY_ERROR', error: mapped.message, calendly: mapped.calendlyPayload }, { status: 500 })
            }
            // Non-Calendly errors
            const message = err instanceof Error ? err.message : 'Server error'
            console.error('book route unexpected error', err)
            return NextResponse.json({ ok: false, error: message }, { status: 500 })
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Server error'
        console.error('book route error', err)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}
