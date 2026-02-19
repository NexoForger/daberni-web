# Daberni Form Data Storage

## Overview

The Daberni website stores all form submissions as JSON files in the GitHub repository itself, using the GitHub Contents API. This provides server-side persistence without requiring a traditional backend—data is committed directly to the repository and survives browser cache clears, incognito sessions, and device changes.

## How It Works

1. **JSON data files** (`data/subscribers.json` and `data/applications.json`) live in the repository.
2. **Reading**: Data is fetched via the GitHub Contents API (works for public repos without authentication).
3. **Writing**: New submissions are appended to the JSON files via the GitHub Contents API, which requires a Personal Access Token.
4. **Admin panel**: The admin page (`admin.html`) includes a settings section where the repository owner, name, branch, and token are configured. This configuration is stored in `localStorage` (only the config, not the data).

## What Gets Stored

### 1. Email Subscribers (`data/subscribers.json`)
When users subscribe via the email subscription form, the following data is stored:

- **Email address**: The subscriber's email
- **Timestamp**: When they subscribed (ISO 8601 format)
- **Source**: Always set to "website" for tracking

### 2. Driver Applications (`data/applications.json`)
When drivers submit applications, the following data is stored:

- **Unique ID**: Auto-generated application ID
- **Personal Information**: Name, email, phone, city
- **Vehicle Information**: Type, year, license number
- **Experience**: Years of driving experience
- **Platform Usage**: Other platforms the driver currently uses
- **Availability**: When they can start
- **Additional Information**: Any extra notes from the applicant
- **Submission Timestamp**: When the application was submitted (ISO 8601 format)
- **Status**: Always "pending" initially

## Setup

### 1. Create a GitHub Personal Access Token
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. Generate a new token with the **`repo`** scope (or `public_repo` for public repositories).
3. Copy the token.

### 2. Configure the Admin Panel
1. Navigate to `/admin.html`.
2. In the **GitHub Storage Settings** section, enter:
   - **Repository Owner** (e.g., `NexoForger`)
   - **Repository Name** (e.g., `daberni-web`)
   - **Branch** (e.g., `main`)
   - **Personal Access Token** (the token you created above)
3. Click **Save Settings**.

Once configured, form submissions from the main site will be stored in the repository JSON files, and the admin panel will read data from those files.

## Admin Panel

### Accessing the Admin Panel

Navigate to `/admin.html` to access the admin panel. This page provides:

1. **Statistics Dashboard**: View counts of subscribers and applications
2. **Data Tables**: Browse all stored data in organized tables
3. **Export Functionality**: Download data as CSV files
4. **Data Management**: Clear all data if needed
5. **GitHub Settings**: Configure repository and token

### Features

#### View Data
- See all email subscribers with timestamps
- View all driver applications with complete details
- Real-time statistics

#### Export Data
- **Export Subscribers**: Download all subscriber emails with timestamps as CSV
- **Export Applications**: Download all driver applications with full details as CSV

The exported CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.

#### Clear Data
- Clear all subscribers
- Clear all driver applications
- Confirmation dialogs prevent accidental deletion

## Technical Details

### Data Structure

#### Subscriber Object
```json
{
  "email": "user@example.com",
  "timestamp": "2026-02-19T11:14:52.523Z",
  "source": "website"
}
```

#### Driver Application Object
```json
{
  "id": "app_1708343692523_abc123def",
  "name": "John Doe",
  "phone": "+961 12 345 678",
  "email": "driver@example.com",
  "city": "Beirut",
  "vehicleType": "motorcycle-medium",
  "vehicleYear": "2022",
  "licenseNumber": "LB123456",
  "yearsExperience": "3-5",
  "platforms": ["uber", "careem"],
  "availability": "immediately",
  "additionalInfo": "Additional notes here",
  "submittedAt": "2026-02-19T11:14:52.523Z",
  "status": "pending"
}
```

### Architecture

- **`dataStore.js`**: Shared module that handles all read/write operations via the GitHub Contents API.
- **`data/subscribers.json`**: JSON file storing subscriber data.
- **`data/applications.json`**: JSON file storing driver application data.
- **GitHub Contents API**: Used to read and update the JSON files. Writing requires a Personal Access Token.

### Data Persistence

Data persists in the repository and is available across:
- All browsers and devices
- Page reloads and browser restarts
- Private/incognito browsing sessions

**Data will only be cleared if:**
- Admin manually clears data from the admin panel
- The JSON files are manually edited or deleted from the repository

## Security Considerations

### Current Implementation
- Data is stored in JSON files in the GitHub repository
- A Personal Access Token is required for write operations
- The token is stored in `localStorage` on the admin's browser only
- The token is never committed to source code

### Recommended for Production

For a production environment, consider:

1. **Token Security**: Use a fine-grained token with minimal scope (only `contents: write` on the specific repository).

2. **Authentication**: Protect the admin panel
   - Add login/password protection
   - Use services like Netlify Identity or Auth0

3. **Privacy Compliance**: Ensure GDPR/privacy law compliance
   - Add privacy policy
   - Implement data retention policies
   - Allow users to request data deletion

## Troubleshooting

### Data Not Saving
1. Ensure the GitHub token is configured in the admin panel settings
2. Verify the token has the correct permissions (`repo` or `public_repo` scope)
3. Check the browser console for API error messages
4. Ensure the repository owner, name, and branch are correct

### Can't See Data in Admin Panel
1. Ensure you're navigating to `/admin.html`
2. Check that the GitHub settings are configured
3. Verify the JSON data files exist in the repository (`data/subscribers.json`, `data/applications.json`)

### Export Not Working
1. Check browser's download settings
2. Ensure pop-ups are not blocked
3. Try a different browser

## Support

For issues or questions about the data storage system:
1. Check browser console for error messages
2. Verify GitHub token permissions and configuration
3. Ensure the data JSON files exist in the `data/` directory

---

**Note**: This storage solution uses the GitHub repository as a lightweight database. For high-traffic production use, consider migrating to a dedicated backend and database.
