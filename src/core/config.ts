// Every tunable lives here. Values marked provisional in implementation_plan.md §3.

export const config = {
  players: { min: 2, max: 8 },
  startingBalance: 10,
  bankruptcyResetBalance: 10,
  betting: {
    min: 1,
    /** Default payout: a win returns stake × multiplier (net +stake at 2×). Variants may override. */
    payoutMultiplier: 2,
  },
  session: { defaultRounds: 8, roundOptions: [4, 6, 8, 10, 12] },
  director: {
    /** A variant played within this many turns (by anyone) is avoided when alternatives exist. */
    variantCooldownTurns: 2,
  },
  dares: { choices: 3, rerolls: 1, allowSkip: true },
  narration: {
    /** Chance the dealer speaks for each event tag. Tags not listed always speak. */
    speakChance: {
      turn_start: 0.45,
      offer: 0.25,
      bet_small: 0.35,
      win: 0.6,
      loss: 0.6,
      push: 0.9,
      coin_intro: 0.5,
      dice_intro: 0.5,
      shell_intro: 0.5,
    } as Record<string, number>,
    subtitleSeconds: 4,
  },
  secret: { enabled: false },
} as const;
