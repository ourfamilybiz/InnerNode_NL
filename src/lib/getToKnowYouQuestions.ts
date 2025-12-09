// src/lib/getToKnowYouQuestions.ts

// Slug used when saving this questionnaire in Supabase
export const GET_TO_KNOW_YOU_SLUG = "get_to_know_you_v1";

// High-level categories for the “Let InnerNode get to know you” flow
export type QuestionCategory =
  | "foundation"
  | "stress"
  | "relationships"
  | "goals";

// Single question shape
export type Question = {
  id: string;
  category: QuestionCategory;
  prompt: string;
  helper?: string;
  minChars?: number;
};

// Core list of questions for v1
const getToKnowYouQuestions: Question[] = [
  {
    id: "foundation-1",
    category: "foundation",
    prompt: "When you think about your best self, what words come to mind?",
    helper:
      "You can list traits, moments you’re proud of, or how you’d like people to describe you.",
    minChars: 40,
  },
  {
    id: "foundation-2",
    category: "foundation",
    prompt:
      "What are three parts of your life you’d love InnerNode to help you balance?",
    helper:
      "For example: work, parenting, health, money, creativity, faith, etc.",
    minChars: 40,
  },
  {
    id: "stress-1",
    category: "stress",
    prompt: "What usually stresses you out the fastest during a normal week?",
    helper:
      "Think about patterns: certain people, traffic, money conversations, social media, etc.",
    minChars: 40,
  },
  {
    id: "stress-2",
    category: "stress",
    prompt:
      "When you feel yourself about to react in a way you might regret, what does that moment look like?",
    helper:
      "Describe the situation, your body sensations, and what you usually do next.",
    minChars: 50,
  },
  {
    id: "relationships-1",
    category: "relationships",
    prompt:
      "Who are the people you most want to protect your peace and progress for?",
    helper:
      "These can be children, partners, family, friends, or even your future self.",
    minChars: 40,
  },
  {
    id: "relationships-2",
    category: "relationships",
    prompt:
      "Is there a relationship or type of person that often pulls you out of character?",
    helper:
      "You don’t have to name them directly—just describe the pattern so InnerNode can watch for it.",
    minChars: 50,
  },
  {
    id: "goals-1",
    category: "goals",
    prompt:
      "If InnerNode could quietly help you move one area of life forward over the next 90 days, what would it be?",
    helper:
      "Example: getting out of survival mode, building savings, staying consistent with a habit, healing from something, etc.",
    minChars: 50,
  },
  {
    id: "goals-2",
    category: "goals",
    prompt:
      "What is one small promise you want to start keeping to yourself, starting this week?",
    helper:
      "Keep it realistic and compassionate—no perfection needed, just something you’re willing to show up for.",
    minChars: 40,
  },
];

// This is what GetToKnowYouPage.tsx imports
export const QUESTIONS = getToKnowYouQuestions;

