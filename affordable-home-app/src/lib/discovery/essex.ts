/** The 22 municipalities of Essex County, NJ — the site's whole coverage area. */
export const ESSEX_MUNICIPALITIES = [
  'Belleville',
  'Bloomfield',
  'Caldwell',
  'Cedar Grove',
  'East Orange',
  'Essex Fells',
  'Fairfield',
  'Glen Ridge',
  'Irvington',
  'Livingston',
  'Maplewood',
  'Millburn',
  'Montclair',
  'Newark',
  'North Caldwell',
  'Nutley',
  'Orange',
  'Roseland',
  'South Orange',
  'Verona',
  'West Caldwell',
  'West Orange',
] as const;

export type EssexMunicipality = (typeof ESSEX_MUNICIPALITIES)[number];

/**
 * Map a free-form town string to a canonical municipality, or null.
 * Handles "East Orange City", "Newark, NJ", "Twp. of Livingston", "Short Hills"
 * (a Millburn neighborhood), and case/punctuation noise.
 */
export function normalizeMunicipality(raw: string | null | undefined): EssexMunicipality | null {
  if (!raw) return null;
  let s = raw
    .toLowerCase()
    .replace(/,?\s*(nj|new jersey)\b.*$/, '')
    .replace(/\b(city|town|township|twp\.?|borough|boro|village)( of)?\b/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (s === 'short hills') s = 'millburn';
  if (s === 'vailsburg' || s === 'ironbound') s = 'newark';
  return ESSEX_MUNICIPALITIES.find((m) => m.toLowerCase() === s) ?? null;
}
