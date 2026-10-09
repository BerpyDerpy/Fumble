import { inactiveModifier, type ModifierContext, type SecretModifier } from './secretModifier';
import { weightedPick, type Rng } from './rng';
import type { GameRules, Outcome, Variant } from './types';

/**
 * Selects the actual outcome. Presentation never decides results: the view receives this Outcome
 * and animates it.
 */
export function resolveOutcome<P, Prep, Choice, Detail>(
  rules: GameRules<P, Prep, Choice, Detail>,
  variant: Variant<P>,
  prep: Prep,
  choice: Choice,
  rng: Rng,
  ctx: ModifierContext,
  modifier: SecretModifier = inactiveModifier,
): Outcome<Detail> {
  if (variant.resolution === 'COMMITTED' && rules.judge) {
    const { result, detail } = rules.judge(variant, prep, choice);
    return { result, detail, payoutMultiplier: variant.payoutMultiplier, modified: false };
  }
  const base = rules.baseDistribution(variant, prep, choice);
  const dist = modifier.adjust(base, ctx);
  const result = weightedPick(dist, rng);
  return {
    result,
    detail: rules.materialize(result, variant, prep, choice, rng),
    payoutMultiplier: variant.payoutMultiplier,
    modified: dist !== base,
  };
}
