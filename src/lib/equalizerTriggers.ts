// src/lib/equalizerTriggers.ts

// Emotion “buckets” the Equalizer can lean on.
export type EmotionCluster =
  | "anger"
  | "fear"
  | "sadness"
  | "shame"
  | "overwhelm"
  | "numb"
  | "mixed"
  | "low_intensity"
  | "unknown";

// What the impulse is trying to do.
export type ImpulseType =
  | "say" // text, call, confrontation, send the message
  | "send" // hit post, email, DM, submit
  | "spend" // money, big purchases, gambling
  | "show_up" // go somewhere, pull up, confront in person
  | "self_harm"
  | "harm_other"
  | "sexual_risk"
  | "legal_risk"
  | "unknown"
  | null;

// Escalation ladder –
// 0 = low, 1 = medium, 2 = high (non-emergency), 3 = emergency flag.
export type EscalationLevel = 0 | 1 | 2 | 3;

export type TriggerClassification = {
  emotionCluster: EmotionCluster;
  impulseType: ImpulseType;
  escalationLevel: EscalationLevel;
  // small flags you can log / later use in analytics
  flags: {
    mentionsWeapon?: boolean;
    mentionsSelfHarm?: boolean;
    mentionsEmergencyWords?: boolean;
    moneyRisk?: boolean;
    relationshipRisk?: boolean;
    workRisk?: boolean;
  };
};

/**
 * Very simple, safe first-pass classifier.
 *
 * ❗ IMPORTANT:
 *  - This is just a placeholder so the Equalizer can start “thinking in lanes”.
 *  - The other dev chat can replace the heuristics with:
 *      - a JSON lookup table
 *      - more detailed trigger phrase mapping
 *      - or a lightweight ML / LLM call.
 */
export function classifyEqualizerInput(
  rawText: string
): TriggerClassification {
  const text = (rawText || "").toLowerCase();

  let emotionCluster: EmotionCluster = "unknown";
  let impulseType: ImpulseType = "unknown";
  let escalationLevel: EscalationLevel = 0;

  const flags: TriggerClassification["flags"] = {
    mentionsWeapon: false,
    mentionsSelfHarm: false,
    mentionsEmergencyWords: false,
    moneyRisk: false,
    relationshipRisk: false,
    workRisk: false,
  };

  // --- crude word scanning (safe defaults) ---

  // anger / conflict
  if (
    /mad|pissed|furious|rage|fight|scream|yell|explode|snap\b/.test(text)
  ) {
    emotionCluster = "anger";
  }

  // fear / anxiety / overwhelm
  if (
    /scared|afraid|anxious|anxiety|panic|overwhelmed|can't breathe|can’t breathe|on edge/.test(
      text
    )
  ) {
    emotionCluster = emotionCluster === "anger" ? "mixed" : "fear";
  }

  if (/overwhelmed|too much|can’t handle|can't handle|breaking down/.test(text)) {
    emotionCluster =
      emotionCluster === "anger" || emotionCluster === "fear"
        ? "mixed"
        : "overwhelm";
  }

  if (/numb|nothing|don’t feel|don't feel|empty/.test(text)) {
    emotionCluster = "numb";
  }

  if (/ashamed|embarrassed|humiliated|worthless|failure/.test(text)) {
    emotionCluster =
      emotionCluster === "unknown" ? "shame" : emotionCluster;
  }

  // impulses: say / send / spend / show up
  if (/text|send|post|dm|message|email|hit send|hit post/.test(text)) {
    impulseType = "send";
  }

  if (/call|tell them off|cuss them out|go off/.test(text)) {
    impulseType = impulseType === "send" ? "say" : impulseType || "say";
  }

  if (/buy|spend|gamble|bet|casino|swipe my card|max out/.test(text)) {
    impulseType = "spend";
    flags.moneyRisk = true;
  }

  if (/pull up|go over there|drive over|show up/.test(text)) {
    impulseType = "show_up";
  }

  // relationship / romantic
  if (
    /break up|leave them|cheat|affair|go home with|hook up/.test(text)
  ) {
    flags.relationshipRisk = true;
  }

  // work / professional
  if (/quit my job|walk out|cuss out my boss|email my boss/.test(text)) {
    flags.workRisk = true;
  }

  // weapons / violence / self-harm
  if (/gun|knife|weapon|shoot|stab/.test(text)) {
    flags.mentionsWeapon = true;
  }

  if (
    /kill myself|suicide|end it all|don't want to live|dont want to live|don't wanna live|dont wanna live|overdose/.test(
      text
    )
  ) {
    flags.mentionsSelfHarm = true;
  }

  if (/911|emergency|hospital|er|police/.test(text)) {
    flags.mentionsEmergencyWords = true;
  }

  // --- rough escalation logic --- //
  if (flags.mentionsSelfHarm || flags.mentionsWeapon) {
    escalationLevel = 3;
    impulseType =
      flags.mentionsSelfHarm ? "self_harm" : ("harm_other" as ImpulseType);
  } else if (flags.moneyRisk || flags.relationshipRisk || flags.workRisk) {
    escalationLevel = 2;
  } else if (emotionCluster === "anger" || emotionCluster === "overwhelm") {
    escalationLevel = 1;
  } else {
    escalationLevel = 0;
  }

  // default to something usable if absolutely nothing matched
  if (emotionCluster === "unknown" && rawText.trim().length > 0) {
    emotionCluster = "low_intensity";
  }

  return {
    emotionCluster,
    impulseType,
    escalationLevel,
    flags,
  };
}

