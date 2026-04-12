import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useAuth } from "../lib/auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("admin@store.com");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      // `user` state updates async; just redirect to admin, guard will handle.
      nav("/admin");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    }
  }

  if (user?.role === "admin") {
    nav("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <h2 className="text-2xl font-extrabold tracking-tight">Admin Login</h2>
        <p className="mt-1 text-sm text-slate-600">Login as admin to add medicines/offers and view reports.</p>
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input className="rounded-xl border px-4 py-3" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded-xl border px-4 py-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Sign in</button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          Not an admin?{" "}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Customer login
          </Link>
        </div>
      </Card>
    </div>
  );
}

