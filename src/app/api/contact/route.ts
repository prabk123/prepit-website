import { NextRequest, NextResponse } from "next/server";
import { CONTACT_HONEYPOT_FIELD, CONTACT_LIMITS, contactSlackMessage } from "@/lib/contact";
import { formRateLimitResponse } from "@/lib/formRateLimit";

export async function POST(request: NextRequest) {
  const limited = formRateLimitResponse(request, "contact");
  if (limited) return limited;

  try {
    const body = await request.json();
    const { name, email, message, type = "contact" } = body;

    // Only bots fill the hidden field: answer as if sent, post nothing.
    if (body[CONTACT_HONEYPOT_FIELD]) {
      console.warn("Contact form honeypot filled; submission dropped");
      return NextResponse.json(
        { success: true, message: "Message sent successfully" },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      name.length > CONTACT_LIMITS.name ||
      email.length > CONTACT_LIMITS.email ||
      message.length > CONTACT_LIMITS.message
    ) {
      return NextResponse.json(
        { error: "A field is too long" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get Slack webhook URL from environment variable
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhookUrl) {
      console.error("SLACK_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { error: "Slack integration not configured" },
        { status: 500 }
      );
    }

    const slackMessage = contactSlackMessage({ name, email, message, isFeedback: type === "feedback" });

    // Send to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackMessage),
    });

    if (!slackResponse.ok) {
      console.error("Failed to send to Slack:", await slackResponse.text());
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
