import { config } from './config';
import { createRng, type Rng } from './rng';
import type { GameId, Player, Result, TurnRecord } from './types';

export interface PlayerSetup {
  name: string;
  avatar: string;
  color: string;
}

export interface Streak {
  result: 'WIN' | 'LOSS' | null;
  count: number;
}

/** Session state and memory. Pure: no rendering, no DOM. */
export class Session {
  readonly players: Player[];
  readonly records: TurnRecord[] = [];
  readonly rng: Rng;
  turnIndex = 0;

  constructor(
    setups: PlayerSetup[],
    readonly rounds: number = config.session.defaultRounds,
    seed?: number,
  ) {
    if (setups.length < config.players.min || setups.length > config.players.max) {
      throw new Error(`Player count must be ${config.players.min}–${config.players.max}`);
    }
    this.rng = createRng(seed);
    this.players = setups.map((s, i) => ({
      id: `p${i + 1}`,
      name: s.name,
      avatar: s.avatar,
      color: s.color,
      balance: config.startingBalance,
      bankruptcies: 0,
      daresCompleted: 0,
      dignity: 0,
      activeDare: null,
    }));
  }

  get round(): number {
    return Math.floor(this.turnIndex / this.players.length) + 1;
  }

  get currentPlayer(): Player {
    return this.players[this.turnIndex % this.players.length];
  }

  get isFinalRound(): boolean {
    return this.round === this.rounds;
  }

  get isFirstTurnOfRound(): boolean {
    return this.turnIndex % this.players.length === 0;
  }

  get isOver(): boolean {
    return this.turnIndex >= this.rounds * this.players.length;
  }

  advance(): void {
    this.turnIndex++;
  }

  /** Applies a settled bet and appends it to session memory. */
  settle(
    player: Player,
    turn: { gameId: GameId; variantId: string; stake: number; result: Result; delta: number; modified: boolean },
  ): TurnRecord {
    const allIn = turn.stake === player.balance;
    player.balance = Math.max(0, player.balance + turn.delta);
    if (turn.result === 'LOSS') player.activeDare = null;
    const record: TurnRecord = {
      turnIndex: this.turnIndex,
      round: this.round,
      playerId: player.id,
      allIn,
      balanceAfter: player.balance,
      ...turn,
    };
    this.records.push(record);
    return record;
  }

  /** Bankruptcy is a setback, not elimination: reset to the comeback balance. */
  bankrupt(player: Player): void {
    player.bankruptcies++;
    player.balance = config.bankruptcyResetBalance;
  }

  streak(playerId: string): Streak {
    const decided = this.records.filter((r) => r.playerId === playerId && r.result !== 'PUSH');
    const last = decided[decided.length - 1];
    if (!last) return { result: null, count: 0 };
    let count = 0;
    for (let i = decided.length - 1; i >= 0 && decided[i].result === last.result; i--) count++;
    return { result: last.result as 'WIN' | 'LOSS', count };
  }

  recentRecords(count: number): TurnRecord[] {
    return this.records.slice(-count);
  }

  lastRecordFor(playerId: string, gameId?: GameId): TurnRecord | undefined {
    for (let i = this.records.length - 1; i >= 0; i--) {
      const r = this.records[i];
      if (r.playerId === playerId && (!gameId || r.gameId === gameId)) return r;
    }
    return undefined;
  }

  /** Highest balance wins; ties broken by fewer bankruptcies. */
  standings(): Player[] {
    return [...this.players].sort((a, b) => b.balance - a.balance || a.bankruptcies - b.bankruptcies);
  }

  awards(): { title: string; text: string }[] {
    const out: { title: string; text: string }[] = [];
    const byId = new Map(this.players.map((p) => [p.id, p]));
    const bestWin = [...this.records].sort((a, b) => b.delta - a.delta)[0];
    if (bestWin && bestWin.delta > 0) {
      out.push({ title: 'Suspiciously Convenient Win', text: `${byId.get(bestWin.playerId)!.name}, +${bestWin.delta} in round ${bestWin.round}` });
    }
    const worstLoss = [...this.records].sort((a, b) => a.delta - b.delta)[0];
    if (worstLoss && worstLoss.delta < 0) {
      out.push({ title: 'Most Disappointing Loss in History', text: `${byId.get(worstLoss.playerId)!.name}, ${worstLoss.delta} in round ${worstLoss.round}` });
    }
    const mostBankrupt = [...this.players].sort((a, b) => b.bankruptcies - a.bankruptcies)[0];
    if (mostBankrupt.bankruptcies > 0) {
      out.push({ title: 'Duke of Financial Mismanagement', text: `${mostBankrupt.name}, ${mostBankrupt.bankruptcies} bankruptc${mostBankrupt.bankruptcies === 1 ? 'y' : 'ies'}` });
    }
    const allIns = this.records.filter((r) => r.allIn);
    if (allIns.length > 0) {
      const counts = new Map<string, number>();
      for (const r of allIns) counts.set(r.playerId, (counts.get(r.playerId) ?? 0) + 1);
      const [id, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      out.push({ title: 'Absolutely Certain', text: `${byId.get(id)!.name}, ${n} all-in bet${n === 1 ? '' : 's'}` });
    }
    return out;
  }
}
