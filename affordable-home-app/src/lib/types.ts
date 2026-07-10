import type { AmiBand } from './incomeLimits';

/** Canonical bedroom tokens used across the wizard, filters, and DB. */
export const BEDROOM_TOKENS = ['Studio', '1BR', '2BR', '3BR', '4BR'] as const;
export type BedroomToken = (typeof BEDROOM_TOKENS)[number];

/** Priority groups a program may prioritize (matches wizard step 6). */
export const PRIORITY_GROUPS = ['senior', 'veteran', 'disability', 'homeless'] as const;
export type PriorityGroup = (typeof PRIORITY_GROUPS)[number];

export type VoucherStatus = 'yes' | 'no' | 'unsure';

/**
 * A single affordable-housing listing.
 * Mirrors the `listings` table (see supabase/migrations/0001_listings.sql).
 * Every listing carries its provenance: `source`, `source_url`, `last_verified`.
 */
export interface Listing {
  id: string;
  name: string;
  address: string | null;
  /** Essex County municipality, e.g. "Newark". */
  city: string;
  program_type: string | null;
  /** AMI bands this listing serves, e.g. [50, 60]. */
  ami_bands: AmiBand[];
  /** Bedroom types offered. */
  bedroom_types: BedroomToken[];
  /** Monthly rent in whole dollars, or null when "contact for rent". */
  rent: number | null;
  /** True when the waitlist is open / accepting applications. */
  waitlist_open: boolean;
  application_link: string | null;
  phone: string | null;
  /** Groups this program prioritizes, if any. */
  priority_groups: PriorityGroup[];
  accessible: boolean;
  /** Human-readable source name, e.g. "Newark Housing Authority". */
  source: string;
  source_url: string | null;
  /** ISO date (YYYY-MM-DD) the listing was last verified. */
  last_verified: string | null;
}

/** Normalized wizard answers (see src/lib/wizardStore.ts). */
export interface WizardAnswers {
  householdSize: number | null;
  income: number | null;
  bedrooms: BedroomToken | null;
  towns: string[];
  voucher: VoucherStatus | null;
  priorityGroups: PriorityGroup[];
  email: string | null;
}
