# Nayl App - Supabase Integration Setup Guide

This guide will walk you through setting up Supabase for your Nayl app to save timer progress and user data.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `nayl-app` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Update Your App Configuration

1. Copy `.env.example` to `.env` in the project root
2. Set your Supabase credentials (never commit `.env`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Restart Expo after changing env vars (`npx expo start -c`)

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL
5. You should see success messages for all the table creations

## Step 5: Install Dependencies

Run the following command in your project directory:

```bash
npm install @supabase/supabase-js
```

## Step 6: Test the Integration

1. Start your app: `npm start`
2. The app should now:
   - Create a user session when first opened
   - Save timer progress every 30 seconds
   - Save trigger data when you reset
   - Persist data across app restarts

## Step 7: Verify Data is Being Saved

1. In your Supabase dashboard, go to **Table Editor**
2. You should see three tables:
   - `user_sessions` - Stores current timer state
   - `user_stats` - Stores user statistics
   - `trigger_entries` - Stores trigger history
3. Check that data is being inserted when you use the app

## Database Schema Overview

### user_sessions
- Stores the current timer state for each user
- Tracks current streak, total streak, and reset times
- One record per user

### user_stats
- Stores aggregated user statistics
- Tracks total episodes, longest streak, etc.
- One record per user

### trigger_entries
- Stores individual trigger events
- Used for analytics and history
- Multiple records per user

## Features Now Available

✅ **Persistent Timer**: Timer progress is saved and restored across app restarts
✅ **Trigger History**: All reset triggers are saved with timestamps
✅ **User Statistics**: Longest streaks, total episodes, etc.
✅ **Brain Rewiring Progress**: Calculated from total streak time
✅ **Offline Support**: App works offline and syncs when connection is restored

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Double-check your anon key in `src/lib/supabase.ts`
   - Make sure you copied the "anon public" key, not the service role key

2. **"Table doesn't exist" error**
   - Make sure you ran the SQL schema in Step 4
   - Check that all tables were created successfully

3. **Data not saving**
   - Check your internet connection
   - Look for errors in the browser console
   - Verify your Supabase project is active

4. **App crashes on startup**
   - Make sure you installed the Supabase dependency
   - Check that the supabase.ts file has correct credentials

## Next Steps

Once this is working, you can enhance the app with:

- **User Authentication**: Add login/signup functionality
- **Multiple Users**: Support for multiple users on the same device
- **Cloud Sync**: Sync data across multiple devices
- **Analytics Dashboard**: View detailed statistics in the app
- **Backup/Restore**: Export/import user data

## Security Notes

The current setup allows all operations for simplicity. For production:

1. Implement proper user authentication
2. Add Row Level Security (RLS) policies
3. Use environment variables for API keys
4. Add rate limiting
5. Implement proper error handling

## Support

If you encounter issues:
1. Check the Supabase documentation
2. Look at the browser console for error messages
3. Verify your database schema is correct
4. Test with a simple query in the Supabase SQL Editor