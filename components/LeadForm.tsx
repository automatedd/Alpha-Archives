// components/LeadForm.tsx
'use client'

import React, { useEffect, useState } from 'react'
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

/**
 * Environment variables expected:
 * - NEXT_PUBLIC_RECAPTCHA_SITE_KEY (optional; client only)
 * - /api/csrf endpoint must exist (double-submit CSRF token)
 */

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

// Exact strings from your Calendly event type JSON
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
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(7).max(30).optional(),
    based: z.string().min(1, 'Select where you are based'),
    otherBased: z.string().optional(),
    occupation: z.string().min(1, 'Occupation is required'),
    monthlyIncome: z.enum(MONTHLY_INCOME_OPTIONS),
    willingnessToInvest: z.enum(WILLINGNESS_OPTIONS),
})
type FormValues = z.infer<typeof schema>

// Safe typing for grecaptcha
declare global {
    interface Window {
        grecaptcha?: {
            execute: (siteKey: string, opts?: { action?: string }) => Promise<string> | string
        }
    }
}

export default function LeadForm() {
    const [csrfToken, setCsrfToken] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState<boolean>(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            based: '',
            otherBased: '',
            occupation: '',
            monthlyIncome: '1000$-5000$', // will be validated by zod immediately; update default if needed
            willingnessToInvest: '$1000-$5000 - I am willing to invest a decent bit into actually getting rich with crypto, I have the capital and I am ready to start.',
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
                // ignore
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

    async function onSubmit(values: FormValues) {
        setSubmitting(true)
        try {
            // build based value (use Other: text if applicable)
            const basedValue = values.based === 'Other' && values.otherBased ? `Other: ${values.otherBased}` : values.based

            // reCAPTCHA v3 token (optional)
            let recaptchaToken: string | null = null
            if (RECAPTCHA_SITE_KEY && typeof window !== 'undefined' && window.grecaptcha) {
                const maybe = window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
                recaptchaToken = typeof maybe === 'string' ? maybe : await maybe
            }

            const payload = { ...values, based: basedValue, recaptchaToken }

            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (csrfToken) headers['x-csrf-token'] = csrfToken

            const res = await fetch('/api/submit', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                redirect: 'follow',
            })

            // If server responds with redirect (302 -> google.com), browser will have followed only if res.redirected true.
            if (res.redirected) {
                window.location.href = res.url
                return
            }

            const data = await res.json()
            if (!res.ok) {
                toast.error(data?.error ?? 'Submission failed')
                return
            }

            if (data?.ok && data?.calendly) {
                toast.success('Appointment created — check your email for confirmation from Calendly')
            } else {
                toast('Submitted — thanks!')
            }

            form.reset()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Network error'
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    // helpers
    const { register, control, formState, watch, setValue, getValues } = form
    const basedWatch = watch('based')

    return (
        <div className="max-w-2xl mx-auto">
            <Toaster position="top-right" />
            {RECAPTCHA_SITE_KEY && <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} />}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* name */}
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register('name')} placeholder="Your full name" />
                    {formState.errors.name && <p className="text-sm text-red-600">{formState.errors.name.message}</p>}
                </div>

                {/* email */}
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...register('email')} placeholder="you@example.com" />
                    {formState.errors.email && <p className="text-sm text-red-600">{formState.errors.email.message}</p>}
                </div>

                {/* phone */}
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="+1 555 555 5555"
                        onBlur={() => setValue('phone', formatPhone(getValues('phone')) ?? getValues('phone'))}
                    />
                    {formState.errors.phone && <p className="text-sm text-red-600">{formState.errors.phone.message}</p>}
                </div>

                {/* based (select + other) */}
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

                {/* occupation */}
                <div>
                    <Label htmlFor="occupation">What do you do for a living?</Label>
                    <Input id="occupation" {...register('occupation')} placeholder="e.g. Software Engineer" />
                    {formState.errors.occupation && <p className="text-sm text-red-600">{formState.errors.occupation.message}</p>}
                </div>

                {/* monthly income (radio) */}
                <div>
                    <Label>What&apos;s your current monthly income?</Label>
                    <div className="flex flex-col gap-2 mt-2">
                        <Controller
                            control={control}
                            name="monthlyIncome"
                            render={({ field }) =>
                                <>
                                    {MONTHLY_INCOME_OPTIONS.map((opt) => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="monthlyIncome"
                                                value={opt}
                                                checked={field.value === opt}
                                                onChange={() => setValue('monthlyIncome', opt)}
                                            />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </>
                            }
                        />
                    </div>
                </div>

                {/* willingness to invest (radio) */}
                <div>
                    <Label>How much are you willing to invest into yourself to get rich with crypto?</Label>
                    <div className="flex flex-col gap-2 mt-2">
                        <Controller
                            control={control}
                            name="willingnessToInvest"
                            render={({ field }) =>
                                <>
                                    {
                                        WILLINGNESS_OPTIONS.map((opt) => (
                                            <label key={opt} className="flex items-start gap-2">
                                                <input
                                                    type="radio"
                                                    name="willingnessToInvest"
                                                    value={opt}
                                                    checked={field.value === opt}
                                                    onChange={() => setValue('willingnessToInvest', opt)}
                                                />
                                                <span className="text-sm leading-tight">{opt}</span>
                                            </label>
                                        ))
                                    }
                                </>
                            }
                        />
                    </div>
                    {formState.errors.willingnessToInvest && (
                        <p className="text-sm text-red-600">{formState.errors.willingnessToInvest.message}</p>
                    )}
                </div>

                {/* submit */}
                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
