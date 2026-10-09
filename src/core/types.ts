import type { Rng } from './rng';

export type Result = 'WIN' | 'LOSS' | 'PUSH';
export type Distribution = Partial<Record<Result, number>>;
export type GameId = 'coin' | 'dice' | 'shell';
export type ResolutionMode = 'COMMITTED' | 'DEFERRED';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  balance: number;
  bankruptcies: number;
  daresCompleted: number;
  /** Comic stat, display only. */
  dignity: number;
  /** A persistent dare shown on the nameplate until the player's next loss. */
  activeDare: string | null;
}

export interface Variant<P = unknown> {
  id: string;
  gameId: GameId;
  name: string;
  flavor: string;
  params: P;
  /** COMMITTED: result fixed before the animation (truthful). DEFERRED: resolved after the player's choice. */
  resolution: ResolutionMode;
  payoutMultiplier: number;
  /** Documented base win probability; verified by tests. */
  baseWinProbability: number;
  weight: number;
  minBet?: number;
}

export interface Outcome<Detail = unknown> {
  result: Result;
  detail: Detail;
  payoutMultiplier: number;
  /** True when the secret modifier changed the distribution. Never shown to players. */
  modified: boolean;
}

export interface TurnRecord {
  turnIndex: number;
  round: number;
  playerId: string;
  gameId: GameId;
  variantId: string;
  stake: number;
  allIn: boolean;
  result: Result;
  delta: number;
  balanceAfter: number;
  modified: boolean;
}

/** Pure game rules: no rendering. Presentation lives in the game's view. */
export interface GameRules<P, Prep, Choice, Detail> {
  /** Pre-play state the view may show (e.g. the shell shuffle). */
  prepare(variant: Variant<P>, rng: Rng): Prep;
  /** DEFERRED path: probability of each result given the player's choice. */
  baseDistribution(variant: Variant<P>, prep: Prep, choice: Choice): Distribution;
  /** DEFERRED path: concrete presentation data consistent with the sampled result. */
  materialize(result: Result, variant: Variant<P>, prep: Prep, choice: Choice, rng: Rng): Detail;
  /** COMMITTED path: result follows deterministically from the prepared state. */
  judge?(variant: Variant<P>, prep: Prep, choice: Choice): { result: Result; detail: Detail };
}
