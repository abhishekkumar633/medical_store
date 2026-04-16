import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api<{ ok: true }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <h2 className="text-2xl font-extrabold tracking-tight">Forgot password</h2>
        <p className="mt-1 text-sm text-slate-600">Enter your account email to receive a reset link.</p>
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        {sent ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            If this email exists, reset instructions have been sent.
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Back to{" "}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
