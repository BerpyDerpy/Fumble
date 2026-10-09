import { config } from './config';
import type { Result, Variant } from './types';

export function minBetFor(variant: Variant): number {
  return Math.max(config.betting.min, variant.minBet ?? 0);
}

export type BetCheck = { ok: true } | { ok: false; reason: string };

export function validateBet(balance: number, amount: number, variant: Variant): BetCheck {
  if (!Number.isInteger(amount)) return { ok: false, reason: 'Whole coins only. This is a respectable establishment.' };
  const min = minBetFor(variant);
  if (amount < min) return { ok: false, reason: `The minimum bet is ${min}.` };
  if (amount > balance) return { ok: false, reason: 'You cannot bet coins you do not have. Yet.' };
  return { ok: true };
}

/** Net balance change for a settled bet. */
export function payoutDelta(result: Result, stake: number, multiplier: number): number {
  switch (result) {
    case 'WIN':
      return stake * (multiplier - 1);
    case 'LOSS':
      return -stake;
    case 'PUSH':
      return 0;
  }
}
