import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";

export default function ResetPassword() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!token) return setErr("Reset token is missing. Please use the email link.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setErr("Passwords do not match.");

    setLoading(true);
    try {
      await api<{ ok: true }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      nav("/login");
    } catch (e: any) {
      setErr(e.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <h2 className="text-2xl font-extrabold tracking-tight">Reset password</h2>
        <p className="mt-1 text-sm text-slate-600">Set your new password.</p>
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Reset password"}
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
