import { createHmac, timingSafeEqual } from 'node:crypto';

export type ReviewAction = 'approve' | 'reject';

/** Signed token for a one-click review link. Only whoever holds REVIEW_SECRET can mint one. */
export function reviewToken(secret: string, id: string, action: ReviewAction): string {
  return createHmac('sha256', secret).update(`${id}:${action}`).digest('hex');
}

export function verifyReviewToken(secret: string, id: string, action: ReviewAction, token: string): boolean {
  const expected = Buffer.from(reviewToken(secret, id, action));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
