# Daberni Form Data Storage

## Overview

The Daberni website now includes a comprehensive data storage solution for all form submissions. Data is stored locally in the browser using `localStorage` with enhanced structure and management capabilities.

## What Gets Stored

### 1. Email Subscribers
When users subscribe via the email subscription form, the following data is stored:

- **Email address**: The subscriber's email
- **Timestamp**: When they subscribed (ISO 8601 format)
- **Source**: Always set to "website" for tracking

**localStorage keys:**
- `subscribers`: Array of email addresses
- `subscribersData`: Array of objects with detailed subscription information

### 2. Driver Applications
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

**localStorage key:**
- `driverApplications`: Array of application objects

## Admin Panel

### Accessing the Admin Panel

Navigate to `/admin.html` to access the admin panel. This page provides:

1. **Statistics Dashboard**: View counts of subscribers and applications
2. **Data Tables**: Browse all stored data in organized tables
3. **Export Functionality**: Download data as CSV files
4. **Data Management**: Clear all data if needed

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

### Browser Compatibility

The localStorage solution works in all modern browsers:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

**Storage Limits:**
- Most browsers allow 5-10 MB of localStorage per domain
- This is sufficient for thousands of form submissions

### Data Persistence

Data persists across:
- Page reloads
- Browser restarts
- Multiple sessions

**Data will be cleared if:**
- User clears browser data/cache
- User uses incognito/private browsing mode (data only lasts that session)
- Admin manually clears data from the admin panel

## Security Considerations

### Current Implementation
- Data is stored client-side in the browser
- No server-side storage or authentication
- Anyone with access to the browser can view stored data
- Data is not encrypted

### Recommended for Production

For a production environment, consider:

1. **Backend Integration**: Send form data to a server
   - Use services like Formspree, Basin, or custom backend
   - Store in a database (PostgreSQL, MongoDB, etc.)

2. **Authentication**: Protect the admin panel
   - Add login/password protection
   - Use services like Netlify Identity or Auth0

3. **Data Encryption**: Encrypt sensitive data
   - Use HTTPS (already enforced by GitHub Pages)
   - Consider encrypting data before storing

4. **Privacy Compliance**: Ensure GDPR/privacy law compliance
   - Add privacy policy
   - Implement data retention policies
   - Allow users to request data deletion

## Future Enhancements

Possible improvements for the storage system:

1. **Backend Integration**: 
   - Netlify Functions
   - Vercel Serverless Functions
   - External API (Formspree, Basin, etc.)

2. **Database Storage**:
   - Firebase Realtime Database
   - Supabase
   - MongoDB Atlas

3. **Email Notifications**:
   - Send confirmation emails to subscribers
   - Notify admins of new applications

4. **Advanced Analytics**:
   - Track conversion rates
   - Analyze peak submission times
   - Geographic data visualization

## Troubleshooting

### Data Not Saving
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Check localStorage is not full (clear old data)
4. Verify you're not in incognito/private mode

### Can't Access Admin Panel
1. Ensure you're navigating to `/admin.html`
2. Check that JavaScript is enabled
3. Clear browser cache and reload

### Export Not Working
1. Check browser's download settings
2. Ensure pop-ups are not blocked
3. Try a different browser

## Support

For issues or questions about the data storage system:
1. Check browser console for error messages
2. Verify localStorage is working in your browser
3. Try clearing and resubmitting data

---

**Note**: This is a client-side storage solution suitable for development and small-scale deployments. For production use with sensitive data, implement proper backend storage and security measures.
