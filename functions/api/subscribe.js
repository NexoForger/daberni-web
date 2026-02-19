// Cloudflare Pages Function – POST /api/subscribe
// Accepts { email } and stores the subscriber in the D1 database.

export async function onRequestPost(context) {
    const db = context.env.DB;
    if (!db) {
        return Response.json(
            { error: 'Server is not configured. Please bind a D1 database.' },
            { status: 500 }
        );
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!body.email || !emailRe.test(body.email)) {
        return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    try {
        const existing = await db.prepare(
            'SELECT id FROM subscribers WHERE email = ?'
        ).bind(body.email).first();

        if (existing) {
            return Response.json({ success: false, reason: 'duplicate' });
        }

        await db.prepare(
            'INSERT INTO subscribers (email, timestamp, source) VALUES (?, ?, ?)'
        ).bind(body.email, new Date().toISOString(), 'website').run();

        return Response.json({ success: true });
    } catch (error) {
        console.error('subscribe error:', error);
        return Response.json(
            { error: 'Failed to save subscription' },
            { status: 500 }
        );
    }
}
