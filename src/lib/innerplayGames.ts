// src/lib/innerplayGames.ts

export type InnerPlayCategory =
  | "calm_reset"
  | "clarity_reflection"
  | "focus_memory"
  | "confidence";

export type InnerPlayTier = "free" | "plus" | "pro";

export type InnerPlayGame = {
  key: string;
  title: string;
  tagline: string;
  category: InnerPlayCategory;
  purpose: string;
  whenToUse: string;
  minTier: InnerPlayTier;
  hasPrototype: boolean; // true = we actually built a v1 flow
};

export const INNERPLAY_GAMES: InnerPlayGame[] = [
  {
    key: "thought_detective",
    title: "Thought Detective",
    tagline: "Catch thinking traps in 3 quick steps.",
    category: "clarity_reflection",
    purpose:
      "Helps you notice common thinking patterns that quietly fuel anxiety, anger, or shame.",
    whenToUse:
      "When your mind is spinning on a situation and you can’t tell if you’re overreacting or not.",
    minTier: "free",
    hasPrototype: true,
  },
  {
    key: "grounding_3_3_3",
    title: "3–3–3 Grounding Reset",
    tagline: "Use your senses to calm your nervous system.",
    category: "calm_reset",
    purpose:
      "Interrupts overthinking and brings you back into your body using a simple sensory scan.",
    whenToUse:
      "When you feel overwhelmed, anxious, or scattered and need a 60–90 second reset.",
    minTier: "free",
    hasPrototype: false, // we’ll build this one later
  },
  {
    key: "micro_focus_sprint",
    title: "Micro Focus Sprint",
    tagline: "Pick one tiny task and lock in for 90 seconds.",
    category: "focus_memory",
    purpose:
      "Gives you a tiny, winnable focus window so you can feel a quick win instead of staying stuck.",
    whenToUse:
      "When you keep procrastinating or bouncing between tasks and can’t get started.",
    minTier: "free",
    hasPrototype: false,
  },
  {
    key: "confidence_reframe",
    title: "Confidence Reframe",
    tagline: "Turn one harsh thought into a grounded truth.",
    category: "confidence",
    purpose:
      "Helps you soften self-criticism and anchor into a more balanced, truthful perspective.",
    whenToUse:
      "When you catch yourself saying things like “I always mess up” or “I’m not good enough.”",
    minTier: "plus",
    hasPrototype: false,
  },
];

// simple tier gating: higher tiers can see lower-tier games
export function isGameAllowedForTier(
  game: InnerPlayGame,
  rawTier: string | null
): boolean {
  const tier = (rawTier ?? "free").toLowerCase();

  if (tier === "pro") return true; // sees everything
  if (tier === "plus") {
    return game.minTier === "free" || game.minTier === "plus";
  }
  // default = free tier
  return game.minTier === "free";
}

// group games by category for the hub UI
export const INNERPLAY_SECTIONS: {
  id: InnerPlayCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "calm_reset",
    label: "Calm & Reset",
    description: "Short games that help you downshift, breathe, and de-escalate.",
  },
  {
    id: "clarity_reflection",
    label: "Clarity & Reflection",
    description:
      "Gentle mind games that help you see your patterns and stories more clearly.",
  },
  {
    id: "focus_memory",
    label: "Focus & Memory",
    description:
      "Light cognitive warm-ups to wake up your attention and recall.",
  },
  {
    id: "confidence",
    label: "Confidence & Self-Worth",
    description:
      "Micro-experiences that challenge harsh self-talk and build grounded confidence.",
  },
];
