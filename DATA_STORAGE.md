# Daberni Form Data Storage

## Overview

The Daberni website stores all form submissions in a **Cloudflare D1** database (SQLite at the edge). Server-side Cloudflare Pages Functions handle all reads and writes, so no tokens or credentials are ever exposed to the browser.

## How It Works

1. **D1 database** (`daberni-db`) stores subscribers and applications in SQL tables.
2. **Writing (public visitors)**: Form submissions are sent to Cloudflare Pages Functions (`/api/subscribe` and `/api/apply`) that insert rows into the D1 database.
3. **Reading (admin)**: The admin panel fetches data through API endpoints (`/api/admin/subscribers` and `/api/admin/applications`).
4. **Admin panel**: The admin page (`admin.html`) displays data from the API and supports export (CSV) and bulk delete.

## What Gets Stored

### 1. Email Subscribers (`subscribers` table)
When users subscribe via the email subscription form, the following data is stored:

- **Email address**: The subscriber's email (unique)
- **Timestamp**: When they subscribed (ISO 8601 format)
- **Source**: Always set to "website" for tracking

### 2. Driver Applications (`applications` table)
When drivers submit applications, the following data is stored:

- **Unique ID**: Auto-generated UUID
- **Personal Information**: Name, email, phone, city
- **Vehicle Information**: Type, year, license number
- **Experience**: Years of driving experience
- **Platform Usage**: Other platforms the driver currently uses (stored as JSON)
- **Availability**: When they can start
- **Additional Information**: Any extra notes from the applicant
- **Submission Timestamp**: When the application was submitted (ISO 8601 format)
- **Status**: Always "pending" initially

## Setup

### 1. Create the D1 Database
```bash
npx wrangler d1 create daberni-db
```
Copy the returned `database_id` into `wrangler.toml`.

### 2. Apply the Schema
```bash
npx wrangler d1 execute daberni-db --file=./schema.sql
```

### 3. Deploy
```bash
npx wrangler pages deploy ./
```

The D1 binding (`DB`) is configured in `wrangler.toml` and automatically available to all Pages Functions.

## Admin Panel

### Accessing the Admin Panel

Navigate to `/admin.html` to access the admin panel. Authentication is handled via GitHub OAuth — only authorised organisation members can access the dashboard.

### Features

1. **Statistics Dashboard**: View counts of subscribers and applications
2. **Data Tables**: Browse all stored data in organized tables
3. **Export Functionality**: Download data as CSV files
4. **Data Management**: Clear all data if needed

#### Export Data
- **Export Subscribers**: Download all subscriber emails with timestamps as CSV
- **Export Applications**: Download all driver applications with full details as CSV

The exported CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.

#### Clear Data
- Clear all subscribers
- Clear all driver applications
- Confirmation dialogs prevent accidental deletion

## Technical Details

### Database Schema

#### `subscribers` table
| Column    | Type    | Constraints                |
|-----------|---------|----------------------------|
| id        | INTEGER | PRIMARY KEY AUTOINCREMENT  |
| email     | TEXT    | UNIQUE NOT NULL            |
| timestamp | TEXT    | NOT NULL                   |
| source    | TEXT    | NOT NULL DEFAULT 'website' |

#### `applications` table
| Column           | Type | Constraints                |
|------------------|------|----------------------------|
| id               | TEXT | PRIMARY KEY (UUID)         |
| name             | TEXT | NOT NULL                   |
| phone            | TEXT | NOT NULL                   |
| email            | TEXT | NOT NULL                   |
| city             | TEXT | NOT NULL                   |
| vehicle_type     | TEXT | NOT NULL                   |
| vehicle_year     | TEXT | NOT NULL                   |
| license_number   | TEXT | NOT NULL                   |
| years_experience | TEXT | NOT NULL                   |
| platforms        | TEXT | NOT NULL DEFAULT '[]'      |
| availability     | TEXT | NOT NULL                   |
| additional_info  | TEXT | NOT NULL DEFAULT ''        |
| submitted_at     | TEXT | NOT NULL                   |
| status           | TEXT | NOT NULL DEFAULT 'pending' |

### API Endpoints

| Method | Path                       | Description                  |
|--------|----------------------------|------------------------------|
| POST   | `/api/subscribe`           | Add an email subscriber      |
| POST   | `/api/apply`               | Submit a driver application  |
| GET    | `/api/admin/subscribers`   | List all subscribers         |
| DELETE | `/api/admin/subscribers`   | Delete all subscribers       |
| GET    | `/api/admin/applications`  | List all applications        |
| DELETE | `/api/admin/applications`  | Delete all applications      |

### Architecture

- **`dataStore.js`**: Client-side module that routes all data operations through the API endpoints.
- **`functions/api/subscribe.js`**: Cloudflare Pages Function handling email subscriptions.
- **`functions/api/apply.js`**: Cloudflare Pages Function handling driver applications.
- **`functions/api/admin/subscribers.js`**: Admin API for listing/clearing subscribers.
- **`functions/api/admin/applications.js`**: Admin API for listing/clearing applications.
- **`schema.sql`**: D1 database schema definition.

### Data Persistence

Data persists in the Cloudflare D1 database and is available across:
- All browsers and devices
- Page reloads and browser restarts
- Private/incognito browsing sessions

**Data will only be cleared if:**
- Admin manually clears data from the admin panel
- The D1 database tables are manually truncated

## Security Considerations

### Current Implementation
- Data is stored in a Cloudflare D1 database (server-side only)
- All writes go through server-side Cloudflare Pages Functions
- No tokens or credentials are exposed to the browser
- No authentication is required for visitors to submit emails or applications
- Admin panel uses GitHub OAuth for access control

### Recommended for Production

For a production environment, consider:

1. **Admin API Protection**: Add authentication middleware to the `/api/admin/*` endpoints so only authorised users can read or delete data.

2. **Privacy Compliance**: Ensure GDPR/privacy law compliance
   - Add privacy policy
   - Implement data retention policies
   - Allow users to request data deletion

## Troubleshooting

### Data Not Saving
1. Ensure the D1 database is created and bound in `wrangler.toml`
2. Verify the schema has been applied (`npx wrangler d1 execute daberni-db --file=./schema.sql`)
3. Check the browser console and Cloudflare dashboard logs for errors

### Can't See Data in Admin Panel
1. Ensure you're navigating to `/admin.html`
2. Check the browser console for API error messages
3. Verify the D1 database is accessible

### Export Not Working
1. Check browser's download settings
2. Ensure pop-ups are not blocked
3. Try a different browser

## Support

For issues or questions about the data storage system:
1. Check browser console for error messages
2. Review Cloudflare Pages Function logs in the Cloudflare dashboard
3. Verify D1 database configuration in `wrangler.toml`

---

**Note**: This storage solution uses Cloudflare D1 (SQLite at the edge) for fast, reliable data persistence with zero external dependencies.
