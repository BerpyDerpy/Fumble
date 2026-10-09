// Casino Director (prototype): picks which variant of each game is offered this turn.
// It never touches outcomes. Triggers, conditional games and rare events arrive in milestone M4.

import { config } from '../core/config';
import { minBetFor } from '../core/betting';
import { weightedItem, type Rng } from '../core/rng';
import type { Session } from '../core/session';
import type { Player, Variant } from '../core/types';
import { GAME_ORDER, variantsFor } from '../games/catalog';

export interface Offer {
  variant: Variant;
}

export function offerGames(session: Session, player: Player, rng: Rng): Offer[] {
  const recent = new Set(session.recentRecords(config.director.variantCooldownTurns).map((r) => r.variantId));
  const offers: Offer[] = [];
  for (const gameId of GAME_ORDER) {
    const affordable = variantsFor(gameId).filter((v) => minBetFor(v) <= player.balance);
    if (affordable.length === 0) continue;
    const lastForPlayer = session.lastRecordFor(player.id, gameId)?.variantId;
    const fresh = affordable.filter((v) => !recent.has(v.id) && v.id !== lastForPlayer);
    const pool = fresh.length > 0 ? fresh : affordable;
    offers.push({ variant: weightedItem(pool, (v) => v.weight, rng) });
  }
  return offers;
}
