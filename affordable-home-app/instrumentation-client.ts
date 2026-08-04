import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  // Profiles are only created for identified users. Anonymous visitors stay
  // profile-less; on login we identify by the Supabase user UUID only (no
  // name/email) — see src/components/PostHogAuthBridge.tsx.
  person_profiles: "identified_only",
  // Privacy: this app renders income, AMI %, and addresses. Session replay
  // masks every input by default and every element tagged data-ph-mask.
  session_recording: {
    maskAllInputs: true,
    maskTextSelector: "[data-ph-mask]",
  },
  debug: process.env.NODE_ENV === "development",
});
