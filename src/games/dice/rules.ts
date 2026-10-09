import type { GameRules } from '../../core/types';

export type DiceCall = 'OVER' | 'UNDER' | 'SEVEN';

export interface DiceParams {
  /** Die edge length in scene units. */
  size: number;
  /** Lucky Seven: the only call is SEVEN. */
  luckySeven: boolean;
}

export interface DiceDetail {
  dice: [number, number];
}

const ALL_PAIRS: [number, number][] = [];
for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) ALL_PAIRS.push([a, b]);

type Category = 'OVER' | 'UNDER' | 'SEVEN';
const categoryOf = (sum: number): Category => (sum > 7 ? 'OVER' : sum < 7 ? 'UNDER' : 'SEVEN');

/**
 * Over/Under 7 with 2d6. A roll of exactly 7 is a push (stake returned). Lucky Seven bets on exactly 7.
 * Each of the 36 pairs is equally likely, so materializing uniformly within a category keeps sums honest.
 */
export const diceRules: GameRules<DiceParams, null, DiceCall, DiceDetail> = {
  prepare: () => null,
  baseDistribution: (_variant, _prep, call) => {
    if (call === 'SEVEN') return { WIN: 6 / 36, LOSS: 30 / 36 };
    return { WIN: 15 / 36, LOSS: 15 / 36, PUSH: 6 / 36 };
  },
  materialize: (result, _variant, _prep, call, rng) => {
    const matches = (sum: number) => {
      const cat = categoryOf(sum);
      if (call === 'SEVEN') return result === 'WIN' ? cat === 'SEVEN' : cat !== 'SEVEN';
      if (result === 'PUSH') return cat === 'SEVEN';
      if (result === 'WIN') return cat === call;
      return cat !== call && cat !== 'SEVEN';
    };
    const pool = ALL_PAIRS.filter(([a, b]) => matches(a + b));
    const [a, b] = rng.pick(pool);
    return { dice: [a, b] };
  },
};
