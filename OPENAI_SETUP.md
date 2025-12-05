# OpenAI Integration Setup Guide

Your DayLog app is now integrated with OpenAI! Follow these steps to enable AI-powered log processing.

## Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Give it a name like "DayLog"
5. Copy the API key (it starts with `sk-`)

⚠️ **Important**: Copy this key immediately - you won't be able to see it again!

## Step 2: Add API Key to Your App

1. Open the `.env` file in your project root
2. Replace the empty value with your API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file

The dev server will automatically restart and detect your API key.

## Step 3: Verify It's Working

1. Go to http://localhost:8080
2. Look for the badge under the "DayLog" title:
   - ✨ **"AI Enabled"** (green) = Working!
   - ⚠️ **"AI Not Configured"** (gray) = API key not set

## What AI Does For You

With AI enabled, your daily logs get smarter:

### Without AI (Basic Mode):
- Requires `@clientname` mentions
- Tasks must start with `-`, `*`, or `•`
- Simple text parsing

### With AI (GPT-4o Mini):
- **Understands natural language** - no special formatting needed
- **Recognizes clients** automatically from context
- **Extracts tasks** from any sentence structure
- **Generates smart summaries** of your work
- **Better context understanding** of what you did

## Example

**Your input:**
```
Had a productive morning meeting with the Acme team about the new dashboard.
Finished the login page redesign and started working on the analytics charts.
Tomorrow I need to review Sarah's code and deploy to staging.
```

**AI extracts:**
- Clients: Acme
- Tasks:
  - Finished login page redesign
  - Started analytics charts work
  - Review Sarah's code
  - Deploy to staging
- Summary: "Met with Acme team regarding dashboard project. Completed login redesign and began analytics work. Planning code review and staging deployment."

## Cost

Using GPT-4o Mini is very affordable:
- ~$0.15 per million input tokens
- ~$0.60 per million output tokens
- Average daily log: ~$0.001 (less than 1 cent!)
- 1000 logs ≈ $1.00

## Fallback Behavior

If the API key is missing or there's an error:
- App automatically falls back to basic mode
- No errors or interruptions
- Works offline

## Security Notes

✅ Your API key is:
- Stored in `.env` (gitignored, won't be committed)
- Never exposed in the UI
- Only used for API calls

⚠️ **For Production**:
The current setup uses `dangerouslyAllowBrowser: true` which exposes your API key in the browser. For production apps, you should:
1. Create a backend API endpoint
2. Store API key on the server
3. Call OpenAI from the backend only

This is fine for personal/local use!

## Troubleshooting

### Badge shows "AI Not Configured"
- Check that `.env` file exists in project root
- Verify the API key starts with `sk-`
- Make sure there are no quotes around the key
- Restart the dev server: `npm run dev`

### Getting API errors
- Check your OpenAI account has credits/billing enabled
- Verify the API key hasn't expired
- Check the browser console for specific error messages

### Still using basic mode after adding key
- Hard refresh the page (Cmd/Ctrl + Shift + R)
- Check browser console for errors
- Make sure the `.env` file is in the project root (same folder as `package.json`)

## Need Help?

- OpenAI API Docs: https://platform.openai.com/docs
- Check your usage: https://platform.openai.com/usage
- API key management: https://platform.openai.com/api-keys
