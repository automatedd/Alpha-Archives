// app/api/csrf/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
    const token = crypto.randomBytes(32).toString('hex')
    const res = NextResponse.json({ csrfToken: token })
    res.cookies.set('csrfToken', token, {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60,
    })
    return res
}
