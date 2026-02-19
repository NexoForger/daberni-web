// Cloudflare Pages Function – POST /api/subscribe
// Accepts { email } and appends the subscriber to data/subscribers.json
// via the GitHub Contents API using a server-side GITHUB_TOKEN.

const OWNER = 'NexoForger';
const REPO  = 'daberni-web';
const BRANCH = 'main';

async function readGitHubJSON(token, filename) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/${filename}?ref=${BRANCH}`;
    const res = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`,
            'User-Agent': 'daberni-web'
        }
    });
    if (!res.ok) {
        if (res.status === 404) return { data: [], sha: null };
        throw new Error(`GitHub read error: ${res.status}`);
    }
    const file = await res.json();
    const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(file.content.replace(/\n/g, '')), c => c.charCodeAt(0))
    );
    return { data: JSON.parse(decoded), sha: file.sha };
}

async function writeGitHubJSON(token, filename, data, sha) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/${filename}`;
    const jsonStr = JSON.stringify(data, null, 2) + '\n';
    const encoded = btoa(String.fromCharCode.apply(null, new TextEncoder().encode(jsonStr)));
    const body = {
        message: `Update ${filename} via web form`,
        content: encoded,
        branch: BRANCH
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'daberni-web'
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `GitHub write error: ${res.status}`);
    }
}

export async function onRequestPost(context) {
    const token = context.env.GITHUB_TOKEN;
    if (!token) {
        return Response.json(
            { error: 'Server is not configured. Please set GITHUB_TOKEN.' },
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
        const { data: subscribers, sha } = await readGitHubJSON(token, 'subscribers.json');

        if (subscribers.some(s => s.email === body.email)) {
            return Response.json({ success: false, reason: 'duplicate' });
        }

        subscribers.push({
            email: body.email,
            timestamp: new Date().toISOString(),
            source: 'website'
        });

        await writeGitHubJSON(token, 'subscribers.json', subscribers, sha);
        return Response.json({ success: true });
    } catch (error) {
        console.error('subscribe error:', error);
        return Response.json(
            { error: 'Failed to save subscription' },
            { status: 500 }
        );
    }
}
