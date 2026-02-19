// Cloudflare Pages Function – /api/admin/applications
// GET  → list all applications
// DELETE → clear all applications

export async function onRequestGet(context) {
    const db = context.env.DB;
    if (!db) {
        return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { results } = await db.prepare(
            `SELECT id, name, phone, email, city, vehicle_type, vehicle_year,
                    license_number, years_experience, platforms, availability,
                    additional_info, submitted_at, status
             FROM applications ORDER BY submitted_at DESC`
        ).all();

        // Map DB column names back to the camelCase keys the admin UI expects
        const mapped = (results || []).map(row => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            email: row.email,
            city: row.city,
            vehicleType: row.vehicle_type,
            vehicleYear: row.vehicle_year,
            licenseNumber: row.license_number,
            yearsExperience: row.years_experience,
            platforms: JSON.parse(row.platforms || '[]'),
            availability: row.availability,
            additionalInfo: row.additional_info,
            submittedAt: row.submitted_at,
            status: row.status
        }));

        return Response.json(mapped);
    } catch (error) {
        console.error('list applications error:', error);
        return Response.json({ error: 'Failed to load applications' }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.DB;
    if (!db) {
        return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        await db.prepare('DELETE FROM applications').run();
        return Response.json({ success: true });
    } catch (error) {
        console.error('clear applications error:', error);
        return Response.json({ error: 'Failed to clear applications' }, { status: 500 });
    }
}
