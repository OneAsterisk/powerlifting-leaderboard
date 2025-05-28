# Security Guide

This document outlines the security measures and best practices for the Powerlifting Leaderboard application.

## Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Firebase Configuration
# Get these values from your Firebase project settings
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (for server-side operations)
# Path to your Firebase service account key file
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json

# Admin User UID (for setting admin privileges)
ADMIN_USER_UID=your_admin_user_uid_here
```

### Getting Firebase Configuration Values

1. Go to your Firebase Console
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app configuration icon
6. Copy the config values to your `.env` file

## Firebase Service Account Key

### Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `serviceAccountKey.json`
5. Place it in the `scripts/` directory
6. **NEVER commit this file to version control**

### Security Notes

- The `serviceAccountKey.json` file contains sensitive credentials
- It's automatically ignored by Git (see `.gitignore`)
- Only use this for admin operations in a secure environment
- Consider using Firebase Admin SDK with environment-based authentication in production

## Admin User Setup

### Setting Admin Privileges

To grant admin privileges to a user:

```bash
# Method 1: Using environment variable
export ADMIN_USER_UID=your_user_uid_here
node scripts/setAdmin.js

# Method 2: Command line argument
node scripts/setAdmin.js your_user_uid_here
```

### Getting User UID

1. User must sign in to the application first
2. Check Firebase Console → Authentication → Users
3. Copy the UID from the user list

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files to version control
- ✅ Use different `.env` files for different environments
- ✅ Validate required environment variables on startup
- ✅ Use `VITE_` prefix for client-side variables in Vite

### Firebase Security

- ✅ Use Firebase Security Rules to protect data
- ✅ Implement proper authentication checks
- ✅ Use Firebase Admin SDK only on secure servers
- ✅ Regularly rotate service account keys

### Code Security

- ✅ No hardcoded credentials in source code
- ✅ Input validation on all user inputs
- ✅ Proper error handling without exposing sensitive information
- ✅ Regular dependency updates

## Firestore Security Rules

The application uses Firestore security rules defined in `firestore.rules`. Key security features:

- Users can only read/write their own data
- Admin users have elevated privileges
- Public data is read-only for non-authenticated users
- Proper validation of data structure and types

## Deployment Security

### Production Environment

- Use environment variables provided by your hosting platform
- Never include `.env` files in production builds
- Use Firebase hosting security headers
- Enable HTTPS only

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Go to Project Settings → Environment Variables
3. Add all `VITE_*` variables from your `.env` file

## Monitoring and Auditing

- Monitor Firebase Console for unusual activity
- Review authentication logs regularly
- Keep dependencies updated (`npm audit`)
- Monitor for security vulnerabilities

## Incident Response

If you suspect a security breach:

1. Immediately rotate all API keys and service account keys
2. Review Firebase Console logs
3. Check for unauthorized data access
4. Update all environment variables
5. Review and update security rules if necessary

## Contact

For security-related issues, please contact the development team immediately.
