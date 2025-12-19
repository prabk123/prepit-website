# Contact Form Setup Guide

The contact form at `/contact` is now ready and sends submissions to a Slack channel.

## Features

- ✅ Responsive design (desktop and mobile)
- ✅ Email validation
- ✅ Success notification with checkmark
- ✅ Slack integration for notifications

## Slack Webhook Setup

To receive contact form submissions in Slack, follow these steps:

### 1. Create a Slack Webhook

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** or select an existing app
3. Choose **"From scratch"** if creating new
4. Name your app (e.g., "PrepIt Contact Form") and select your workspace
5. In the app settings, go to **"Incoming Webhooks"**
6. Toggle **"Activate Incoming Webhooks"** to **On**
7. Click **"Add New Webhook to Workspace"**
8. Select the channel where you want to receive contact form submissions
9. Click **"Allow"**
10. Copy the **Webhook URL** (it looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

### 2. Configure Environment Variable

Create a `.env.local` file in the root of your project (or add to existing one):

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Important:** Never commit the `.env.local` file to version control. It should already be in `.gitignore`.

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
yarn dev
```

## Testing

1. Navigate to [http://localhost:3000/contact](http://localhost:3000/contact)
2. Fill out the form with test data
3. Click "Submit"
4. You should see a green success notification
5. Check your Slack channel for the message

## Message Format

The Slack message will include:

- 🍃 Header indicating a new contact form submission
- **Name** and **Email** of the sender
- **Message** content
- **Timestamp** of submission

## Troubleshooting

- **"Slack integration not configured" error**: Make sure `SLACK_WEBHOOK_URL` is set in `.env.local`
- **No message in Slack**: Check that the webhook URL is correct and the app has permission to post to the channel
- **Email validation error**: Ensure the email follows the format `example@domain.com`
