// server/helpers/calendly.ts
const CALENDLY_TOKEN = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN ?? 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzYzMDQ2OTMxLCJqdGkiOiI1MjBiZTZlNi0zMjMyLTRlMTItOTIzOS1hYjZhZGNlNzA3MTUiLCJ1c2VyX3V1aWQiOiI5MzgxMjU2OS1mMjk4LTRjYWMtOTVkOS02NWUwYWQ4MzU2NTMifQ.hKxbdcQ3x2zTMTkXduTSDy7aqke0gAAuZTdhoZlf7Hkw-imIvbGj2kGrEdJEui9ykkhRCSyP8vzUOZTmRoAxZA'
// Option A: you may set an existing scheduling link id here
const CALENDLY_SCHEDULING_LINK_ID = process.env.CALENDLY_SCHEDULING_LINK_ID ?? '2e5780d4-1b27-4a6c-8ad8-3c7ce8174c2b'
// Option B: you may set an event type URI (from your event_types list)
const CALENDLY_EVENT_TYPE_URI = process.env.CALENDLY_EVENT_TYPE_URI ?? 'https://api.calendly.com/event_types/2e5780d4-1b27-4a6c-8ad8-3c7ce8174c2b' // e.g. "https://api.calendly.com/event_types/2e5780d4-..."

async function createSchedulingLinkForEventType(eventTypeUri: string) {
    if (!CALENDLY_TOKEN) throw new Error('Missing Calendly token')
    // POST /scheduling_links with event_type reference — adapt payload if your Calendly API requires different fields
    const url = 'https://api.calendly.com/scheduling_links'
    const body = {
        event_type: eventTypeUri,
        // optional: set owner, start_time, end_time, invitee details, or other scheduling_link settings here
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${CALENDLY_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Failed to create scheduling_link: ${res.status} ${txt}`)
    }
    const json = await res.json()
    // return the scheduling link id (or full resource) — inspect the response shape from your Calendly account
    // e.g. json.resource.id or json.resource.uri or json.resource.booking_url
    return json
}

async function createInviteeOnSchedulingLink(schedulingLinkId: string, payload: {
    name: string; email: string; phone?: string; based?: string; otherBased?: string; occupation?: string;
    monthlyIncome?: string; willingnessToInvest?: string; message?: string;
}) {
    if (!CALENDLY_TOKEN) throw new Error('Missing Calendly token')
    const url = `https://api.calendly.com/scheduling_links/${encodeURIComponent(schedulingLinkId)}/invitees`
    const questions_and_answers = [
        { question: 'Phone Number', answer: payload.phone ?? '' },
        { question: 'Where are you based?', answer: payload.based ?? payload.otherBased ?? '' },
        { question: 'What do you do for a living?', answer: payload.occupation ?? '' },
        { question: "What’s your current monthly income?", answer: payload.monthlyIncome ?? '' },
        { question: 'How much are you willing to invest into yourself to get rich with crypto?', answer: payload.willingnessToInvest ?? '' },
    ]
    const body = {
        name: payload.name,
        email: payload.email,
        questions_and_answers,
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${CALENDLY_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Calendly invitee error ${res.status}: ${txt}`)
    }
    return res.json()
}

export async function upsertInviteeAndCreate(payload: {
    name: string; email: string; phone?: string; based?: string; otherBased?: string; occupation?: string;
    monthlyIncome?: string; willingnessToInvest?: string; message?: string;
}) {
    // 1) choose scheduling link ID
    let schedulingLinkId = CALENDLY_SCHEDULING_LINK_ID || ''

    if (!schedulingLinkId) {
        if (!CALENDLY_EVENT_TYPE_URI) {
            throw new Error('No scheduling link id or event type uri configured (CALENDLY_SCHEDULING_LINK_ID or CALENDLY_EVENT_TYPE_URI)')
        }
        // create scheduling link and extract id
        const schedResp = await createSchedulingLinkForEventType(CALENDLY_EVENT_TYPE_URI)
        // Inspect the response to get the ID — common fields: schedResp.resource?.id or schedResp.resource?.uri
        // Adjust the extraction below depending on the actual Calendly response shape in your account
        schedulingLinkId = schedResp?.resource?.id ?? schedResp?.resource?.uri ?? schedResp?.id ?? ''
        if (!schedulingLinkId) {
            // sometimes the API returns a booking_url and resource.uri — if resource.uri is the URI, you might use the URI instead of id.
            schedulingLinkId = schedResp?.resource?.uri ?? ''
        }
        if (!schedulingLinkId) throw new Error('Could not determine created scheduling link id from Calendly response')
    }

    // 2) create invitee on that scheduling link
    return await createInviteeOnSchedulingLink(schedulingLinkId, payload)
}
