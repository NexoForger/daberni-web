// dataStore.js - GitHub JSON file-based data storage
// Reads and writes form data to JSON files in the repository via the GitHub Contents API.

var DataStore = (function () {
    var CONFIG_KEY = 'daberniGitHubConfig';

    var defaultConfig = {
        owner: 'NexoForger',
        repo: 'daberni-web',
        branch: 'main'
    };

    function getConfig() {
        try {
            var stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            return {
                owner: stored.owner || defaultConfig.owner,
                repo: stored.repo || defaultConfig.repo,
                branch: stored.branch || defaultConfig.branch,
                token: stored.token || ''
            };
        } catch (e) {
            return Object.assign({}, defaultConfig, { token: '' });
        }
    }

    function saveConfig(config) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify({
            owner: config.owner || defaultConfig.owner,
            repo: config.repo || defaultConfig.repo,
            branch: config.branch || defaultConfig.branch,
            token: config.token || ''
        }));
    }

    function isConfigured() {
        var config = getConfig();
        return !!(config.token && config.owner && config.repo);
    }

    function isValidFilename(filename) {
        return /^[a-zA-Z0-9_-]+\.json$/.test(filename);
    }

    // Read data from a JSON file in the repo via the GitHub Contents API
    async function readData(filename) {
        if (!isValidFilename(filename)) {
            throw new Error('Invalid filename');
        }
        var config = getConfig();
        var url = 'https://api.github.com/repos/' + config.owner + '/' + config.repo + '/contents/data/' + filename + '?ref=' + config.branch;
        var headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (config.token) {
            headers['Authorization'] = 'token ' + config.token;
        }

        try {
            var response = await fetch(url, { headers: headers });
            if (!response.ok) {
                console.warn('DataStore: Could not read ' + filename + ' (status ' + response.status + ')');
                return [];
            }
            var fileData = await response.json();
            var decoded = new TextDecoder().decode(Uint8Array.from(atob(fileData.content.replace(/\n/g, '')), function(c) { return c.charCodeAt(0); }));
            return JSON.parse(decoded);
        } catch (e) {
            console.error('DataStore: Error reading ' + filename, e);
            return [];
        }
    }

    // Write data to a JSON file in the repo via the GitHub Contents API
    async function writeData(filename, data) {
        if (!isValidFilename(filename)) {
            throw new Error('Invalid filename');
        }
        var config = getConfig();
        if (!config.token) {
            throw new Error('GitHub token not configured. Please set it in the Admin Panel settings.');
        }

        var path = 'data/' + filename;
        var url = 'https://api.github.com/repos/' + config.owner + '/' + config.repo + '/contents/' + path;
        var headers = {
            'Authorization': 'token ' + config.token,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        };

        // Get current file to obtain its SHA (required for updates)
        var sha = '';
        try {
            var getResponse = await fetch(url + '?ref=' + config.branch, { headers: headers });
            if (getResponse.ok) {
                var fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (e) {
            // File may not exist yet; we will create it
        }

        var jsonString = JSON.stringify(data, null, 2) + '\n';
        var content = btoa(String.fromCharCode.apply(null, new TextEncoder().encode(jsonString)));
        var body = {
            message: 'Update ' + filename + ' via web form',
            content: content,
            branch: config.branch
        };
        if (sha) {
            body.sha = sha;
        }

        var putResponse = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!putResponse.ok) {
            var error = await putResponse.json();
            throw new Error(error.message || 'Failed to save data to repository');
        }

        return true;
    }

    // Convenience methods for subscribers
    async function getSubscribers() {
        return await readData('subscribers.json');
    }

    async function addSubscriber(subscriberData) {
        var subscribers = await readData('subscribers.json');
        var exists = subscribers.some(function (s) { return s.email === subscriberData.email; });
        if (exists) {
            return { success: false, reason: 'duplicate' };
        }
        subscribers.push(subscriberData);
        await writeData('subscribers.json', subscribers);
        return { success: true };
    }

    // Convenience methods for applications
    async function getApplications() {
        return await readData('applications.json');
    }

    async function addApplication(applicationData) {
        var applications = await readData('applications.json');
        applications.push(applicationData);
        await writeData('applications.json', applications);
        return { success: true };
    }

    return {
        getConfig: getConfig,
        saveConfig: saveConfig,
        isConfigured: isConfigured,
        readData: readData,
        writeData: writeData,
        getSubscribers: getSubscribers,
        addSubscriber: addSubscriber,
        getApplications: getApplications,
        addApplication: addApplication
    };
})();
