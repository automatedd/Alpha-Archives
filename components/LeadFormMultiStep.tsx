// components/LeadMultiStepForm.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Script from 'next/script'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Toaster, toast } from 'sonner'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

/* --- constants & zod schema (same as before) --- */
const BASED_OPTIONS = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'Australia',
    'France',
    'Other',
] as const

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
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Must be a valid email'),
    phone: z.string().optional(),
    based: z.string().min(1, 'Where are you based?'),
    otherBased: z.string().optional(),
    occupation: z.string().min(1, 'Occupation required'),
    monthlyIncome: z.enum(MONTHLY_INCOME_OPTIONS),
    willingnessToInvest: z.enum(WILLINGNESS_OPTIONS),
    message: z.string().optional(),
    consent: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

declare global {
    interface Window {
        grecaptcha?: {
            execute: (siteKey: string, opts?: { action?: string }) => Promise<string> | string
        }
    }
}

/* ---------------------- Helper utilities ---------------------- */

/**
 * Recursively search object for the first occurrence of any of the provided keys
 * and return its value. Works with nested arrays/objects.
 */
function findFirstKey(obj: unknown, keys: string[]): unknown | undefined {
    if (obj == null) return undefined
    if (typeof obj !== 'object') return undefined
    const visited = new Set<any>()
    const stack: unknown[] = [obj]

    while (stack.length) {
        const cur = stack.pop()
        if (!cur || typeof cur !== 'object') continue
        if (visited.has(cur)) continue
        visited.add(cur)

        for (const k of Object.keys(cur as object)) {
            try {
                if (keys.includes(k)) {
                    return (cur as any)[k]
                }
            } catch { }
        }

        for (const v of Object.values(cur as any)) {
            if (v && typeof v === 'object') stack.push(v)
        }
    }

    return undefined
}

