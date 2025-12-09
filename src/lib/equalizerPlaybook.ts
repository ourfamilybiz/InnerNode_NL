// src/lib/equalizerPlaybook.ts

import { classifyEqualizerInput, TriggerClassification } from "./equalizerTriggers";

export type EqualizerTone =
  | "gentle"
  | "neutral"
  | "direct"
  | "mentor";

export type EqualizerInput = {
  text: string;
  /**
   * Coach style we eventually read from user_profiles.coach_style
   * e.g. 'gentle', 'direct', 'mentor', etc.
   */
  userTone?: EqualizerTone | null;
};

export type EqualizerResult = {
  mainResponse: string;
  microPrompt?: string;
  toneUsed: EqualizerTone;
  escalationSuggested: boolean;
  classification: TriggerClassification;
};

/**
 * Local, deterministic Equalizer logic.
 *
 * NOTE:
 *  - This does NOT call OpenAI yet.
 *  - Your other dev chat can later replace the inside of this function
 *    with a real LLM call that:
 *      • includes `classification`
 *      • includes user tone
 *      • follows the same tone governance rules.
 */
export async function runEqualizerPlaybook(
  input: EqualizerInput
): Promise<EqualizerResult> {
  const text = (input.text || "").trim();

  if (!text) {
    return {
      mainResponse:
        "Tell me what’s happening in this moment — even if it’s messy or you’re not sure how to explain it yet.",
      microPrompt: "Create space between impulse and action.",
      toneUsed: input.userTone || "gentle",
      escalationSuggested: false,
      classification: classifyEqualizerInput(""),
    };
  }

  const classification = classifyEqualizerInput(text);
  const userTone: EqualizerTone = input.userTone || "gentle";

  // Decide if we need the “firm mentor” override or stay in the user’s chosen tone.
  let toneUsed: EqualizerTone = userTone;
  let toneExplainer = "";

  if (classification.escalationLevel >= 2 && userTone !== "mentor") {
    // 🔁 Adaptive Firm Mentor Override (but with explanation) :contentReference[oaicite:2]{index=2}
    toneUsed = "mentor";
    toneExplainer =
      "I’m going to be a little more direct for a moment—not because you’re wrong, but because this moment matters and I want to help you protect yourself. Once we get through this spike, I’ll return to the tone you prefer.\n\n";
  }

  // Emergency-like content: we keep it very clear and safe.
  if (classification.escalationLevel === 3) {
    const mainResponse =
      toneExplainer +
      "From what you’ve shared, this sounds bigger than what InnerNode is designed to handle on its own.\n\n" +
      "If you are in immediate danger or thinking about seriously harming yourself or someone else, please contact emergency services or a local crisis line right now. " +
      "You don’t have to go through this alone, and real-time human help matters here.\n\n" +
      "You can still use InnerNode after you’re safe to unpack what led here and to build a different pattern going forward.";

    return {
      mainResponse,
      microPrompt: "Your safety comes before any decision or impulse.",
      toneUsed,
      escalationSuggested: true,
      classification,
    };
  }

  // Non-emergency: we can respond with a moment-level pause + reflection.
  const { emotionCluster, impulseType } = classification;

  const emotionLine = buildEmotionLine(emotionCluster);
  const impulseLine = buildImpulseLine(impulseType);
  const body = buildCoreBody(toneUsed);
  const microPrompt = buildMicroPrompt(classification);

  const mainResponse = `${toneExplainer}${emotionLine}${impulseLine}${body}`;

  const escalationSuggested = classification.escalationLevel >= 2;

  return {
    mainResponse,
    microPrompt,
    toneUsed,
    escalationSuggested,
    classification,
  };
}

// ----- helpers -----

