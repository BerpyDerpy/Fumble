// The creator's hidden advantage (implementation plan §6.7). Independent of the Director and of
// every game's rules: its only hook is adjusting a distribution before the resolver samples it.
// Prototype: interface only, always inactive. Full behaviour lands in milestone M5.

import type { Distribution } from './types';

export interface ModifierContext {
  playerId: string;
  gameId: string;
  variantId: string;
}

export interface SecretModifier {
  /** Returns the distribution to sample. Return the same object to signal "no change". */
  adjust(dist: Distribution, ctx: ModifierContext): Distribution;
}

export const inactiveModifier: SecretModifier = {
  adjust: (dist) => dist,
};