/** Try common places for a join_url (zoom or conference join link) */
function extractJoinUrl(calendlyResp: unknown): string | null {
    const maybe = findFirstKey(calendlyResp, ['join_url', 'location', 'joinUrl', 'uri', 'url'])
    if (!maybe) return null
    if (typeof maybe === 'string') {
        // if it's a URI that isn't a join link we still attempt to find a better one inside
        if (maybe.startsWith('http')) return maybe
    }
    // sometimes location is an object containing join_url
    if (typeof maybe === 'object') {
        const join = findFirstKey(maybe, ['join_url', 'joinUrl', 'url'])
        if (typeof join === 'string' && join.startsWith('http')) return join
    }

    // fallback: search for any http(s) string in JSON
    try {
        const text = JSON.stringify(calendlyResp)
        const m = text.match(/https?:\/\/[^\s"']+/)
        return m ? m[0] : null
    } catch {
        return null
    }
}

/** Try common places for event start time (ISO) */
function extractStartTimeIso(calendlyResp: unknown): string | null {
    // try keys commonly used: start_time, start_time_utc, start, event.start_time, etc.
    const candidates = ['start_time', 'start_time_utc', 'start', 'event_start_time', 'scheduled_start_time']
    const found = findFirstKey(calendlyResp, candidates)
    if (typeof found === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(found)) return found
    // sometimes it's nested under 'resource' or 'event' -> look deeper
    try {
        const text = JSON.stringify(calendlyResp)
        const m = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/)
        return m ? m[0] : null
    } catch {
        return null
    }
}

/** Try to find human-friendly event name */
function extractEventName(calendlyResp: unknown): string | null {
    const v = findFirstKey(calendlyResp, ['name', 'event_name', 'event', 'resource', 'event_type'])
    if (!v) return null
    if (typeof v === 'string') return v
    if (typeof v === 'object') {
        // check common subkeys
        const title = findFirstKey(v, ['name', 'title', 'summary'])
        if (typeof title === 'string') return title
    }
    return null
}

/** find invitee info (name/email) */
function extractInviteeInfo(calendlyResp: unknown): { name?: string; email?: string } {
    const name = findFirstKey(calendlyResp, ['invitee', 'invitee_name', 'person', 'invitee_uri', 'resource'])
    let n: string | undefined
    if (typeof name === 'string') n = name
    else if (typeof name === 'object') {
        const possible = findFirstKey(name, ['name', 'full_name', 'first_name'])
        if (typeof possible === 'string') n = possible
    }
    const email = findFirstKey(calendlyResp, ['email', 'invitee_email', 'contact_email'])
    return { name: n as string | undefined, email: typeof email === 'string' ? email : undefined }
}

/** Format an ISO string into a friendly local date/time using tz or fallback */
function formatIsoToLocal(iso: string, tz: string | undefined) {
    try {
        const d = new Date(iso)
        if (isNaN(d.getTime())) return iso
        return new Intl.DateTimeFormat(undefined, {
            timeZone: tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(d)
    } catch {
        return iso
    }
}

/* ---------------------- Component ---------------------- */

export default function LeadMultiStepForm() {
    const [csrfToken, setCsrfToken] = useState<string | null>(null)
    const [availableTimes, setAvailableTimes] = useState<string[] | null>(null) // ISO strings
    const [bookingToken, setBookingToken] = useState<string | null>(null)
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [formPayloadCache, setFormPayloadCache] = useState<FormValues | null>(null)
    const [loadingTimes, setLoadingTimes] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [tz, setTz] = useState<string>(() => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC')
    const [calendlyResult, setCalendlyResult] = useState<unknown | null>(null)

    const MAX_RETRY_ATTEMPTS = 3
    const INITIAL_BACKOFF_MS = 500

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            based: '',
            otherBased: '',
            occupation: '',
            monthlyIncome: '1000$-5000$' as any,
            willingnessToInvest:
                '$1000-$5000 - I am willing to invest a decent bit into actually getting rich with crypto, I have the capital and I am ready to start.' as any,
            message: '',
            consent: false,
        },
        mode: 'onTouched',
    })

    useEffect(() => {
        let mounted = true
        void (async () => {
            try {
                const res = await fetch('/api/csrf')
                if (!res.ok) return
                const json = (await res.json()) as { csrfToken?: string }
                if (mounted) setCsrfToken(json?.csrfToken ?? null)
            } catch {
                /* ignore */
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    function formatPhone(value?: string): string | undefined {
        if (!value) return undefined
        const phone = parsePhoneNumberFromString(value)
        return phone?.formatInternational()
    }

    function toLocalDateKey(iso: string, timezone: string) {
        const d = new Date(iso)
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).formatToParts(d)
        const year = parts.find((p) => p.type === 'year')?.value ?? ''
        const month = parts.find((p) => p.type === 'month')?.value ?? ''
        const day = parts.find((p) => p.type === 'day')?.value ?? ''
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    function humanizeTime(iso: string, timezone: string) {
        const dt = new Date(iso)
        const f = new Intl.DateTimeFormat(undefined, { timeZone: timezone, hour: 'numeric', minute: 'numeric', hour12: true })
        return f.format(dt)
    }

    const timesByDate = useMemo(() => {
        if (!availableTimes) return {} as Record<string, string[]>
        const map: Record<string, string[]> = {}
        for (const iso of availableTimes) {
            const key = toLocalDateKey(iso, tz)
                ; (map[key] ??= []).push(iso)
        }
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        }
        return map
    }, [availableTimes, tz])

    const next7Days = useMemo(() => {
        const arr: { key: string; date: Date }[] = []
        const now = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
            const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).formatToParts(d)
            const year = parts.find((p) => p.type === 'year')?.value ?? ''
            const month = parts.find((p) => p.type === 'month')?.value ?? ''
            const day = parts.find((p) => p.type === 'day')?.value ?? ''
            const key = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            arr.push({ key, date: d })
        }
        return arr
    }, [tz])

    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
    const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)

    useEffect(() => {
        if (!availableTimes) {
            setSelectedDateKey(null)
            setSelectedSlotIso(null)
            return
        }
        const firstKey = next7Days.find((d) => (timesByDate[d.key] ?? []).length > 0)?.key ?? null
        setSelectedDateKey(firstKey)
        if (firstKey) {
            const slots = timesByDate[firstKey] ?? []
            setSelectedSlotIso(slots.length > 0 ? slots[0] : null)
        } else {
            setSelectedSlotIso(null)
        }
    }, [availableTimes, next7Days, timesByDate])

    /* ----------------------------
       Networking helpers (same as previous implementation)
    ---------------------------- */

    async function runStep1(values: FormValues): Promise<{ availableTimes: string[]; bookingToken: string } | null> {
        setLoadingTimes(true)
        try {
            const basedValue = values.based === 'Other' && values.otherBased ? `Other: ${values.otherBased}` : values.based

            let recaptchaToken: string | null = null
            if (RECAPTCHA_SITE_KEY && typeof window !== 'undefined' && window.grecaptcha) {
                const maybe = window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
                recaptchaToken = typeof maybe === 'string' ? maybe : await maybe
            }

            const payload = { ...values, based: basedValue, recaptchaToken, tz }
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (csrfToken) headers['x-csrf-token'] = csrfToken

            const res = await fetch('/api/submit', { method: 'POST', headers, body: JSON.stringify(payload) })
            if (res.redirected) {
                window.location.href = res.url
                return null
            }
            const json = await res.json()
            if (!res.ok) {
                toast.error(json?.error ?? 'Failed to submit')
                return null
            }
            if (!Array.isArray(json.availableTimes) || !json.bookingToken) {
                toast.error('No times returned')
                return null
            }
            return { availableTimes: json.availableTimes, bookingToken: json.bookingToken }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Network error'
            toast.error(msg)
            return null
        } finally {
            setLoadingTimes(false)
        }
    }

    async function handleStep1(values: FormValues) {
        const result = await runStep1(values)
        if (result) {
            setAvailableTimes(result.availableTimes)
            setBookingToken(result.bookingToken)
            setFormPayloadCache(values)
            setStep(2)
        }
    }

    async function retryFetchTimesWithBackoff(values: FormValues, attempts = MAX_RETRY_ATTEMPTS) {
        for (let i = 0; i < attempts; i++) {
            const backoff = INITIAL_BACKOFF_MS * Math.pow(2, i)
            if (i > 0) await new Promise((r) => setTimeout(r, backoff))
            toast(`Refreshing available times (attempt ${i + 1}/${attempts})`)
            const result = await runStep1(values)
            if (result) {
                setAvailableTimes(result.availableTimes)
                setBookingToken(result.bookingToken)
                setStep(2)
                toast.success('Slots refreshed — please pick a new time')
                return true
            }
        }
        toast.error('Unable to refresh slots. Please try again later.')
        return false
    }

    async function handleBookSubmit() {
        if (!formPayloadCache || !bookingToken) {
            toast.error('Form state lost — please fill the form again.')
            setStep(1)
            return
        }
        if (!selectedSlotIso) {
            toast.error('Pick a slot first')
            return
        }

        // quick client-side availability check against server-provided availableTimes
        if (!Array.isArray(availableTimes) || !availableTimes.includes(selectedSlotIso)) {
            toast.error('Slot already filled — select a different slot.')
            await retryFetchTimesWithBackoff(formPayloadCache, MAX_RETRY_ATTEMPTS)
            return
        }

        setSubmitting(true)
        try {
            const payload: Record<string, unknown> = {
                ...formPayloadCache,
                start_time: selectedSlotIso,
                tz,
                bookingToken,
            }

            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (csrfToken) headers['x-csrf-token'] = csrfToken

            const res = await fetch('/api/book', { method: 'POST', headers, body: JSON.stringify(payload) })
            const json = await res.json()

            if (res.ok && json?.ok) {
                // Success: show thank you step (do NOT reset the form)
                setCalendlyResult(json.calendly ?? null)
                setStep(3)
                toast.success('Appointment booked — thank you!')
                return
            }

            if (json?.code === 'INVALID_TOKEN') {
                toast.error('Booking token expired — please restart the flow.')
                setStep(1)
                return
            }
            if (json?.code === 'INVALID_TIME') {
                toast.error('Selected time was invalid. Refreshing slots.')
                await retryFetchTimesWithBackoff(formPayloadCache, MAX_RETRY_ATTEMPTS)
                return
            }
            if (json?.code === 'SLOT_TAKEN' || res.status === 409) {
                toast.error('Slot already filled — select a different slot.')
                await retryFetchTimesWithBackoff(formPayloadCache, MAX_RETRY_ATTEMPTS)
                return
            }

            toast.error(json?.error ?? 'Failed to book appointment')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Network error'
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    function resetAll() {
        form.reset()
        setAvailableTimes(null)
        setBookingToken(null)
        setFormPayloadCache(null)
        setSelectedDateKey(null)
        setSelectedSlotIso(null)
        setCalendlyResult(null)
        setStep(1)
    }

    const { register, control, formState, watch, setValue, getValues, handleSubmit } = form
    const basedWatch = watch('based')

    /* ----------------------------
       Render
    ---------------------------- */

    // parse useful info from calendlyResult for Step 3
    const parsedAppointment = useMemo(() => {
        if (!calendlyResult) return null
        const joinUrl = extractJoinUrl(calendlyResult)
        const startIso = extractStartTimeIso(calendlyResult)
        const eventName = extractEventName(calendlyResult)
        const invitee = extractInviteeInfo(calendlyResult)
        // Also try extracting an event or invitee URI (might be under resource.uri or event.uri)
        const eventUri = findFirstKey(calendlyResult, ['event', 'event_uri', 'event_uri', 'event_url', 'uri']) as string | undefined
        const inviteeUri = findFirstKey(calendlyResult, ['invitee', 'invitee_uri', 'invitee_url', 'resource']) as string | undefined
        return { joinUrl, startIso, eventName, invitee, eventUri, inviteeUri }
    }, [calendlyResult])

    return (
        <div className="max-w-2xl mx-auto">
            <Toaster position="top-right" />
            {RECAPTCHA_SITE_KEY && <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} />}

            {/* Step 1 (form) */}
            {step === 1 && (
                <form onSubmit={handleSubmit(handleStep1)} className="space-y-6">
                    {/* ... same fields as previous versions ... */}
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register('name')} placeholder="Your full name" />
                        {formState.errors.name && <p className="text-sm text-red-600">{formState.errors.name.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" {...register('email')} placeholder="you@example.com" />
                        {formState.errors.email && <p className="text-sm text-red-600">{formState.errors.email.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="+1 555 555 5555"
                            onBlur={() => setValue('phone', formatPhone(getValues('phone')) ?? getValues('phone'))}
                        />
                        {formState.errors.phone && <p className="text-sm text-red-600">{formState.errors.phone.message}</p>}
                    </div>

                    <div>
                        <Label>Where are you based?</Label>
                        <Controller
                            control={control}
                            name="based"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country or Other" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BASED_OPTIONS.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {formState.errors.based && <p className="text-sm text-red-600">{formState.errors.based.message}</p>}
                        {basedWatch === 'Other' && (
                            <div className="mt-2">
                                <Label htmlFor="otherBased">Other (specify)</Label>
                                <Input id="otherBased" {...register('otherBased')} placeholder="City / Country" />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="occupation">What do you do for a living?</Label>
                        <Input id="occupation" {...register('occupation')} placeholder="e.g. Software Engineer" />
                        {formState.errors.occupation && <p className="text-sm text-red-600">{formState.errors.occupation.message}</p>}
                    </div>

                    <div>
                        <Label>What&apos;s your current monthly income?</Label>
                        <Controller
                            control={control}
                            name="monthlyIncome"
                            render={({ field }) => (
                                <div className="flex flex-col gap-2 mt-2">
                                    {MONTHLY_INCOME_OPTIONS.map((opt) => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" name="monthlyIncome" value={opt} checked={field.value === opt} onChange={() => setValue('monthlyIncome', opt)} />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    <div>
                        <Label>How much are you willing to invest into yourself to get rich with crypto?</Label>
                        <Controller
                            control={control}
                            name="willingnessToInvest"
                            render={({ field }) => (
                                <div className="flex flex-col gap-2 mt-2">
                                    {WILLINGNESS_OPTIONS.map((opt) => (
                                        <label key={opt} className="flex items-start gap-2">
                                            <input type="radio" name="willingnessToInvest" value={opt} checked={field.value === opt} onChange={() => setValue('willingnessToInvest', opt)} />
                                            <span className="text-sm leading-tight">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        />
                        {formState.errors.willingnessToInvest && <p className="text-sm text-red-600">{formState.errors.willingnessToInvest.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea id="message" {...register('message')} placeholder="Anything else" />
                    </div>

                    <div className="flex items-center gap-3">
                        <input id="consent" type="checkbox" {...register('consent')} />
                        <Label htmlFor="consent">I agree to be contacted about this offer.</Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={loadingTimes}>{loadingTimes ? 'Checking...' : 'Continue'}</Button>
                    </div>
                </form>
            )}

            {/* Step 2 (calendar & time selection) */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Pick a date & time</h2>
                        <div className="text-sm text-muted-foreground">Timezone: <strong>{tz}</strong></div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {next7Days.map((d) => {
                            const hasSlots = (timesByDate[d.key] ?? []).length > 0
                            const isSelected = selectedDateKey === d.key
                            return (
                                <button
                                    key={d.key}
                                    onClick={() => hasSlots && setSelectedDateKey(d.key)}
                                    disabled={!hasSlots}
                                    className={[
                                        'p-2 rounded border text-center',
                                        hasSlots ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed',
                                        isSelected ? 'ring-2 ring-offset-1' : '',
                                    ].join(' ')}
                                >
                                    <div className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { timeZone: tz, weekday: 'short' }).format(d.date)}</div>
                                    <div className="font-medium">{new Intl.DateTimeFormat(undefined, { timeZone: tz, month: 'short', day: 'numeric' }).format(d.date)}</div>
                                    {!hasSlots && <div className="text-xs mt-1 text-red-600">No slots</div>}
                                </button>
                            )
                        })}
                    </div>

                    <div>
                        <h3 className="font-medium">Times</h3>
                        {selectedDateKey === null && <p className="text-sm text-muted-foreground">No available dates — try again later.</p>}

                        {selectedDateKey !== null && (
                            <div className="mt-3">
                                {(timesByDate[selectedDateKey] ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No times for this date — pick another date.</p>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            void handleBookSubmit()
                                        }}
                                        className="grid gap-2"
                                    >
                                        <fieldset className="grid gap-2">
                                            {(timesByDate[selectedDateKey] ?? []).map((iso) => (
                                                <label key={iso} className="flex items-center gap-3 p-3 border rounded">
                                                    <input
                                                        type="radio"
                                                        name="slot"
                                                        value={iso}
                                                        checked={selectedSlotIso === iso}
                                                        onChange={() => setSelectedSlotIso(iso)}
                                                        disabled={submitting}
                                                    />
                                                    <div className="text-left">
                                                        <div className="font-medium">{humanizeTime(iso, tz)}</div>
                                                        <div className="text-xs text-muted-foreground">{iso}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </fieldset>

                                        <div className="flex gap-2 mt-4">
                                            <Button type="submit" disabled={submitting}>{submitting ? 'Booking...' : 'Book appointment'}</Button>
                                            <Button variant="ghost" onClick={() => { setStep(1); setAvailableTimes(null); setBookingToken(null); }}>Back</Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3 (thank you with parsed details) */}
            {step === 3 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Thank you — your appointment is booked</h2>
                    <p className="text-sm text-muted-foreground">We&apos;ve scheduled your appointment. Check your inbox for confirmation — and if available, join links or calendar invites will be sent by Calendly.</p>
                    <p className="text-sm text-muted-foreground mt-5">
                        ⚠️ <b>Warning:</b> <i>Failure to attend the meeting may result in blacklisting.</i>
                    </p>

                    {parsedAppointment ? (
                        <div className="p-4 border rounded bg-muted/50 space-y-3">
                            {parsedAppointment.invitee?.email && <div><strong>Email:</strong> {parsedAppointment.invitee.email}</div>}

                            {parsedAppointment.startIso ? (
                                <div>
                                    <strong>When:</strong>{' '}
                                    {formatIsoToLocal(parsedAppointment.startIso, tz)}
                                    <div className="text-xs text-muted-foreground">{parsedAppointment.startIso}</div>
                                </div>
                            ) : null}

                        </div>
                    ) : (
                        <div className="p-4 border rounded bg-muted/50">
                            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(calendlyResult ?? {}, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
