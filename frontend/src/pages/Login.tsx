import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useAuth } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <h2 className="text-2xl font-extrabold tracking-tight">Login</h2>
        <p className="mt-1 text-sm text-slate-600">
          Admin demo: <span className="font-semibold">admin@store.com</span> / <span className="font-semibold">Admin@123</span>
        </p>
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="font-semibold text-slate-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Sign in
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link to="/register" className="font-semibold text-slate-900 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

