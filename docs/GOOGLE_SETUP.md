# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for the Syllabus Importer.

## Prerequisites

- Google Cloud Console account
- Next.js app running locally

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable APIs

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for and enable these APIs:
   - **Google Calendar API**
   - **Google+ API** (for user profile)

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set the following:
   - **Name**: Syllabus Importer
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - Your production domain (when deployed)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-from-step-3"
GOOGLE_CLIENT_SECRET="your-client-secret-from-step-3"

# Other variables
DATABASE_URL="file:./dev.db"
PDF_SERVICE_URL="http://localhost:8001"
```

## Step 5: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Use the output as your `NEXTAUTH_SECRET`.

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/export`
3. Click "Sync to Google Calendar"
4. You should see a "Sign in with Google" button
5. After signing in, you should be able to sync events

## Scopes Requested

The app requests these Google permissions:
- `openid` - Basic authentication
- `email` - User's email address
- `profile` - User's basic profile info
- `https://www.googleapis.com/auth/calendar` - Read/write access to Google Calendar

## Production Deployment

For production:

1. Update your Google OAuth settings with your production domain
2. Set the production environment variables
3. Make sure `NEXTAUTH_URL` matches your production domain

## Troubleshooting

### "Google Calendar not connected" error
- Make sure you've enabled the Google Calendar API
- Check that your OAuth credentials are correct
- Verify the redirect URI matches exactly

### "Access denied" error
- Make sure you've requested the calendar scope
- Check that the user has granted calendar permissions

### Token expired errors
- The app should handle token refresh automatically
- If issues persist, the user may need to reconnect their Google account

## Security Notes

- Never commit your `.env.local` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your NextAuth secret in production
- Monitor API usage in Google Cloud Console

## API Limits

Google Calendar API has these limits:
- 1,000,000 requests per day
- 100 requests per 100 seconds per user

For most syllabus use cases, these limits are more than sufficient.
