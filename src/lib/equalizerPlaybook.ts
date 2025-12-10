// src/lib/equalizerPlaybook.ts

import {
  classifyTriggers,
  type EmotionCluster,
  type EscalationLevel,
  type ImpulseType,
  type TriggerClassification,
} from "./equalizerTriggers";

/**
 * Which “lane” of the Equalizer we’re in.
 * This is for your own mental model + future analytics.
 */
export type EqualizerLane =
  | "grounding"
  | "decision_pause"
  | "conflict"
  | "money"
  | "work"
  | "relationship"
  | "safety_redirect"
  | "emergency_referral";

/**
 * Tone / persona for the opener line.
 */
export type EqualizerIntroTone = "soft" | "direct" | "mentor";

/**
 * A step the UI can render in sequence.
 */
export type EqualizerStep = {
  id: string;
  label: string;
  body: string;
  emphasis?: "calm" | "warning" | "normalize" | "plan";
};

/**
 * What the Equalizer gives back to the UI.
 * QuickResetPage.tsx expects this type name: EqualizerResult
 */
export type EqualizerResult = {
  lane: EqualizerLane;
  escalationLevel: EscalationLevel;
  emotionCluster: EmotionCluster;
  impulseType: ImpulseType;
  introTone: EqualizerIntroTone;
  introLine: string;
  steps: EqualizerStep[];
  // copy-ready strings the UI can show as small suggestions
  companionSuggestion: string;
  saveSuggestion: string;
};

/**
 * Main entry point used by QuickResetPage:
 *  - takes the raw user text
 *  - classifies it into emotion / impulse / escalation
 *  - returns a structured script the UI can render
 */
export function runEqualizerPlaybook(
  rawText: string
): EqualizerResult {
  const classification: TriggerClassification = classifyTriggers(rawText);
  const { emotionCluster, impulseType, escalationLevel } = classification;

  // Decide lane based on impulse + flags
  const lane: EqualizerLane = pickLane(classification);
  const introTone: EqualizerIntroTone = pickIntroTone(
    emotionCluster,
    escalationLevel
  );
  const introLine = buildIntroLine(lane, introTone);

  const steps = buildStepsForLane(lane, classification, rawText);

  const companionSuggestion =
    escalationLevel >= 2
      ? "When this settles a bit, tell your Companion what happened so InnerNode can remember this moment and help spot it earlier next time."
      : "If this still feels heavy after this reset, share the story with your Companion so we can keep it in your history.";

  const saveSuggestion =
    "You can paste the key parts of this into Smart Notes or your Companion so future-you can see how you handled it.";

  return {
    lane,
    escalationLevel,
    emotionCluster,
    impulseType,
    introTone,
    introLine,
    steps,
    companionSuggestion,
    saveSuggestion,
  };
}

/* ---------------------- Helpers ---------------------- */

function pickLane(c: TriggerClassification): EqualizerLane {
  const { impulseType, flags, emotionCluster } = c;

  if (c.escalationLevel === 3) {
    return "emergency_referral";
  }

  if (flags.moneyRisk) return "money";
  if (flags.workRisk) return "work";
  if (flags.relationshipRisk) return "relationship";

  if (impulseType === "show_up") return "conflict";
  if (impulseType === "send" || impulseType === "say") return "decision_pause";

  if (emotionCluster === "overwhelm" || emotionCluster === "numb") {
    return "grounding";
  }

  // Default: a general grounding/decision pause
  return "grounding";
}

function pickIntroTone(
  emotionCluster: EmotionCluster,
  escalationLevel: EscalationLevel
): EqualizerIntroTone {
  if (escalationLevel >= 3) return "direct";
  if (emotionCluster === "anger") return "direct";
  if (emotionCluster === "shame") return "soft";
  return "mentor";
}

