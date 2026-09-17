/**
 * Turn a property page into a typed listing candidate with Claude.
 *
 * The model fills exactly the fields the eligibility engine and fit score use
 * (src/lib/eligibility.ts): ami_bands, bedroom_types, priority_groups, rent,
 * waitlist_open, accessible, program_type — plus a verdict on whether this is
 * an income-restricted rental in Essex County at all, and whether it's a
 * duplicate of a listing we already have. It is asked to be conservative: an
 * unknown field stays empty/null rather than guessed, matching the seed data
 * conventions in scripts/seed-listings.ts.
 */
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { AMI_BANDS } from '../incomeLimits';
import { BEDROOM_TOKENS, PRIORITY_GROUPS } from '../types';
import { ESSEX_MUNICIPALITIES, isIncomeBasedRent, normalizeMunicipality } from './essex';
import type { Candidate } from './sources';

export const MODEL = 'claude-opus-5';

const ExtractionSchema = z.object({
  is_income_restricted_rental: z
    .boolean()
    .describe('True only if this is rental housing with an income limit or subsidy (LIHTC, Section 8/PBV/RAD, public housing, COAH/affordable set-aside, senior affordable, supportive housing). False for market-rate, for-sale, shelters, nursing homes, or pages that are not about one property.'),
  city: z.string().describe('Municipality the property is in, exactly as one of the Essex County names given, or "" if it is not in Essex County or cannot be determined.'),
  name: z.string().describe('Property name as a person would say it, in normal title case (e.g. "Weequahic Park Apartments III", not "Weequahic Park Apts Iii").'),
  address: z.string().nullable().describe('Street address without city/state, or null.'),
  program_type: z.string().nullable().describe('Short program description, e.g. "LIHTC family", "Section 8 Project-Based (RAD), senior", "Public housing". Null if unknown.'),
  ami_bands: z.array(z.number()).describe(`Area-median-income bands served, subset of ${AMI_BANDS.join(', ')}. Infer from program type when the page does not say: public housing / HCV / PBV → [30, 50]; LIHTC family → [50, 60]; senior LIHTC → [30, 50, 60]; COAH/affordable set-aside → [50, 80]. Empty only if nothing can be inferred.`),
  bedroom_types: z.array(z.string()).describe(`Bedroom sizes offered, subset of ${BEDROOM_TOKENS.join(', ')} (4BR means 4+). Empty if the page does not say.`),
  rent: z.number().nullable().describe('A specific monthly rent in whole dollars if the page states one, else null. Never estimate.'),
  waitlist_open: z.boolean().describe('True only if the page clearly says the waitlist is open / now accepting applications. Default false.'),
  application_link: z.string().nullable().describe('URL where someone applies, if the page gives one that is not this page itself.'),
  phone: z.string().nullable().describe('Contact phone as written, or null.'),
  priority_groups: z.array(z.string()).describe(`Groups the program is for or prioritizes, subset of ${PRIORITY_GROUPS.join(', ')}. "senior" for 55+/62+ communities. Empty if none.`),
  accessible: z.boolean().describe('True if the page mentions accessible / ADA / mobility-impaired units.'),
  duplicate_of: z.string().nullable().describe('If this is the same property as one of the existing listings provided, that listing\'s exact name; otherwise null. Same address or same building under a slightly different name counts.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('How confident you are the fields above are right. "low" when most fields were inferred from the program type alone.'),
  evidence: z.string().describe('One or two short quotes from the page (under 200 characters total) supporting the program type and bedroom/priority fields.'),
  notes: z.string().describe('One or two sentences for a human reviewer: what this property is, anything uncertain, and why any field was left empty.'),
});

export type Extraction = z.infer<typeof ExtractionSchema>;

const SYSTEM = `You extract structured facts about affordable-housing properties for Home Reach, a free directory that helps Essex County, New Jersey households find income-restricted rentals. Real people act on this data, so be accurate and conservative: never guess a rent, a phone number, or an address; leave a field empty or null when the page does not support it. Do follow the stated inference rules for ami_bands and priority_groups, because those are program-level facts.

Directory pages often include county-wide reference tables (Fair Market Rent by bedroom size, HUD income limits by household size). Those are NOT this property's rent or its income bands — ignore them for rent, and use only the program type and property-specific text for ami_bands. A "waitlist open" statement counts only when it is about this property or the authority that manages its waitlist. For public housing and Section 8 / voucher programs, rent is a share of household income, so set rent to null even if the page shows an average or estimated figure.

Essex County municipalities: ${ESSEX_MUNICIPALITIES.join(', ')}.

Names and addresses of listings Home Reach already has in the same town are provided so you can flag duplicates.`;

export interface ExtractInput {
  candidate: Candidate;
  pageText: string;
  /** Existing listings in the candidate's town (or county-wide when town unknown). */
  existing: { name: string; address: string | null; city: string }[];
}

export interface ExtractResult {
  extraction: Extraction | null;
  /** Populated when the model refused or the output failed to parse. */
  error: string | null;
  usage: { input: number; output: number };
}

export async function extractListing(client: Anthropic, input: ExtractInput): Promise<ExtractResult> {
  const { candidate, pageText, existing } = input;
  const existingText = existing.length
    ? existing.map((e) => `- ${e.name}${e.address ? ` (${e.address})` : ''}, ${e.city}`).join('\n')
    : '(none)';

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Source: ${candidate.source}
Listed name on the index page: ${candidate.name}
Town per the index page: ${candidate.city ?? 'unknown — determine from the page'}
Page URL: ${candidate.source_url}

Existing Home Reach listings nearby:
${existingText}

Page text:
<page>
${pageText}
</page>`,
      },
    ],
    output_config: { format: zodOutputFormat(ExtractionSchema) },
  });

  const usage = { input: response.usage.input_tokens, output: response.usage.output_tokens };
  if (response.stop_reason === 'refusal') {
    return { extraction: null, error: `refused (${response.stop_details?.category ?? 'no category'})`, usage };
  }
  if (!response.parsed_output) {
    return { extraction: null, error: `unparseable output (stop_reason=${response.stop_reason})`, usage };
  }
  return { extraction: response.parsed_output, error: null, usage };
}

/** Coerce the model's loosely-typed arrays into the DB's allowed values. */
export function sanitize(x: Extraction) {
  const ami = x.ami_bands.filter((n): n is (typeof AMI_BANDS)[number] => (AMI_BANDS as readonly number[]).includes(n));
  const beds = x.bedroom_types.filter((b): b is (typeof BEDROOM_TOKENS)[number] => (BEDROOM_TOKENS as readonly string[]).includes(b));
  const groups = x.priority_groups
    .map((g) => g.toLowerCase())
    .filter((g): g is (typeof PRIORITY_GROUPS)[number] => (PRIORITY_GROUPS as readonly string[]).includes(g));
  return {
    city: normalizeMunicipality(x.city),
    ami_bands: [...new Set(ami)].sort((a, b) => a - b),
    bedroom_types: [...new Set(beds)],
    priority_groups: [...new Set(groups)],
    rent: x.rent != null && Number.isFinite(x.rent) && x.rent > 0 && !isIncomeBasedRent(x.program_type) ? Math.round(x.rent) : null,
  };
}
