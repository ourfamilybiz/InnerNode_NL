import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

type Prefs = {
  user_id: string;
  preferred_name: string | null;
  pronouns: string | null;
  tone_preference: string | null;
  support_style: string | null;
  stress_lanes: string[] | null;
  avoidances: string[] | null;
  avoidances_custom: string | null;
  reminder_style: string | null;
  motivation_line: string | null;
  onboarding_completed: boolean | null;
};

const PRONOUNS = ["she/her", "he/him", "they/them", "prefer not to say", "custom"] as const;
const TONES = ["grounded mentor", "soft friend", "no-nonsense coach", "faith-forward", "minimal"] as const;
const SUPPORT = ["ask me questions", "give me steps", "validate then steps", "short + direct", "reflective journaling"] as const;
const LANES = ["work", "money", "relationships", "health", "parenting/family", "identity/confidence", "grief/loss", "school", "other"] as const;
const AVOIDS = ["no religion", "no tough love", "no emojis", "no long responses", "don’t call me ‘bestie’", "don’t mention therapy"] as const;
const REMINDERS = ["gentle nudge", "firm nudge", "only if I ask", "daily check-in"] as const;

export default function PreferencesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [preferredName, setPreferredName] = useState("");
  const [pronouns, setPronouns] = useState<string>("prefer not to say");
  const [pronounsCustom, setPronounsCustom] = useState("");
  const [tone, setTone] = useState<string>("grounded mentor");
  const [supportStyle, setSupportStyle] = useState<string>("validate then steps");
  const [stressLanes, setStressLanes] = useState<string[]>([]);
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [avoidancesCustom, setAvoidancesCustom] = useState("");
  const [reminderStyle, setReminderStyle] = useState<string>("gentle nudge");
  const [motivationLine, setMotivationLine] = useState("");

  const resolvedPronouns = useMemo(() => {
    return pronouns === "custom" ? (pronounsCustom.trim() || "custom") : pronouns;
  }, [pronouns, pronounsCustom]);

  const toggleArrayValue = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setErr(null);
      setOk(null);

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[Prefs] load error:", error);
        setErr("Could not load preferences.");
        setLoading(false);
        return;
      }

      const prefs = data as Prefs | null;

      if (prefs) {
        setPreferredName(prefs.preferred_name ?? "");
        setPronouns(prefs.pronouns && PRONOUNS.includes(prefs.pronouns as any) ? prefs.pronouns : "custom");
        setPronounsCustom(prefs.pronouns && !PRONOUNS.includes(prefs.pronouns as any) ? prefs.pronouns : "");
        setTone(prefs.tone_preference ?? "grounded mentor");
        setSupportStyle(prefs.support_style ?? "validate then steps");
        setStressLanes(prefs.stress_lanes ?? []);
        setAvoidances(prefs.avoidances ?? []);
        setAvoidancesCustom(prefs.avoidances_custom ?? "");
        setReminderStyle(prefs.reminder_style ?? "gentle nudge");
        setMotivationLine(prefs.motivation_line ?? "");
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setErr(null);
    setOk(null);

    const payload = {
      user_id: user.id,
      preferred_name: preferredName.trim() || null,
      pronouns: resolvedPronouns || null,
      tone_preference: tone || null,
      support_style: supportStyle || null,
      stress_lanes: stressLanes,
      avoidances,
      avoidances_custom: avoidancesCustom.trim() || null,
      reminder_style: reminderStyle || null,
      motivation_line: motivationLine.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_preferences").upsert(payload, {
      onConflict: "user_id",
    });

    if (error) {
      console.error("[Prefs] save error:", error);
      setErr(error.message || "Could not save preferences.");
      setSaving(false);
      return;
    }

    setOk("Saved. You can update this anytime.");
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-lg font-semibold text-slate-100">Preferences</h1>
        <p className="text-sm text-slate-400 mt-2">Please sign in first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <header className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-semibold text-cyan-200">Preferences</h1>
        <p className="text-xs text-slate-400">
          You can update this anytime. This is what helps your Companion feel personal (without re-asking everything).
        </p>
      </header>

      {err && (
        <div className="rounded-xl border border-rose-500/60 bg-rose-950/40 px-3 py-2 text-[12px] text-rose-100">
          {err}
        </div>
      )}
      {ok && (
        <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-[12px] text-emerald-100">
          {ok}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400">Preferred name / nickname</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g., Shawn, GG, Jerzo…"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Pronouns</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
              >
                {PRONOUNS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {pronouns === "custom" && (
                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={pronounsCustom}
                  onChange={(e) => setPronounsCustom(e.target.value)}
                  placeholder="Type your pronouns…"
                />
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400">Companion tone</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">When I’m stressed, help me by…</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={supportStyle}
                onChange={(e) => setSupportStyle(e.target.value)}
              >
                {SUPPORT.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div>
              <div className="text-xs text-slate-400 mb-2">Biggest stress lanes right now</div>
              <div className="flex flex-wrap gap-2">
                {LANES.map((lane) => (
                  <button
                    key={lane}
                    type="button"
                    onClick={() => setStressLanes((prev) => toggleArrayValue(prev, lane))}
                    className={`rounded-full px-3 py-1 text-xs border ${
                      stressLanes.includes(lane)
                        ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200"
                        : "border-slate-700 bg-slate-950 text-slate-300"
                    }`}
                  >
                    {lane}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-2">Do not do / avoid</div>
              <div className="flex flex-wrap gap-2">
                {AVOIDS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvoidances((prev) => toggleArrayValue(prev, a))}
                    className={`rounded-full px-3 py-1 text-xs border ${
                      avoidances.includes(a)
                        ? "border-amber-400/60 bg-amber-500/10 text-amber-200"
                        : "border-slate-700 bg-slate-950 text-slate-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={avoidancesCustom}
                onChange={(e) => setAvoidancesCustom(e.target.value)}
                placeholder="Anything else to avoid? (optional)"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400">Reminder style</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={reminderStyle}
                onChange={(e) => setReminderStyle(e.target.value)}
              >
                {REMINDERS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">One line that motivates you</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={motivationLine}
                onChange={(e) => setMotivationLine(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm border border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400 hover:text-cyan-200 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
