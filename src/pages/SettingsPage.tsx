// src/pages/SettingsPage.tsx
import React from "react";
import { useUserProfile } from "../hooks/useUserProfile";

const SettingsPage: React.FC = () => {
  const { profile } = useUserProfile();

  const rawTier = profile?.plan_tier?.toLowerCase() ?? "free";
  const tierLabel =
    rawTier === "pro"
      ? "Pro"
      : rawTier === "plus"
      ? "Plus"
      : rawTier === "free"
      ? "Free"
      : "Preview";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <header className="space-y-1 border-b border-slate-800 pb-3">
        <h1 className="text-xl font-semibold text-slate-100">
          Settings &amp; Soft Launch Info
        </h1>
        <p className="text-sm text-slate-400">
          See what InnerNode can do right now, what&apos;s coming next, and how
          to share feedback during this preview.
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Current plan: <span className="text-cyan-300">{tierLabel}</span>
        </p>
      </header>

      {/* Section: What InnerNode is (short story) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          What InnerNode is trying to be
        </h2>
        <p className="text-xs text-slate-300">
          InnerNode is a real-life reset space. It&apos;s built for people who
          carry a lot, feel pulled in many directions, and need something
          smarter than just another &quot;self-care&quot; app. The goal is to
          help you pause, think, and choose differently in the moments that
          would normally knock you off track.
        </p>
        <p className="text-xs text-slate-300">
          This preview is focused on a few core flows: honest daily check-ins,
          a calm Companion that actually listens, an Equalizer for those
          3–30 second moments, and a quiet place for your logistics and brain
          games.
        </p>
      </section>

      {/* Section: What works right now */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          What&apos;s working in this preview
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
          <li>
            <span className="font-semibold text-cyan-200">Today page:</span>{" "}
            tier-based mood check-ins (with limits), honest journaling about
            how you&apos;re feeling, and a simple end-of-day snapshot.
          </li>
          <li>
            <span className="font-semibold text-cyan-200">
              InnerNode Companion:
            </span>{" "}
            text + voice conversation, with replies that try to feel human,
            not robotic. Daily limits depend on your plan.
          </li>
          <li>
            <span className="font-semibold text-cyan-200">Quick Reset:</span>{" "}
            an Equalizer flow for those &quot;I&apos;m about to do something I
            might regret&quot; moments. It listens, checks the level of risk,
            and responds in everyday language to help you slow down.
          </li>
          <li>
            <span className="font-semibold text-cyan-200">
              Get to Know You:
            </span>{" "}
            a short set of questions that helps InnerNode understand your
            patterns and priorities so future guidance can feel more tailored.
          </li>
          <li>
            <span className="font-semibold text-cyan-200">
              Life Logistics / Smart Notes:
            </span>{" "}
            a place to park practical notes, tasks, and &quot;don&apos;t forget
            this&quot; items so your brain doesn&apos;t have to hold
            everything.
          </li>
          <li>
            <span className="font-semibold text-cyan-200">
              InnerPlay · Brain Games:
            </span>{" "}
            a small playable example called &quot;Thought Detective&quot; that
            helps you spot thinking patterns, plus shells for future games.
          </li>
        </ul>
      </section>

      {/* Section: Under construction */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          Under construction / coming next
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
          <li>
            <span className="font-semibold">Lesson system:</span> tier-based
            learning paths (Core, Guided, Deep Work) that unlock as you go and
            can be recommended by Companion and Quick Reset.
          </li>
          <li>
            <span className="font-semibold">Focus Lanes:</span> modes like
            Spiritual, Professional, Personal, Money, or Healing, each with
            their own questions and support tools.
          </li>
          <li>
            <span className="font-semibold">Deeper analytics:</span> patterns
            over time for moods, Equalizer usage, lessons, and Companion
            themes—shown in plain language, not just charts.
          </li>
          <li>
            <span className="font-semibold">Avatar &amp; tone settings:</span>{" "}
            building out your Companion&apos;s look, vibe (gentle/direct/slick),
            and voice options.
          </li>
          <li>
            <span className="font-semibold">Stronger saving &amp; history:</span>{" "}
            daily assessments and more conversations saved into a long-term
            timeline once the schema is finalized.
          </li>
        </ul>
      </section>

      {/* Section: How testers can help */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          How you can help during testing
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
          <li>
            Use <span className="font-semibold">Today, Companion, Quick Reset</span>{" "}
            and <span className="font-semibold">Smart Notes</span> in your real
            life for a few days—don&apos;t role-play, just be honest.
          </li>
          <li>
            Notice where the app feels{" "}
            <span className="font-semibold">too robotic</span> or{" "}
            <span className="font-semibold">too generic</span>, and make a note
            of examples.
          </li>
          <li>
            Pay attention to whether{" "}
            <span className="font-semibold">Quick Reset</span> actually slows
            you down in heated moments or just feels like &quot;one more app.&quot;
          </li>
          <li>
            Share what{" "}
            <span className="font-semibold">gave you real relief or clarity</span>{" "}
            vs. what felt like filler.
          </li>
        </ul>
        <p className="text-[11px] text-slate-400 mt-2">
          For feedback, use the Support page or whatever channel your tester
          group is using. Honest, specific stories are more helpful than
          star-ratings.
        </p>
      </section>

      {/* Section: FAQ / Support stub */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          FAQ &amp; Support
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
          <li>
            <span className="font-semibold">Is this a finished app?</span>{" "}
            No—this is an early InnerNode preview. Some flows are solid, others
            are being shaped based on feedback.
          </li>
          <li>
            <span className="font-semibold">Will my data always be saved?</span>{" "}
            Not yet. Some things (like mood check-ins) are saved; others (like
            the end-of-day snapshot) are still local-only while we finalize the
            database structure.
          </li>
          <li>
            <span className="font-semibold">Who sees my data?</span> For this
            test build, data is for your account only. In the production system,
            InnerNode will be designed with strict privacy and clear options for
            what is stored vs. what is kept local.
          </li>
        </ul>
        <p className="text-[11px] text-slate-400 mt-2">
          If something breaks or feels unsafe, stop using that feature and let
          the team know so it can be fixed before wider release.
        </p>
      </section>
    </div>
  );
};

export default SettingsPage;
