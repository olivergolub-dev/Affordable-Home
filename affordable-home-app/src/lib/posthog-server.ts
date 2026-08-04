import { PostHog } from 'posthog-node';

/**
 * Server-side PostHog client for short-lived route handlers. flushAt:1 +
 * flushInterval:0 means every capture is sent immediately; the caller MUST
 * `await client.shutdown()` in a finally block so events aren't lost when the
 * function returns. Reuses the same public project token as the browser client.
 */
export function PostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}
