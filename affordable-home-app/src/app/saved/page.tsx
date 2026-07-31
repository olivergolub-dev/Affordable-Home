import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mapRowToListing } from '@/lib/listings';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import type { WizardAnswers } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Saved',
  robots: { index: false, follow: false },
};

function ProfileSummary({ answers }: { answers: WizardAnswers }) {
  const parts: string[] = [];
  if (answers.householdSize != null) parts.push(`${answers.householdSize} in household`);
  if (answers.income != null) parts.push(`$${answers.income.toLocaleString()} income`);
  if (answers.bedrooms) parts.push(answers.bedrooms);
  if (answers.towns.length > 0) parts.push(answers.towns.join(', '));
  if (answers.voucher === 'yes') parts.push('Has a voucher');
  return <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{parts.length ? parts.join(' · ') : 'No details saved yet.'}</p>;
}

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: favRows } = await supabase
    .from('favorite_listings')
    .select('created_at, listings(*)')
    .order('created_at', { ascending: false });

  // Supabase types an embedded relation as an array even though this FK is
  // to-one; at runtime it may be an object or a 1-element array. Handle both.
  const favorites = (favRows ?? [])
    .map((row) => {
      const embedded = (row as unknown as { listings: unknown }).listings;
      return (Array.isArray(embedded) ? embedded[0] : embedded) as Record<string, unknown> | null | undefined;
    })
    .filter((l): l is Record<string, unknown> => Boolean(l))
    .map((l) => mapRowToListing(l));

  const { data: savedRow } = await supabase.from('saved_results').select('answers').maybeSingle();
  const savedAnswers = (savedRow?.answers as WizardAnswers | undefined) ?? null;

  const sectionCard: React.CSSProperties = { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 22px' };

  return (
    <>
      <SiteHeader />
      <main style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#0D1117', marginBottom: 8, fontWeight: 400 }}>Saved</h1>
          <p style={{ fontSize: 15, color: '#334155', marginBottom: 32 }}>Your saved profile and the listings you&apos;ve bookmarked.</p>

          <div style={{ ...sectionCard, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: savedAnswers ? 10 : 0 }}>
              <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 18, color: '#0D1117' }}>Your profile</h2>
              <Link href="/wizard" style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600, textDecoration: 'none' }}>{savedAnswers ? 'Update' : 'Take the quiz'}</Link>
            </div>
            {savedAnswers ? <ProfileSummary answers={savedAnswers} /> : <p style={{ fontSize: 14, color: '#64748B' }}>You haven&apos;t saved your results yet. Take the quiz, then tap &ldquo;Save my results&rdquo; on the results page.</p>}
          </div>

          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 18, color: '#0D1117', marginBottom: 14 }}>Saved listings ({favorites.length})</h2>
          {favorites.length === 0 ? (
            <div style={{ ...sectionCard, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>No saved listings yet. Browse listings and tap the heart to save one.</p>
              <Link href="/results" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Browse listings</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {favorites.map((listing) => (
                <div key={listing.id} style={{ ...sectionCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 17, color: '#0D1117' }}>{listing.name}</span>
                      <span style={{ fontSize: 13, color: '#64748B' }}>{listing.city}</span>
                    </div>
                    {listing.program_type && <div style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>{listing.program_type}</div>}
                  </div>
                  {listing.source_url && (
                    <a href={listing.source_url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #DBEAFE', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>View details</a>
                  )}
                </div>
              ))}
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Manage saved listings from the <Link href="/results" style={{ color: '#64748B' }}>listings page</Link> (tap the heart to remove).</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
