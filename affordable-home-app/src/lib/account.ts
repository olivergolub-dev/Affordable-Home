import { createClient } from '@/lib/supabase/client';
import type { WizardAnswers } from '@/lib/types';

/**
 * Browser-side data access for signed-in users. All of these rely on Supabase
 * row-level security (migration 0002_accounts.sql): a user can only read/write
 * their own rows, so we never trust the client to scope by user_id alone.
 */

type Result = { error: string | null };

/** Upsert the user's saved profile (their latest wizard answers). */
export async function saveResults(answers: WizardAnswers): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };
  const { error } = await supabase
    .from('saved_results')
    .upsert({ user_id: user.id, answers }, { onConflict: 'user_id' });
  return { error: error?.message ?? null };
}

/** The user's saved answers, or null if none / signed out. */
export async function getSavedResults(): Promise<WizardAnswers | null> {
  const supabase = createClient();
  const { data } = await supabase.from('saved_results').select('answers').maybeSingle();
  return (data?.answers as WizardAnswers | undefined) ?? null;
}

/** The listing ids the user has favorited. Empty when signed out. */
export async function getFavoriteListingIds(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from('favorite_listings').select('listing_id');
  return (data ?? []).map((row) => String((row as { listing_id: string }).listing_id));
}

export async function addFavorite(listingId: string): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };
  const { error } = await supabase
    .from('favorite_listings')
    .insert({ user_id: user.id, listing_id: listingId });
  return { error: error?.message ?? null };
}

export async function removeFavorite(listingId: string): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };
  const { error } = await supabase
    .from('favorite_listings')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId);
  return { error: error?.message ?? null };
}
