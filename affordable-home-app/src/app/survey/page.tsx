import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { OutcomeSurveyForm } from '@/components/OutcomeSurveyForm';

// Reached from an emailed follow-up link, not from search. No indexable
// content of its own.
export const metadata: Metadata = {
  title: 'How did your search go?',
  robots: { index: false, follow: false },
};

export default function SurveyPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <OutcomeSurveyForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
