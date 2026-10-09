import type { Rng } from '../../core/rng';
import type { GameRules } from '../../core/types';

export interface ShellParams {
  cups: number;
  swaps: number;
  /** Seconds per swap at the start and end of the shuffle (linear ramp). */
  startDuration: number;
  endDuration: number;
  /** Chance each move is a fake-out (cups start to swap, then return). */
  fakeChance: number;
}

export interface ShellMove {
  a: number;
  b: number;
  fake: boolean;
  duration: number;
}

export interface ShellPrep {
  /** Slot the coin is shown under before the shuffle. */
  startSlot: number;
  moves: ShellMove[];
  /** Where a perfect tracker would say the coin is. */
  trackedSlot: number;
}

export interface ShellDetail {
  /** Slot the coin is revealed under. */
  coinSlot: number;
}

export function generateShuffle(params: ShellParams, rng: Rng): ShellPrep {
  const startSlot = rng.int(params.cups);
  const moves: ShellMove[] = [];
  let tracked = startSlot;
  let lastPair = '';
  for (let i = 0; i < params.swaps; i++) {
    let a: number, b: number, key: string;
    do {
      a = rng.int(params.cups);
      b = rng.int(params.cups - 1);
      if (b >= a) b++;
      key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    } while (key === lastPair && params.cups > 2);
    lastPair = key;
    const progress = params.swaps > 1 ? i / (params.swaps - 1) : 0;
    const duration = params.startDuration + (params.endDuration - params.startDuration) * progress;
    const fake = i > 0 && i < params.swaps - 1 && rng.next() < params.fakeChance;
    moves.push({ a, b, fake, duration });
    if (!fake) {
      if (tracked === a) tracked = b;
      else if (tracked === b) tracked = a;
    }
  }
  return { startSlot, moves, trackedSlot: tracked };
}

export const shellRules: GameRules<ShellParams, ShellPrep, number, ShellDetail> = {
  prepare: (variant, rng) => generateShuffle(variant.params, rng),

  // DEFERRED: the winning cup is uniform among all cups, independent of the animation.
  baseDistribution: (variant) => {
    const n = variant.params.cups;
    return { WIN: 1 / n, LOSS: (n - 1) / n };
  },
  materialize: (result, variant, _prep, picked, rng) => {
    if (result === 'WIN') return { coinSlot: picked };
    const others = Array.from({ length: variant.params.cups }, (_, i) => i).filter((i) => i !== picked);
    return { coinSlot: rng.pick(others) };
  },

  // COMMITTED: the animation was truthful, so the coin is exactly where it was tracked.
  judge: (_variant, prep, picked) => ({
    result: picked === prep.trackedSlot ? 'WIN' : 'LOSS',
    detail: { coinSlot: prep.trackedSlot },
  }),
};
