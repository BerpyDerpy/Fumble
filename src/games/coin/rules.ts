import type { GameRules } from '../../core/types';

export type CoinFace = 'HEADS' | 'TAILS';

export interface CoinParams {
  /** Full rotations during the flip. */
  spins: number;
  /** Seconds in the air. */
  airTime: number;
  /** Over-serious mystic presentation (same odds). */
  mystic: boolean;
}

export interface CoinDetail {
  face: CoinFace;
}

const other = (face: CoinFace): CoinFace => (face === 'HEADS' ? 'TAILS' : 'HEADS');

export const coinRules: GameRules<CoinParams, null, CoinFace, CoinDetail> = {
  prepare: () => null,
  baseDistribution: () => ({ WIN: 0.5, LOSS: 0.5 }),
  materialize: (result, _variant, _prep, choice) => ({ face: result === 'WIN' ? choice : other(choice) }),
};
