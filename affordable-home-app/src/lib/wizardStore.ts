import type { BedroomToken, PriorityGroup, VoucherStatus, WizardAnswers } from './types';

/**
 * Single source of truth for wizard answers.
 *
 * Previously each step wrote its own sessionStorage key by hand, which led to
 * collisions (household size and bedrooms shared one key) and read/write name
 * mismatches (steps wrote `wizard_towns`, later code read `wizard_town`). This
 * module centralizes the schema so those bugs can't recur: there is exactly one
 * storage key holding one typed object.
 */

const STORAGE_KEY = 'homereach_wizard_v1';

const EMPTY: WizardAnswers = {
  householdSize: null,
  income: null,
  bedrooms: null,
  towns: [],
  voucher: null,
  priorityGroups: [],
  email: null,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

/** Read the full, validated answers object. Safe on the server (returns EMPTY). */
export function readAnswers(): WizardAnswers {
  if (!isBrowser()) return { ...EMPTY };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<WizardAnswers>;
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

/** Merge a partial update into stored answers. */
export function updateAnswers(patch: Partial<WizardAnswers>): WizardAnswers {
  const next = { ...readAnswers(), ...patch };
  if (isBrowser()) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full / disabled — answers just won't persist */
    }
  }
  return next;
}

/** Clear all wizard answers (e.g. on "retake"). */
export function clearAnswers(): void {
  if (isBrowser()) window.sessionStorage.removeItem(STORAGE_KEY);
}

// Convenience setters — keep call sites in the step components tiny and typed.
export const setHouseholdSize = (n: number) => updateAnswers({ householdSize: n });
export const setIncome = (income: number | null) => updateAnswers({ income });
export const setBedrooms = (bedrooms: BedroomToken) => updateAnswers({ bedrooms });
export const setTowns = (towns: string[]) => updateAnswers({ towns });
export const setVoucher = (voucher: VoucherStatus) => updateAnswers({ voucher });
export const setPriorityGroups = (priorityGroups: PriorityGroup[]) => updateAnswers({ priorityGroups });
export const setEmail = (email: string | null) => updateAnswers({ email });

/** Parse a free-text income string ("45,000", "$45k") into a number. */
export function parseIncome(input: string): number | null {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}