function buildIntroLine(
  lane: EqualizerLane,
  tone: EqualizerIntroTone
): string {
  if (lane === "emergency_referral") {
    return "This sounds serious enough that I want to slow you down and point you toward real-world help.";
  }

  const base =
    tone === "soft"
      ? "First, breathe with me for a second. You’re allowed to pause before you choose your next move."
      : tone === "direct"
      ? "Hold up. Three seconds right here can change the next three years."
      : "Let’s zoom out for just a moment and see what’s really happening before you react.";

  if (lane === "money") {
    return (
      base +
      " This sounds like a money decision that future-you has to live with."
    );
  }
  if (lane === "work") {
    return base + " This feels work-heavy, and your livelihood matters.";
  }
  if (lane === "relationship") {
    return base + " This sounds like it touches your heart and your people.";
  }
  if (lane === "conflict") {
    return base + " I hear a lot of charged energy between you and someone else.";
  }

  return base;
}

function buildStepsForLane(
  lane: EqualizerLane,
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  if (lane === "emergency_referral") {
    return buildEmergencySteps(rawText);
  }

  switch (lane) {
    case "money":
      return buildMoneySteps(c, rawText);
    case "work":
      return buildWorkSteps(c, rawText);
    case "relationship":
      return buildRelationshipSteps(c, rawText);
    case "conflict":
      return buildConflictSteps(c, rawText);
    case "decision_pause":
      return buildDecisionPauseSteps(c, rawText);
    case "grounding":
    default:
      return buildGroundingSteps(c, rawText);
  }
}

/* ---------------- Lane-specific builders ---------------- */

function buildEmergencySteps(rawText: string): EqualizerStep[] {
  return [
    {
      id: "check-safety-now",
      label: "1. Check real-world safety first.",
      emphasis: "warning",
      body:
        "If you are in immediate danger, or someone else is, please stop reading this and call your local emergency number, crisis line, or someone you trust right now. This app is a support tool, not a replacement for emergency help.",
    },
    {
      id: "remove-tools",
      label: "2. Put time and distance between you and any tool for harm.",
      emphasis: "plan",
      body:
        "If there’s a weapon, pills, keys to a car, or anything you could use to hurt yourself or someone else, move away from it or ask someone to hold it. Even a few extra seconds of distance makes it harder to act on an impulse.",
    },
    {
      id: "reach-human",
      label: "3. Bring one safe human into the moment.",
      emphasis: "calm",
      body:
        "You don’t have to explain everything. A simple: “I’m not okay and I need you to stay with me” is enough. If you don’t have someone available, calling a crisis line or local helpline counts as bringing a human in.",
    },
  ];
}

function buildGroundingSteps(
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  return [
    {
      id: "body-check",
      label: "1. Do a quick body check.",
      emphasis: "calm",
      body:
        "Notice your jaw, shoulders, chest, and hands. See if you can soften each one by just 10%. No perfection — just loosening the grip a little.",
    },
    {
      id: "name-it",
      label: "2. Name what this moment feels like.",
      emphasis: "normalize",
      body:
        "You might say: “Right now I feel anxious and overloaded,” or “I feel blank and checked out.” Naming it doesn’t fix it, but it stops your brain from running on autopilot.",
    },
    {
      id: "tiny-next-step",
      label: "3. Choose a tiny, non-dramatic next step.",
      emphasis: "plan",
      body:
        "Instead of re-writing your whole life tonight, pick one small thing: drink water, step outside for 2 minutes, or message someone safe. Tiny steps keep you moving without burning you out.",
    },
  ];
}

function buildDecisionPauseSteps(
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  return [
    {
      id: "pause-before-send",
      label: "1. Put a literal pause between you and the button.",
      emphasis: "warning",
      body:
        "If this is about sending, posting, or calling, move your finger away from the button. You are not required to respond at the speed of your emotions.",
    },
    {
      id: "future-you",
      label: "2. Ask: “What would calm-but-honest me want here?”",
      emphasis: "plan",
      body:
        "Close your eyes and imagine you after a good night’s rest, having already handled this well. What would *that* version of you want to say or do? You don’t have to know perfectly — just aim closer to that version by 10–20%.",
    },
    {
      id: "draft-instead",
      label: "3. Turn this into a draft, not a decision.",
      emphasis: "normalize",
      body:
        "If you need to get the words out, write them in Smart Notes or to your Companion instead of the person. You can decide tomorrow what actually needs to be sent.",
    },
  ];
}

