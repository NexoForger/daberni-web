// Cloudflare Pages Function – POST /api/apply
// Accepts driver application data and stores it in the D1 database.

const REQUIRED_FIELDS = [
    'name', 'phone', 'email', 'city',
    'vehicleType', 'vehicleYear', 'licenseNumber',
    'yearsExperience', 'availability'
];

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

    // Validate required fields
    for (const field of REQUIRED_FIELDS) {
        if (!body[field]) {
            return Response.json(
                { error: `Missing required field: ${field}` },
                { status: 400 }
            );
        }
    }

    // Validate email
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRe.test(body.email)) {
        return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Validate phone (basic Lebanese number)
    const cleanPhone = String(body.phone).replace(/[\s-]/g, '');
    if (!/^(\+961|00961|961)?[0-9]{7,8}$/.test(cleanPhone)) {
        return Response.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    try {
        const platforms = Array.isArray(body.platforms) ? body.platforms.map(String) : [];

        await db.prepare(
            `INSERT INTO applications
             (id, name, phone, email, city, vehicle_type, vehicle_year,
              license_number, years_experience, platforms, availability,
              additional_info, submitted_at, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            crypto.randomUUID(),
            String(body.name),
            String(body.phone),
            String(body.email),
            String(body.city),
            String(body.vehicleType),
            String(body.vehicleYear),
            String(body.licenseNumber),
            String(body.yearsExperience),
            JSON.stringify(platforms),
            String(body.availability),
            body.additionalInfo ? String(body.additionalInfo) : '',
            new Date().toISOString(),
            'pending'
        ).run();

        return Response.json({ success: true });
    } catch (error) {
        console.error('apply error:', error);
        return Response.json(
            { error: 'Failed to save application' },
            { status: 500 }
        );
    }
}