function buildEmotionLine(cluster: TriggerClassification["emotionCluster"]): string {
  switch (cluster) {
    case "anger":
      return (
        "I can hear that something or someone has really pulled you out of character. " +
        "You’re not wrong for feeling this level of heat — the question is what you want this moment to turn into.\n\n"
      );
    case "fear":
      return (
        "It sounds like your nervous system is on high alert. " +
        "Fear is trying to protect you, but it doesn’t always tell the full truth about what has to happen next.\n\n"
      );
    case "overwhelm":
      return (
        "This feels like a lot coming at you at once. " +
        "Overwhelm is what happens when your system gets more inputs than it can process in one breath.\n\n"
      );
    case "sadness":
      return (
        "There’s a heaviness in what you’re sharing. " +
        "Sadness is valid — it just doesn’t have to make the decisions for you.\n\n"
      );
    case "shame":
      return (
        "I can hear some shame sitting underneath this. " +
        "Shame tries to make the whole story about you being ‘wrong’ instead of about what happened.\n\n"
      );
    case "numb":
      return (
        "Feeling numb or shut down is still a feeling — it’s your system trying to protect itself from too much.\n\n"
      );
    case "mixed":
      return (
        "It sounds like there are layered emotions here — some anger, some fear, maybe some sadness in the background. " +
        "We don’t have to untangle them all at once to take a better next step.\n\n"
      );
    case "low_intensity":
      return (
        "Even if this doesn’t feel like a huge crisis, it still matters that you paused here instead of acting on autopilot.\n\n"
      );
    case "unknown":
    default:
      return (
        "Thank you for trusting yourself enough to pause here instead of just doing the first thing that came to mind.\n\n"
      );
  }
}

function buildImpulseLine(impulse: ImpulseType): string {
  switch (impulse) {
    case "say":
      return (
        "Right now the impulse seems to be about what to say or how to go off. " +
        "Words can’t be unsent once they land, so let’s slow this just enough to protect your future self.\n\n"
      );
    case "send":
      return (
        "You’re close to hitting send or posting something. " +
        "Screens make it feel small, but the impact can be big. Let’s treat this like a real-world move, not just a button.\n\n"
      );
    case "spend":
      return (
        "I’m hearing a pull toward spending or a big money move. " +
        "Money decisions made in a spike often feel different once your nervous system is quieter.\n\n"
      );
    case "show_up":
      return (
        "There’s an urge to physically show up, drive over, or pull up. " +
        "Showing up in a spike can change stories in ways that are hard to undo later.\n\n"
      );
    case "self_harm":
    case "harm_other":
    case "legal_risk":
    case "sexual_risk":
      // Level 3 cases are handled earlier; this is just a soft backup.
      return (
        "The action you’re considering touches your safety, your body, or your future in a serious way. " +
        "That alone makes this pause incredibly important.\n\n"
      );
    case "unknown":
    case null:
    default:
      return "";
  }
}

function buildCoreBody(tone: EqualizerTone): string {
  const base =
    "For the next few breaths, nothing needs to happen yet. " +
    "We’re just building a little space between how you feel and what you do.\n\n";

  const gentle =
    "Let’s try something small:\n" +
    "• Take one slow inhale through your nose for a count of 4.\n" +
    "• Hold for 2.\n" +
    "• Exhale slowly for a count of 6.\n\n" +
    "Now, if you imagine your future self a few hours or days from now, what would they be most grateful you did or did NOT do in this moment?\n\n";

  const neutral =
    "You can jot a quick sentence right after this: “If I act on this impulse, what do I gain, and what do I put at risk?”\n\n" +
    "We’re not forcing you toward a ‘good’ choice — we’re helping you make a clearer one.\n\n";

  const direct =
    "This is one of those moments where a 5-minute pause can save you 5 months of fallout.\n\n" +
    "Before you move, ask yourself: “If this plays out the way my worst-case fear imagines, is that a risk I can live with?”\n\n";

  const mentor =
    "Right now, your power is not in the next move — it’s in your ability to NOT make the move while you’re flooded.\n\n" +
    "Let’s treat this like a rep: you just practiced a pause. That’s a skill that changes whole storylines when you keep using it.\n\n";

  switch (tone) {
    case "gentle":
      return base + gentle;
    case "neutral":
      return base + neutral;
    case "direct":
      return base + direct;
    case "mentor":
      return base + mentor;
    default:
      return base + gentle;
  }
}

function buildMicroPrompt(classification: TriggerClassification): string {
  if (classification.escalationLevel >= 2) {
    return "Slow the moment before it decides for you.";
  }
  switch (classification.emotionCluster) {
    case "anger":
      return "Nothing needs to happen in the next 60 seconds. Let’s cool your nervous system first.";
    case "overwhelm":
      return "Create space between impulse and action.";
    case "fear":
      return "You don’t have to act on a feeling to respect it.";
    default:
      return "This is your pause. You don’t need to decide yet.";
  }
}


