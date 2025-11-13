// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createBookingToken } from '@/lib/bookingTokens'

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET ?? ''
const CALENDLY_TOKEN = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN ?? 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzYzMDQ2OTMxLCJqdGkiOiI1MjBiZTZlNi0zMjMyLTRlMTItOTIzOS1hYjZhZGNlNzA3MTUiLCJ1c2VyX3V1aWQiOiI5MzgxMjU2OS1mMjk4LTRjYWMtOTVkOS02NWUwYWQ4MzU2NTMifQ.hKxbdcQ3x2zTMTkXduTSDy7aqke0gAAuZTdhoZlf7Hkw-imIvbGj2kGrEdJEui9ykkhRCSyP8vzUOZTmRoAxZA'
const CALENDLY_EVENT_TYPE_URI = process.env.CALENDLY_EVENT_TYPE_URI ?? 'https://api.calendly.com/event_types/2e5780d4-1b27-4a6c-8ad8-3c7ce8174c2b'

const WILLINGNESS_LOW = new Set([
    '$0-$499 - I am not interested in investing alot, its too risky.',
    '$500-$999 - I have some money, but not ready to invest alot to get rich with crypto.',
])

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

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    based: z.string().min(1),
    otherBased: z.string().optional(),
    occupation: z.string().min(1),
    monthlyIncome: z.enum(MONTHLY_INCOME_OPTIONS),
    willingnessToInvest: z.enum(WILLINGNESS_OPTIONS),
    recaptchaToken: z.string().optional(),
    tz: z.string().optional(),
})
type Payload = z.infer<typeof schema>

async function verifyRecaptcha(token?: string | null): Promise<boolean> {
    if (!RECAPTCHA_SECRET) return false
    if (!token) return false
    const params = new URLSearchParams()
    params.append('secret', RECAPTCHA_SECRET)
    params.append('response', token)
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json?.success) && (typeof json.score === 'number' ? json.score >= 0.5 : true)
}


// server: normalize available times to canonical UTC ISO strings
async function fetchAvailableTimes(eventTypeUri: string, tz?: string, daysWindow = 7): Promise<string[]> {
    if (!CALENDLY_TOKEN) throw new Error('Missing CALENDLY_PERSONAL_ACCESS_TOKEN')

    // clamp window to 1..7
    const windowDays = Math.max(1, Math.min(7, Math.trunc(daysWindow)))
    const now = new Date()
    const bufferMs = 60 * 1000 // ensure start > now
    const startDate = new Date(Math.max(now.getTime() + bufferMs, now.getTime() + 1000))
    const endDate = new Date(startDate.getTime() + windowDays * 24 * 60 * 60 * 1000)

    const params = new URLSearchParams({
        event_type: eventTypeUri,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
    })
    if (tz) params.set('timezone', tz)

    const url = `https://api.calendly.com/event_type_available_times?${params.toString()}`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${CALENDLY_TOKEN}`,
            Accept: 'application/json',
        },
    })

    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Calendly available times error ${res.status}: ${txt}`)
    }

    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyJson = json as any
    const rawTimes: string[] = []

    // prefer start_time_utc if present, then start_time
    if (Array.isArray(anyJson.available_times)) {
        for (const t of anyJson.available_times) {
            if (typeof t?.start_time_utc === 'string') rawTimes.push(t.start_time_utc)
            else if (typeof t?.start_time === 'string') rawTimes.push(t.start_time)
            else if (typeof t?.start === 'string') rawTimes.push(t.start)
        }
    }

    // fallback nested shapes
    if (rawTimes.length === 0 && Array.isArray(anyJson.collection)) {
        for (const c of anyJson.collection) {
            if (Array.isArray(c?.available_times)) {
                for (const t of c.available_times) {
                    if (typeof t?.start_time_utc === 'string') rawTimes.push(t.start_time_utc)
                    else if (typeof t?.start_time === 'string') rawTimes.push(t.start_time)
                    else if (typeof t?.start === 'string') rawTimes.push(t.start)
                }
            }
        }
    }

    // final fallback: extract ISO timestamps from text
    if (rawTimes.length === 0) {
        const txt = JSON.stringify(anyJson)
        const isoMatches = Array.from(txt.matchAll(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g)).map((m) => m[0])
        rawTimes.push(...isoMatches)
    }

    // Normalize each raw time into canonical UTC ISO string (toISOString())
    const normalized: string[] = []
    for (const r of rawTimes) {
        try {
            const d = new Date(r)
            // ensure valid date in future
            if (!isNaN(d.getTime()) && d.getTime() > Date.now()) {
                normalized.push(d.toISOString())
            }
        } catch {
            // ignore bad parse
        }
    }

    // dedupe and sort ascending
    const unique = Array.from(new Set(normalized)).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    return unique
}


export async function POST(req: NextRequest) {
    try {
        const raw = await req.json()

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

        const okCaptcha = await verifyRecaptcha(payload.recaptchaToken)
        if (!okCaptcha) return NextResponse.json({ ok: false, error: 'reCAPTCHA verification failed' }, { status: 400 })

        if (WILLINGNESS_LOW.has(payload.willingnessToInvest)) {
            return NextResponse.json({ ok: false, redirect: 'https://whop.com/alpha-archive/alphaarchivepremium/' }, { status: 500 })
        }

        if (!CALENDLY_EVENT_TYPE_URI) {
            return NextResponse.json({ ok: false, error: 'Missing CALENDLY_EVENT_TYPE_URI server env' }, { status: 500 })
        }

        const availableTimes = await fetchAvailableTimes(CALENDLY_EVENT_TYPE_URI)
        if (!Array.isArray(availableTimes) || availableTimes.length === 0) {
            return NextResponse.json({ ok: false, error: 'No available times returned by Calendly' }, { status: 500 })
        }

        // create short-lived booking token binding these availableTimes
        const bookingToken = createBookingToken(availableTimes)

        // Return available times and the one-time bookingToken
        return NextResponse.json({ ok: true, availableTimes, bookingToken })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Server error'
        console.error('submit route error', err)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}