function buildConflictSteps(
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  return [
    {
      id: "space-and-distance",
      label: "1. Create space before contact.",
      emphasis: "warning",
      body:
        "If you’re tempted to pull up, confront, or “teach a lesson,” give yourself distance. Physical distance is emotional oxygen.",
    },
    {
      id: "what-matters",
      label: "2. Decide what actually matters here.",
      emphasis: "plan",
      body:
        "Ask yourself: “In three days, what will I care about — being right, being safe, or being at peace?” Let that answer guide how much energy this gets.",
    },
    {
      id: "safe-outlet",
      label: "3. Use a safe outlet first.",
      emphasis: "calm",
      body:
        "Vent to your Companion, a note, or someone you trust before you face the person. Raw emotion deserves a safe landing pad, not a stage.",
    },
  ];
}

function buildMoneySteps(
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  return [
    {
      id: "money-pause",
      label: "1. Turn this from “now” money into “tomorrow” money.",
      emphasis: "warning",
      body:
        "Unless this is rent, food, or safety, almost no purchase is truly emergency-level. Waiting 24 hours rarely costs you anything, but it often saves you a lot.",
    },
    {
      id: "check-reason",
      label: "2. Ask what you’re really trying to buy.",
      emphasis: "normalize",
      body:
        "Are you buying relief, status, comfort, distraction, or proof that you’re okay? Once you name that, you can decide if there’s a cheaper, kinder way to get it.",
    },
    {
      id: "tiny-yes",
      label: "3. Make a smaller “yes” if you still want to move.",
      emphasis: "plan",
      body:
        "Instead of the full amount or big leap, pick a test version: a smaller cart, a trial, or a delay. Money decisions feel better when they leave options open.",
    },
  ];
}

function buildWorkSteps(
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  return [
    {
      id: "no-quit-in-peak",
      label: "1. Don’t quit in the peak of the feeling.",
      emphasis: "warning",
      body:
        "You’re allowed to change jobs or set boundaries — just don’t let the worst 5 minutes decide the next 5 years.",
    },
    {
      id: "separate-person-from-system",
      label: "2. Separate the person from the whole system.",
      emphasis: "normalize",
      body:
        "One bad boss, client, or coworker is not the whole story of your skills or worth. Naming that keeps your power from shrinking to one moment.",
    },
    {
      id: "micro-plan",
      label: "3. Make a micro-plan, not a dramatic exit.",
      emphasis: "plan",
      body:
        "Write down one next step you can take in the next 7 days: update your resume, schedule a conversation, or document what’s happening. Tiny moves beat rage-quits.",
    },
  ];
}

function buildRelationshipSteps(
  c: TriggerClassification,
  rawText: string
): EqualizerStep[] {
  return [
    {
      id: "protect-self-first",
      label: "1. Protect your safety and dignity first.",
      emphasis: "warning",
      body:
        "If you feel unsafe physically or emotionally, your first job is distance and support — not fixing their feelings.",
    },
    {
      id: "name-pattern",
      label: "2. Name the pattern, not just the incident.",
      emphasis: "normalize",
      body:
        "Ask yourself: “Have I felt this exact way with them before?” If yes, this is about a cycle, not a single argument. That insight alone can change how you move.",
    },
    {
      id: "future-scene",
      label: "3. Picture the scene you’d be proud of later.",
      emphasis: "plan",
      body:
        "Imagine a future you telling this story saying, “Here’s how I chose myself *and* stayed in my character.” What does that version of you do next?",
    },
  ];
}


