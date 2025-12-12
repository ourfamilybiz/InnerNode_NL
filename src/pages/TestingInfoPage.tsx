// src/pages/TestingInfoPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type CollapsibleCardProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="bg-slate-950/70 border-slate-800">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <CardTitle className="text-sm text-slate-100">{title}</CardTitle>
          <span className="text-slate-400 text-sm select-none">
            {open ? "–" : "+"}
          </span>
        </button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-3 text-[13px] text-slate-200">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

const TestingInfoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-sm text-slate-100">
      {/* Title + intro */}
      <section>
        <h1 className="text-2xl font-semibold text-cyan-300 mb-1">
          InnerNode · Soft Launch Testing Guide
        </h1>
        <p className="text-xs text-slate-400">
          Thanks for helping test this early build of InnerNode. Use what you want,
          skip what you want — and tell us what feels confusing, off, or surprisingly helpful.
        </p>
      </section>

      {/* Welcome */}
      <CollapsibleCard title="Welcome (Start Here)" defaultOpen>
        <p>
          This is an early preview build — not everything is finished, and that’s intentional.
        </p>
        <p className="text-slate-300">
          InnerNode is shaped through <b>real use</b>, not perfect demos. Your honest experience —
          especially moments of confusion, friction, or surprise — helps guide what this becomes.
        </p>
        <p className="text-slate-300">You can’t break anything.</p>
      </CollapsibleCard>

      {/* What is InnerNode */}
      <CollapsibleCard title="What is InnerNode?">
        <p>
          InnerNode is a <span className="font-semibold">living reset space</span> for your mind
          and your life logistics. It’s built around three core tools:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-semibold">Companion</span> — a grounded AI presence that listens
            in plain language and offers practical, human-sounding next steps.
          </li>
          <li>
            <span className="font-semibold">Quick Reset / Equalizer</span> — a fast tool for
            interrupting impulsive reactions and helping you downshift before you hit “send,”
            “pull up,” or “blow up.”
          </li>
          <li>
            <span className="font-semibold">Smart Notes</span> — capture brain-dumps, ideas, and to-dos
            (by typing or speaking) that can later be turned into tasks, reminders, or reflections.
          </li>
        </ul>
        <p className="text-slate-300">
          During this test, we’re focused on how these tools feel in real use: clarity, tone,
          helpfulness, and reliability.
        </p>
      </CollapsibleCard>

      {/* What currently works */}
      <CollapsibleCard title="What’s Working in This Test Build">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 mb-1">
              ✅ Account, onboarding & shell
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sign up, log in, and log out with email + password.</li>
              <li>Basic onboarding flow (start, terms, tier select).</li>
              <li>
                Main app shell: sidebar navigation on desktop + top bar + mobile tab navigation.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-1">✅ InnerNode Companion</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You can type messages to the Companion and get{" "}
                <span className="font-semibold">real AI-generated responses</span>.
              </li>
              <li>
                The Companion is tuned to:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Reflect back what you said in simple language.</li>
                  <li>Stay grounded (not hypey or “therapy-jargony”).</li>
                  <li>Offer 1–3 realistic next steps instead of long lectures.</li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-1">✅ Quick Reset / Equalizer</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Describe a moment where you feel like you might{" "}
                <span className="italic">say it, send it, spend it, or show up</span> and regret it.
              </li>
              <li>
                The Equalizer returns a short reset reflection + tiny next actions to help you cool down
                or re-aim.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-1">✅ Smart Notes (with voice capture)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Type or <span className="font-semibold">speak a note using your device’s mic</span>{" "}
                (if supported by your browser).
              </li>
              <li>Notes save into a private table tied to your account.</li>
              <li>
                Voice capture is currently <span className="font-semibold">speech → text only</span>.
                Audio is not stored or replayable (yet).
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-1">⚠️ Early / placeholder areas</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lessons, Analytics, Games, and Focus Lanes are mostly shells/layout right now.</li>
              <li>Error handling is basic — if something “glitches,” that’s useful feedback.</li>
            </ul>
          </div>
        </div>
      </CollapsibleCard>

      {/* Testing missions */}
      <CollapsibleCard title="What Testers Should Try">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">1) Sign up & onboarding</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create a new account with your email.</li>
              <li>Confirm your email and make sure you can get back into the app.</li>
              <li>Note any blank pages, errors, or loops after confirmation/login.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">2) Companion check-ins</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Do a 3–5 message conversation with the Companion.</li>
              <li>
                Try:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>A practical stress (money, time, family, schedule).</li>
                  <li>An emotional knot (anger, shame, worry).</li>
                  <li>A simple “I’m okay, just checking in.”</li>
                </ul>
              </li>
              <li>
                Tell us: does it feel too generic, or does it feel like it “gets” what you meant?
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">3) Quick Reset moments</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Describe a real-life moment (or one you’ve had before) where you almost:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Sent a text/DM you’d regret</li>
                  <li>Pulled up on someone</li>
                  <li>Blew up at work or at home</li>
                </ul>
              </li>
              <li>Hit Reset and see how the Equalizer responds.</li>
              <li>Tell us: did it slow you down? Did it feel off? Did it miss something important?</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">4) Smart Notes with voice</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Try speaking a note with the mic.</li>
              <li>Save it, then check the Recent Notes list.</li>
              <li>Tell us if anything is duplicated, cut off, missing, or inaccurate.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">5) Play with navigation & layout</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the sidebar on desktop and the tabs on mobile.</li>
              <li>Note any pages that feel slow, broken, or hard to get back to.</li>
            </ul>
          </div>
        </div>
      </CollapsibleCard>

      {/* Personalization */}
      <CollapsibleCard title="Personalization & Get To Know You (Questionnaire)">
        <p>
          A key goal of InnerNode is that your Companion doesn’t stay generic.
          For this test, you can personalize quickly using <b>Get To Know You</b>.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          <li>Choose your preferred support style and tone</li>
          <li>Share what helps when you’re overwhelmed</li>
          <li>Tell InnerNode what to avoid</li>
          <li>Set a “pause reminder” (what matters most in the moment)</li>
        </ul>

        <div className="pt-2 flex flex-wrap gap-2">
          <Link
            to="/get-to-know-you"
            className="inline-flex items-center rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
          >
            Go to Get To Know You
          </Link>
          <Link
            to="/companion"
            className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:border-cyan-400"
          >
            Go to Companion
          </Link>
        </div>

        <p className="text-xs text-slate-500 pt-2">
          You can skip any question and update preferences later.
        </p>
      </CollapsibleCard>

      {/* Feedback instructions */}
      <CollapsibleCard title="How to Report Bugs, Ideas, or Confusing Moments">
        <p>
          When you notice something broken, weird, or really good, please send feedback with:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-slate-300">
          <li>Which page were you on? (Companion, Quick Reset, Smart Notes, Today, etc.)</li>
          <li>What were you trying to do?</li>
          <li>What actually happened? (Error message, blank screen, etc.)</li>
          <li>Optional: screenshot or copy/paste of error text</li>
        </ol>

        <p className="pt-2">
          Email:{" "}
          <span className="font-mono text-cyan-300">baggladyprofessional@gmail.com</span>{" "}
          <br />
          Subject: <span className="font-semibold">InnerNode Tester Feedback</span>
        </p>

        <p className="text-xs text-slate-500">
          You can also mention issues through the in-app Support section if that’s easier.
        </p>
      </CollapsibleCard>

      {/* Account + password reset note */}
      <CollapsibleCard title="Account Access, Email Confirmations & Passwords">
        <p>If you run into issues with sign-in, email confirmation, or password reset:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          <li>
            If you forget your password, use <span className="font-semibold">Forgot password</span>{" "}
            on the login screen (if available), or email us for help during this test.
          </li>
          <li>
            If you confirm your email and land on a strange or blank screen, try returning to the app
            link and logging in again.
          </li>
          <li>
            If you can’t get in, email a quick note with the time it happened and what you clicked last.
          </li>
        </ul>
        <p className="text-xs text-slate-500">
          Because this is a soft launch, account recovery may be semi-manual. Your feedback helps us smooth it out.
        </p>
      </CollapsibleCard>
    </div>
  );
};

export default TestingInfoPage;
