// src/lib/lessonsCatalog.ts

// Simple tier type matching the rest of the app
export type PlanTier = "free" | "plus" | "pro" | "preview";

// High-level tracks for lessons (like phases)
export type LessonTrackId = "core" | "guided" | "deep_work";

export type LessonDomainCategory =
  | "personal"
  | "professional"
  | "spiritual"
  | "health"
  | "relationships"
  | "money"
  | "other";

export type LessonTrack = {
  id: LessonTrackId;
  label: string;
  description: string;
  // Minimum tier we *recommend* for this track (UI hint only for now)
  suggestedTier: PlanTier;
};

export type Lesson = {
  key: string; // unique
  title: string;
  subtitle: string;
  trackId: LessonTrackId;
  domain: LessonDomainCategory;
  minTier: PlanTier; // minimum tier allowed to access
  estMinutes: number;
  // For future Supabase integration:
  // which lesson(s) should be completed first
  requiresLessonKey?: string;
  // Short description of what the lesson actually *does* for the user
  purpose: string;
  // When to use or revisit this lesson
  whenToUse: string;
};

// Top-level tracks (phases)
export const LESSON_TRACKS: LessonTrack[] = [
  {
    id: "core",
    label: "Core · Stabilize & Notice",
    description:
      "Short lessons that help you build a basic reset routine: noticing your patterns, naming your feelings, and using simple tools you can remember when life gets loud.",
    suggestedTier: "free",
  },
  {
    id: "guided",
    label: "Guided · Rewire & Practice",
    description:
      "More structured lessons that walk you through mental and emotional tools step-by-step, with journaling prompts and InnerNode-style questions.",
    suggestedTier: "plus",
  },
  {
    id: "deep_work",
    label: "Deep Work · Rebuild & Redesign",
    description:
      "Longer-form work for when you’re ready to unpack old patterns, heal root issues, and redesign how you move through relationships, money, work, and faith.",
    suggestedTier: "pro",
  },
];

// NOTE: These are example lessons aligned with your InnerNode concept.
// Later, we can map these 1:1 to your Supabase lesson records.
export const LESSONS: Lesson[] = [
  // --- CORE TRACK (Free-friendly) ---
  {
    key: "core_01_body_check_in",
    title: "3–30 Body Check-In",
    subtitle: "A quick way to scan your body before you react.",
    trackId: "core",
    domain: "personal",
    minTier: "free",
    estMinutes: 7,
    purpose:
      "Teach your nervous system a simple habit: pause, scan your body, and name what’s happening before you move or speak.",
    whenToUse:
      "Anytime you feel your chest tightening, voice raising, or you know you’re about to say or do something on impulse.",
  },
  {
    key: "core_02_trigger_map",
    title: "Trigger Map: What Sets You Off Fast?",
    subtitle: "Spot the repeating patterns that pull you out of character.",
    trackId: "core",
    domain: "relationships",
    minTier: "free",
    estMinutes: 10,
    purpose:
      "Help you identify people, places, and situations that quickly flip your mood so InnerNode can watch for those patterns with you.",
    whenToUse:
      "Start this when you notice the same kind of argument, money fight, or stress spiral happening again and again.",
  },
  {
    key: "core_03_micro_promises",
    title: "Micro-Promises to Yourself",
    subtitle: "Smaller promises, more follow-through.",
    trackId: "core",
    domain: "personal",
    minTier: "free",
    estMinutes: 8,
    purpose:
      "Shift you from big, overwhelming goals to small, compassionate promises that are actually keepable.",
    whenToUse:
      "When you’re tired of breaking your own word to yourself and want to rebuild trust in small ways.",
  },

  // --- GUIDED TRACK (Plus & Pro) ---
  {
    key: "guided_01_thought_detective",
    title: "Thought Detective",
    subtitle: "Spot the thinking pattern behind the loud thought.",
    trackId: "guided",
    domain: "personal",
    minTier: "plus",
    estMinutes: 15,
    requiresLessonKey: "core_03_micro_promises",
    purpose:
      "Help you notice when your mind is doing all-or-nothing thinking, catastrophizing, or mind reading—so you can choose a calmer story.",
    whenToUse:
      "When a thought feels loud and heavy, and you’re starting to believe it fully without checking it.",
  },
  {
    key: "guided_02_stress_lanes",
    title: "Stress Lanes: Home, Work, Money",
    subtitle: "Separate your stress so it doesn’t all blend together.",
    trackId: "guided",
    domain: "professional",
    minTier: "plus",
    estMinutes: 18,
    purpose:
      "Untangle different areas of life so you can see where the real pressure is coming from—and what you can actually influence today.",
    whenToUse:
      "When everything feels like 'too much' and you can’t tell if it’s money, work, relationships, or all of the above.",
  },

  // --- DEEP WORK TRACK (Pro) ---
  {
    key: "deep_01_origin_story",
    title: "Your Origin Story Patterns",
    subtitle:
      "How your upbringing still shows up in your reactions today.",
    trackId: "deep_work",
    domain: "relationships",
    minTier: "pro",
    estMinutes: 30,
    requiresLessonKey: "guided_02_stress_lanes",
    purpose:
      "Connect your current triggers and survival habits to the environments that first trained you to respond that way.",
    whenToUse:
      "When you notice, 'I always do this,' especially in arguments, money decisions, or when you feel disrespected.",
  },
  {
    key: "deep_02_future_self_compass",
    title: "Future Self Compass",
    subtitle: "Let the future you help you pick today’s moves.",
    trackId: "deep_work",
    domain: "personal",
    minTier: "pro",
    estMinutes: 25,
    purpose:
      "Give you a quiet, structured way to ask: 'If my healed, stable, future self was sitting here, what would they want me to do?'",
    whenToUse:
      "When you’re at a crossroads—leaving a job, ending a relationship, starting over in any major area of life.",
  },
];

// Quick helpers
export function isLessonAllowedForTier(lesson: Lesson, tier: PlanTier): boolean {
  if (tier === "pro") return true;
  if (tier === "plus") {
    return lesson.minTier === "free" || lesson.minTier === "plus";
  }
  if (tier === "free") {
    return lesson.minTier === "free";
  }
  // preview = treat as free for now
  return lesson.minTier === "free";
}
