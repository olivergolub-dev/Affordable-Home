import type { Listing } from '../src/lib/types';

/**
 * Verified starter dataset for Home Reach.
 *
 * Every entry below is a REAL Essex County housing authority or affordable
 * property with a public source. Per the site's promise, nothing here is
 * fabricated. Where a field could not be verified from a public source it is
 * left conservative:
 *   - `waitlist_open` defaults to false so the site never falsely advertises
 *     an open waitlist; flip to true only when confirmed against the source.
 *   - `rent` is null ("contact for rent") unless a public figure is known.
 *   - `bedroom_types` is left empty when unspecified (matches any bedroom filter).
 *   - `ami_bands` reflect the program's typical income tiers (HCV/public housing
 *     serve ~30–50% AMI; LIHTC family units ~50–60%; senior LIHTC ~30–60%),
 *     not a claim about a specific unit.
 *
 * Grow this list (or replace it with a live scraper in ingest.ts) over time.
 * Sources are recorded per row; last_verified reflects when the row was checked.
 */

export type SeedListing = Omit<Listing, 'id'>;

const VERIFIED = '2026-07-09';

export const SEED_LISTINGS: SeedListing[] = [
  {
    name: 'Housing Choice Voucher Program (Section 8)',
    address: '57 Sussex Ave',
    city: 'Newark',
    program_type: 'Section 8 / HCV',
    ami_bands: [30, 50],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: 'https://www.newarkha.org/Status-Check',
    phone: '973-273-6206',
    priority_groups: [],
    accessible: false,
    source: 'Newark Housing Authority',
    source_url: 'https://www.newarkha.org/Programs-Services/Housing-Choice-Voucher-Program-Section-8',
    last_verified: VERIFIED,
  },
  {
    name: 'Public Housing Program',
    address: '57 Sussex Ave',
    city: 'Newark',
    program_type: 'Public Housing',
    ami_bands: [30, 50],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: 'https://www.newarkha.org/Status-Check',
    phone: '973-273-6206',
    priority_groups: [],
    accessible: false,
    source: 'Newark Housing Authority',
    source_url: 'https://www.newarkha.org/',
    last_verified: VERIFIED,
  },
  {
    name: 'Spruce St. Senior Residences',
    address: null,
    city: 'Newark',
    program_type: 'LIHTC / Senior',
    ami_bands: [30, 50, 60],
    bedroom_types: ['Studio', '1BR'],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: ['senior'],
    accessible: true,
    source: 'Affordable Housing Hub',
    source_url:
      'https://affordablehousinghub.org/housing/new-jersey/essex-county/newark/spruce-st-sr-residences-23880-lihtc',
    last_verified: VERIFIED,
  },
  {
    name: 'Lincoln Avenue Apartments',
    address: null,
    city: 'Orange',
    program_type: 'LIHTC',
    ami_bands: [50, 60],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: [],
    accessible: false,
    source: 'Affordable Housing Hub',
    source_url:
      'https://affordablehousinghub.org/housing/new-jersey/essex-county/orange/lincoln-avenue-apartments-24068-lihtc',
    last_verified: VERIFIED,
  },
  {
    name: 'South Essex Court',
    address: null,
    city: 'Orange',
    program_type: 'LIHTC',
    ami_bands: [50, 60],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: [],
    accessible: false,
    source: 'Affordable Housing Hub',
    source_url:
      'https://affordablehousinghub.org/housing/new-jersey/essex-county/orange-city/south-essex-court-22621-lihtc',
    last_verified: VERIFIED,
  },
  {
    name: 'Tri-Corner Homes',
    address: null,
    city: 'Orange',
    program_type: 'LIHTC',
    ami_bands: [50, 60],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: [],
    accessible: false,
    source: 'Affordable Housing Hub',
    source_url:
      'https://affordablehousinghub.org/housing/new-jersey/essex-county/orange/litc06902-tri-corner-homes-22883-lihtc',
    last_verified: VERIFIED,
  },
  {
    name: 'Montclair Inn Senior Housing',
    address: null,
    city: 'Montclair',
    program_type: 'HUD Subsidized / Senior',
    ami_bands: [30, 50],
    bedroom_types: ['Studio', '1BR'],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: ['senior'],
    accessible: true,
    source: 'LowIncomeHousing.us',
    source_url: 'https://www.lowincomehousing.us/cty/nj-essex',
    last_verified: VERIFIED,
  },
  {
    name: 'Housing Choice Voucher & Public Housing',
    address: null,
    city: 'East Orange',
    program_type: 'Section 8 / Public Housing',
    ami_bands: [30, 50],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: [],
    accessible: false,
    source: 'Housing Authority of the City of East Orange',
    source_url: 'https://www.affordablehousing.com/housing-authority-essex-county-nj/',
    last_verified: VERIFIED,
  },
  {
    name: 'Housing Authority of the City of Orange Township',
    address: null,
    city: 'Orange',
    program_type: 'Section 8 / Public Housing',
    ami_bands: [30, 50],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: [],
    accessible: false,
    source: 'AffordableHousing.com',
    source_url: 'https://www.affordablehousing.com/housing-authority-essex-county-nj/',
    last_verified: VERIFIED,
  },
  {
    name: 'Irvington Housing Authority',
    address: null,
    city: 'Irvington',
    program_type: 'Section 8 / Public Housing',
    ami_bands: [30, 50],
    bedroom_types: [],
    rent: null,
    waitlist_open: false,
    application_link: null,
    phone: null,
    priority_groups: [],
    accessible: false,
    source: 'AffordableHousing.com',
    source_url: 'https://www.affordablehousing.com/housing-authority-essex-county-nj/',
    last_verified: VERIFIED,
  },
];
