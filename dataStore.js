// dataStore.js - Cloudflare D1 data storage via API endpoints
// Reads and writes form data through server-side Cloudflare Pages Functions
// backed by a D1 (SQLite) database.

var DataStore = (function () {
    // Convenience methods for subscribers
    async function getSubscribers() {
        try {
            var response = await fetch('/api/admin/subscribers');
            if (!response.ok) {
                console.warn('DataStore: Could not read subscribers (status ' + response.status + ')');
                return [];
            }
            return await response.json();
        } catch (e) {
            console.error('DataStore: Error reading subscribers', e);
            return [];
        }
    }

    async function addSubscriber(subscriberData) {
        var response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriberData)
        });
        if (!response.ok) {
            var err = await response.json().catch(function () { return {}; });
            throw new Error(err.error || 'Failed to submit subscription');
        }
        return await response.json();
    }

    async function clearSubscribers() {
        var response = await fetch('/api/admin/subscribers', { method: 'DELETE' });
        if (!response.ok) {
            var err = await response.json().catch(function () { return {}; });
            throw new Error(err.error || 'Failed to clear subscribers');
        }
        return await response.json();
    }

    // Convenience methods for applications
    async function getApplications() {
        try {
            var response = await fetch('/api/admin/applications');
            if (!response.ok) {
                console.warn('DataStore: Could not read applications (status ' + response.status + ')');
                return [];
            }
            return await response.json();
        } catch (e) {
            console.error('DataStore: Error reading applications', e);
            return [];
        }
    }

    async function addApplication(applicationData) {
        var response = await fetch('/api/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        if (!response.ok) {
            var err = await response.json().catch(function () { return {}; });
            throw new Error(err.error || 'Failed to submit application');
        }
        return await response.json();
    }

    async function clearApplications() {
        var response = await fetch('/api/admin/applications', { method: 'DELETE' });
        if (!response.ok) {
            var err = await response.json().catch(function () { return {}; });
            throw new Error(err.error || 'Failed to clear applications');
        }
        return await response.json();
    }

    return {
        getSubscribers: getSubscribers,
        addSubscriber: addSubscriber,
        clearSubscribers: clearSubscribers,
        getApplications: getApplications,
        addApplication: addApplication,
        clearApplications: clearApplications
    };
})();
