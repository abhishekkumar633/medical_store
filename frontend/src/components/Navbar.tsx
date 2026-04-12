import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import MedStoreLogo from "./MedStoreLogo";
import { useAuth } from "../lib/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-xl text-sm font-semibold transition ${
    isActive
      ? "bg-gradient-to-r from-teal-600 via-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
      : "text-slate-700 hover:bg-white/80 hover:text-violet-800"
  }`;

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => {
    const n = user?.name?.trim() || "";
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || "U").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }, [user?.name]);

  return (
    <header className="sticky top-0 z-20 border-b border-teal-200/60 bg-gradient-to-r from-teal-50/95 via-white/95 to-fuchsia-50/95 backdrop-blur-md shadow-sm shadow-teal-500/5">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 rounded-2xl pr-2 py-0.5 hover:opacity-90 transition">
          <MedStoreLogo size={42} className="shrink-0 drop-shadow-md" />
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
            MedStore
          </span>
        </Link>

        <nav className="ml-2 flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/companies" className={navLinkClass}>
            Companies
          </NavLink>
          <NavLink to="/offers" className={navLinkClass}>
            Offers
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>
          {user ? (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          ) : null}
          {user?.role === "admin" ? (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-slate-500">...</span>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-teal-200/80 bg-white/90 px-3 py-2 hover:bg-white shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-600 to-violet-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm text-slate-700 font-medium">
                  {user.name} <span className="text-slate-400">({user.role})</span>
                </span>
              </button>

              {open ? (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-teal-100 bg-white shadow-xl shadow-violet-200/40 p-2"
                  onMouseLeave={() => setOpen(false)}
                >
                  <div className="px-3 py-2">
                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-xl text-sm font-medium ${isActive ? "bg-gradient-to-r from-teal-600 to-violet-600 text-white" : "hover:bg-teal-50"}`
                    }
                  >
                    My orders
                  </NavLink>
                  {user.role === "admin" ? (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-xl text-sm font-medium ${isActive ? "bg-gradient-to-r from-teal-600 to-violet-600 text-white" : "hover:bg-teal-50"}`
                      }
                    >
                      Admin dashboard
                    </NavLink>
                  ) : null}
                  <button
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                    className="mt-2 w-full px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-600 to-fuchsia-600 text-white hover:opacity-95 shadow-md"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link className="px-3 py-2 rounded-xl text-sm font-semibold text-violet-800 hover:bg-white/80" to="/login">
                User login
              </Link>
              <Link className="px-3 py-2 rounded-xl text-sm font-semibold text-violet-800 hover:bg-white/80" to="/admin/login">
                Admin login
              </Link>
              <Link
                className="px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-600 to-fuchsia-600 text-white shadow-md hover:opacity-95"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

