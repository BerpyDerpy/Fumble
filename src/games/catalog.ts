// Game and variant definitions (data only, no rendering). The Director offers from this catalog.

import type { GameId, Variant } from '../core/types';
import type { CoinParams } from './coin/rules';
import type { DiceParams } from './dice/rules';
import type { ShellParams } from './shell/rules';

export interface GameInfo {
  id: GameId;
  name: string;
  icon: string;
}

export const GAMES: Record<GameId, GameInfo> = {
  coin: { id: 'coin', name: 'Coin Prediction', icon: '🪙' },
  dice: { id: 'dice', name: 'Dice: Over/Under', icon: '🎲' },
  shell: { id: 'shell', name: 'The Shell Game', icon: '🥤' },
};

export const GAME_ORDER: GameId[] = ['coin', 'dice', 'shell'];

const coin = (v: Omit<Variant<CoinParams>, 'gameId' | 'resolution' | 'baseWinProbability'>): Variant<CoinParams> => ({
  gameId: 'coin',
  resolution: 'DEFERRED',
  baseWinProbability: 0.5,
  ...v,
});

const dice = (v: Omit<Variant<DiceParams>, 'gameId' | 'resolution'>): Variant<DiceParams> => ({
  gameId: 'dice',
  resolution: 'DEFERRED',
  ...v,
});

const shell = (v: Omit<Variant<ShellParams>, 'gameId'>): Variant<ShellParams> => ({ gameId: 'shell', ...v });

export const VARIANTS: Variant[] = [
  coin({
    id: 'coin.classic',
    name: 'Classic Flip',
    flavor: 'Heads or tails. Two options. One of them is correct. The dealer knows which.',
    params: { spins: 6, airTime: 1.4, mystic: false },
    payoutMultiplier: 2,
    weight: 3,
  }),
  coin({
    id: 'coin.slowmo',
    name: 'Slow Motion',
    flavor: 'The same flip, but long enough to regret your call several times.',
    params: { spins: 11, airTime: 3.6, mystic: false },
    payoutMultiplier: 2,
    weight: 2,
  }),
  coin({
    id: 'coin.universe',
    name: 'The Universe Is Thinking',
    flavor: 'A deeply spiritual 50/50. Please do not interrupt the universe.',
    params: { spins: 4, airTime: 4.2, mystic: true },
    payoutMultiplier: 2,
    weight: 1,
  }),
  dice({
    id: 'dice.classic',
    name: 'Over/Under 7',
    flavor: 'Call over or under seven. A seven belongs to the house, who graciously returns your bet.',
    params: { size: 0.5, luckySeven: false },
    payoutMultiplier: 2,
    baseWinProbability: 15 / 36,
    weight: 3,
  }),
  dice({
    id: 'dice.big',
    name: 'Big Dice',
    flavor: 'Same rules. Larger dice. The casino believes this improves your odds.',
    params: { size: 0.85, luckySeven: false },
    payoutMultiplier: 2,
    baseWinProbability: 15 / 36,
    weight: 2,
  }),
  dice({
    id: 'dice.lucky7',
    name: 'Lucky Seven',
    flavor: 'Roll exactly seven. Pays 5×, which the manager insists is extremely generous.',
    params: { size: 0.5, luckySeven: true },
    payoutMultiplier: 5,
    baseWinProbability: 6 / 36,
    weight: 1,
  }),
  shell({
    id: 'shell.warmup',
    name: 'Warm-up',
    flavor: 'Three cups. Slow hands. An honest shuffle, if you can believe it.',
    params: { cups: 3, swaps: 6, startDuration: 0.75, endDuration: 0.6, fakeChance: 0 },
    resolution: 'COMMITTED',
    payoutMultiplier: 2,
    baseWinProbability: 1 / 3,
    weight: 3,
  }),
  shell({
    id: 'shell.pro',
    name: 'Professional',
    flavor: 'Four cups, faster hands, and the occasional change of heart.',
    params: { cups: 4, swaps: 12, startDuration: 0.42, endDuration: 0.28, fakeChance: 0.2 },
    resolution: 'DEFERRED',
    payoutMultiplier: 3,
    baseWinProbability: 1 / 4,
    weight: 2,
  }),
  shell({
    id: 'shell.impossible',
    name: 'Impossible Shuffle',
    flavor: 'Five cups. It starts reasonable. It does not stay reasonable.',
    params: { cups: 5, swaps: 24, startDuration: 0.5, endDuration: 0.11, fakeChance: 0.1 },
    resolution: 'DEFERRED',
    payoutMultiplier: 4,
    baseWinProbability: 1 / 5,
    weight: 1,
  }),
];

export const variantsFor = (gameId: GameId): Variant[] => VARIANTS.filter((v) => v.gameId === gameId);
