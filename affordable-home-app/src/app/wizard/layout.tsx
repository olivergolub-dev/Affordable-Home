import type { Metadata } from 'next';

// The 7 wizard steps are a single personalized, session-scoped flow with no
// standalone content value — noindex keeps 7 near-duplicate thin pages out of
// search results without hiding the flow from users or from /results, which
// does carry real indexable content.
export const metadata: Metadata = {
  title: 'Check Your Eligibility',
  description: 'Answer seven questions to see the affordable housing programs and listings in Essex County, NJ you qualify for.',
  robots: { index: false, follow: true },
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
