import { supabase } from './supabase';
import { AMI_BANDS, type AmiBand } from './incomeLimits';
import { BEDROOM_TOKENS, PRIORITY_GROUPS, type BedroomToken, type Listing, type PriorityGroup } from './types';

const LISTINGS_TABLE = 'listings';

/** Columns selected from the DB, in one place so it can't drift. */
const SELECT_COLUMNS =
  'id, name, address, city, program_type, ami_bands, bedroom_types, rent, waitlist_open, application_link, phone, priority_groups, accessible, source, source_url, last_verified';

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  // Tolerate Postgres array-as-string ("{50,60}") or comma-joined strings.
  if (typeof value === 'string') {
    return value.replace(/^\{|\}$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [value];
}

function toAmiBands(value: unknown): AmiBand[] {
  return toArray(value)
    .map((v) => Number(String(v).replace('%', '')))
    .filter((n): n is AmiBand => (AMI_BANDS as readonly number[]).includes(n));
}

function toBedroomTokens(value: unknown): BedroomToken[] {
  return toArray(value)
    .map((v) => String(v).trim())
    .filter((s): s is BedroomToken => (BEDROOM_TOKENS as readonly string[]).includes(s));
}

function toPriorityGroups(value: unknown): PriorityGroup[] {
  return toArray(value)
    .map((v) => String(v).trim().toLowerCase())
    .filter((s): s is PriorityGroup => (PRIORITY_GROUPS as readonly string[]).includes(s));
}

function toRent(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function toBool(value: unknown): boolean {
  return value === true || String(value).toLowerCase() === 'true';
}

/** Map a raw DB row (loosely typed) to a strict Listing. */
export function mapRowToListing(row: Record<string, unknown>): Listing {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? 'Unnamed listing'),
    address: (row.address as string) ?? null,
    city: String(row.city ?? ''),
    program_type: (row.program_type as string) ?? null,
    ami_bands: toAmiBands(row.ami_bands),
    bedroom_types: toBedroomTokens(row.bedroom_types),
    rent: toRent(row.rent),
    waitlist_open: toBool(row.waitlist_open),
    application_link: (row.application_link as string) ?? null,
    phone: (row.phone as string) ?? null,
    priority_groups: toPriorityGroups(row.priority_groups),
    accessible: toBool(row.accessible),
    source: String(row.source ?? ''),
    source_url: (row.source_url as string) ?? null,
    last_verified: (row.last_verified as string) ?? null,
  };
}

export interface FetchListingsResult {
  listings: Listing[];
  error: string | null;
}

/** Fetch all listings, mapped and typed. Never throws. */
export async function fetchListings(): Promise<FetchListingsResult> {
  const { data, error } = await supabase.from(LISTINGS_TABLE).select(SELECT_COLUMNS);
  if (error) return { listings: [], error: error.message };
  const listings = (data ?? []).map((row) => mapRowToListing(row as Record<string, unknown>));
  return { listings, error: null };
}
