import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useAuth } from "../lib/auth";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await register(name, email, password);
      nav("/");
    } catch (e: any) {
      setErr(e.message || "Register failed");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <h2 className="text-2xl font-extrabold tracking-tight">Create account</h2>
        {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded-xl border px-4 py-3"
            placeholder="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

