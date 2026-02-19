// Cloudflare Pages Function – /api/admin/subscribers
// GET  → list all subscribers
// DELETE → clear all subscribers

import { verifyAdmin } from './_auth.js';

export async function onRequestGet(context) {
    const auth = await verifyAdmin(context.request);
    if (!auth.ok) {
        return Response.json({ error: auth.error }, { status: auth.status });
    }

    const db = context.env.DB;
    if (!db) {
        return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { results } = await db.prepare(
            'SELECT email, timestamp, source FROM subscribers ORDER BY id DESC'
        ).all();
        return Response.json(results || []);
    } catch (error) {
        console.error('list subscribers error:', error);
        return Response.json({ error: 'Failed to load subscribers' }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const auth = await verifyAdmin(context.request);
    if (!auth.ok) {
        return Response.json({ error: auth.error }, { status: auth.status });
    }

    const db = context.env.DB;
    if (!db) {
        return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        await db.prepare('DELETE FROM subscribers').run();
        return Response.json({ success: true });
    } catch (error) {
        console.error('clear subscribers error:', error);
        return Response.json({ error: 'Failed to clear subscribers' }, { status: 500 });
    }
}
