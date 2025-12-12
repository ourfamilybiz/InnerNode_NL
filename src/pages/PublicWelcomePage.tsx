import { Link } from "react-router-dom";

export default function PublicWelcomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-3xl font-semibold text-cyan-300">
          Welcome to InnerNode (Tester Preview)
        </h1>

        <p className="text-slate-300 text-sm">
          InnerNode is an early-stage mental reset & decision support app.
          This version is for <b>real testing</b>, not perfection.
        </p>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            How to Navigate (Important)
          </h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            <li><b>Mobile:</b> use the tabs at the bottom/top to move around</li>
            <li><b>Desktop:</b> use the sidebar on the left</li>
            <li><b>Companion:</b> talk things through</li>
            <li><b>Quick Reset:</b> calm impulsive moments</li>
            <li><b>Testing Info:</b> tells you what to try + how to give feedback</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            to="/auth/signup"
            className="flex-1 text-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Create account
          </Link>
          <Link
            to="/auth/login"
            className="flex-1 text-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200"
          >
            Log in
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          You can send feedback anytime using the in-app feedback button.
        </p>
      </div>
    </div>
  );
}
