import { schedulePostHog } from "@/lib/posthogClient";

// PostHog loads once the page is idle, not before the first paint. See posthogClient.ts.
schedulePostHog();
