// auth.js - GitHub OAuth authentication & authorization for the admin panel
// Ensures only authenticated GitHub users who are members of the configured
// organisation AND are on the authorised employees list may access the dashboard.

var AdminAuth = (function () {
    // ── Configuration ─────────────────────────────────────────────
    // 1. Create a GitHub OAuth App: https://github.com/settings/applications/new
    //    - Set the "Authorization callback URL" to your admin page URL
    //      (e.g. https://daberni.com/admin.html)
    // 2. Deploy a lightweight token-exchange proxy so the OAuth client_secret
    //    is never exposed in client-side code.  The proxy should accept
    //    POST { code } and return { access_token }.
    // 3. Fill in the values below.

    var CONFIG = {
        // GitHub OAuth App client ID (public – safe for client-side code)
        clientId: 'Ov23liSY4gnK5jHIw7Mz',

        // URL of a small proxy that exchanges an OAuth code for a token.
        // The proxy receives POST { code } and returns { access_token }.
        tokenProxyUrl: 'https://daberni-web.izuaby.workers.dev/',

        // GitHub organisation the user must belong to
        orgName: 'NexoForger',

        // Authorised employee GitHub usernames (lowercase).
        // Only users in this list AND in the org above will be granted access.
        authorizedUsers: [
            // Add GitHub usernames here, e.g.:
            // 'octocat',
            // 'mona'
            'byterwanderer',
            'ApparentlyVenus'
        ],

        // OAuth scope – read:org is needed to verify organisation membership
        scope: 'read:org',

        // GitHub API base URL
        apiBase: 'https://api.github.com'
    };

    var SESSION_KEY = 'daberniAdminAuth';

    // ── Session helpers ───────────────────────────────────────────

    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch (e) {
            return null;
        }
    }

    function setSession(data) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function isAuthenticated() {
        var session = getSession();
        if (!(session && session.token && session.username && session.authorized)) {
            return false;
        }
        // Sessions expire after 1 hour to force re-verification
        var maxAge = 60 * 60 * 1000; // 1 hour in ms
        if (session.createdAt && (Date.now() - session.createdAt > maxAge)) {
            clearSession();
            return false;
        }
        return true;
    }

    // ── OAuth flow ────────────────────────────────────────────────

    function login() {
        if (!CONFIG.clientId) {
            alert('GitHub OAuth is not configured. Please set the clientId in auth.js.');
            return;
        }

        var redirectUri = window.location.origin + window.location.pathname;
        var state = Math.random().toString(36).substring(2);
        sessionStorage.setItem('oauth_state', state);

        var url = 'https://github.com/login/oauth/authorize'
            + '?client_id=' + encodeURIComponent(CONFIG.clientId)
            + '&redirect_uri=' + encodeURIComponent(redirectUri)
            + '&scope=' + encodeURIComponent(CONFIG.scope)
            + '&state=' + encodeURIComponent(state);

        window.location.href = url;
    }

    /**
     * Process the OAuth callback (?code=...&state=...) if present in the URL.
     * Returns true if a callback was handled, false otherwise.
     */
    async function handleCallback() {
        var params = new URLSearchParams(window.location.search);
        var code = params.get('code');
        var state = params.get('state');

        if (!code) return false;

        // Verify state parameter to prevent CSRF
        var savedState = sessionStorage.getItem('oauth_state');
        if (!state || state !== savedState) {
            throw new Error('Invalid OAuth state. Please try logging in again.');
        }
        sessionStorage.removeItem('oauth_state');

        // Remove code & state from the URL so a page refresh doesn't re-trigger
        window.history.replaceState({}, document.title, window.location.pathname);

        // Exchange the code for an access token via the proxy
        var token = await exchangeCodeForToken(code);

        // Verify the user is allowed access
        var userInfo = await verifyAccess(token);

        // Persist the session for this browser tab
        setSession({
            token: token,
            username: userInfo.username,
            displayName: userInfo.displayName,
            avatarUrl: userInfo.avatarUrl,
            authorized: true,
            createdAt: Date.now()
        });

        return true;
    }

    async function exchangeCodeForToken(code) {
        if (!CONFIG.tokenProxyUrl) {
            throw new Error('Token proxy URL is not configured. Please set tokenProxyUrl in auth.js.');
        }

        var response = await fetch(CONFIG.tokenProxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ code: code })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange OAuth code for token.');
        }

        var data = await response.json();
        if (!data.access_token) {
            throw new Error(data.error_description || 'Failed to obtain access token.');
        }

        return data.access_token;
    }

    // ── Access verification ───────────────────────────────────────

    async function verifyAccess(token) {
        var headers = {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/vnd.github.v3+json'
        };

        // 1. Identify the authenticated user
        var userResponse = await fetch(CONFIG.apiBase + '/user', { headers: headers });
        if (!userResponse.ok) {
            throw new Error('Failed to verify GitHub identity. Please check your token.');
        }

        var user = await userResponse.json();
        var username = (user.login || '').toLowerCase();

        // 2. Verify organisation membership
        var orgUrl = CONFIG.apiBase + '/user/memberships/orgs/' + encodeURIComponent(CONFIG.orgName);
        var orgResponse = await fetch(orgUrl, { headers: headers });

        if (!orgResponse.ok) {
            throw new Error(
                'You are not a member of the ' + CONFIG.orgName + ' organisation.'
            );
        }

        // 3. Verify the user is on the authorised employees list
        if (CONFIG.authorizedUsers.length === 0) {
            throw new Error(
                'No authorised employees have been configured. Please add usernames to the authorizedUsers list in auth.js.'
            );
        }

        if (CONFIG.authorizedUsers.indexOf(username) === -1) {
            throw new Error(
                'Your GitHub account (' + user.login + ') is not on the authorised employees list.'
            );
        }

        return {
            username: user.login,
            displayName: user.name || user.login,
            avatarUrl: user.avatar_url
        };
    }

    // ── Logout ────────────────────────────────────────────────────

    function logout() {
        clearSession();
        window.location.reload();
    }

    // ── Public API ────────────────────────────────────────────────

    return {
        CONFIG: CONFIG,
        login: login,
        handleCallback: handleCallback,
        verifyAccess: verifyAccess,
        isAuthenticated: isAuthenticated,
        getSession: getSession,
        logout: logout,
        clearSession: clearSession
    };
})();
