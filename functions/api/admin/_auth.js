// Shared authentication helper for admin API endpoints.
// Verifies the caller has a valid GitHub token belonging to an authorised user.

const AUTHORIZED_USERS = ['byterwanderer', 'apparentlyvenus'];
const ORG_NAME = 'NexoForger';

export async function verifyAdmin(request) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return { ok: false, status: 401, error: 'Authentication required' };
    }

    const token = auth.slice(7);
    const headers = {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'daberni-web'
    };

    // Identify the GitHub user
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) {
        return { ok: false, status: 401, error: 'Invalid token' };
    }

    const user = await userRes.json();
    const username = (user.login || '').toLowerCase();

    // Check the user is on the authorised list
    if (AUTHORIZED_USERS.indexOf(username) === -1) {
        return { ok: false, status: 403, error: 'Access denied' };
    }

    return { ok: true, username };
}
