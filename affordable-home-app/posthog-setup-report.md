# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the Home Reach Next.js App Router application. A new `instrumentation-client.ts` file initializes PostHog on the client side using the recommended Next.js 15.3+ pattern (no provider component needed). Reverse proxy rewrites were added to `next.config.ts` to route PostHog traffic through `/ingest` for improved reliability and ad-blocker bypass. Events are tracked across the full eligibility wizard funnel (7 steps) as well as on the results page where users view and apply to listings. User identification is wired up at the final wizard step when a user optionally provides their email address. Error tracking via `posthog.captureException` was added to the Supabase data fetch in the results page.

| Event Name | Description | File |
|---|---|---|
| `eligibility_wizard_started` | User clicks 'Check My Eligibility' or 'Check Eligibility' CTA on the homepage. | `src/app/page.tsx` |
| `wizard_household_size_selected` | User selects their household size in wizard step 1 and advances to step 2. | `src/app/wizard/page.tsx` |
| `wizard_income_submitted` | User enters their annual household income and clicks Continue in wizard step 2. | `src/app/wizard/step2/page.tsx` |
| `wizard_bedrooms_selected` | User selects bedroom count needed in wizard step 3 and advances to step 4. | `src/app/wizard/step3/page.tsx` |
| `wizard_towns_selected` | User selects preferred towns in wizard step 4 and continues to step 5. | `src/app/wizard/step4/page.tsx` |
| `wizard_voucher_selected` | User selects their Section 8 voucher status in wizard step 5 and advances to step 6. | `src/app/wizard/step5/page.tsx` |
| `wizard_circumstances_selected` | User selects special housing circumstances (senior, veteran, etc.) in wizard step 6 and continues. | `src/app/wizard/step6/page.tsx` |
| `eligibility_wizard_completed` | User completes the final wizard step (step 7) and navigates to see their matches. | `src/app/wizard/step7/page.tsx` |
| `results_viewed` | Results page loads after wizard completion, representing the bottom of the eligibility funnel. | `src/app/results/page.tsx` |
| `results_filter_changed` | User changes availability, bedrooms, or AMI tier filter on the results page. | `src/app/results/page.tsx` |
| `listing_apply_clicked` | User clicks the Apply button on a specific listing to open its official application link. | `src/app/results/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/489303/dashboard/1770563)
- [Eligibility Wizard Conversion Funnel (wizard)](https://us.posthog.com/project/489303/insights/5PW3HegN)
- [Wizard Started vs Completed (wizard)](https://us.posthog.com/project/489303/insights/YZSXbXbW)
- [Listing Apply Clicks (wizard)](https://us.posthog.com/project/489303/insights/OTK13meo)
- [Full Wizard Step Drop-off (wizard)](https://us.posthog.com/project/489303/insights/huTTmpDa)
- [Results Filter Engagement (wizard)](https://us.posthog.com/project/489303/insights/v2XgZC9J)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `identify` is only called when a user provides their email in wizard step 7. Consider identifying on subsequent sessions if the email was stored.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
