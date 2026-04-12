import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import HorizontalRow from "../components/HorizontalRow";
import MedicineThumb from "../components/MedicineThumb";
import ProductCard from "../components/ProductCard";
import { api } from "../lib/api";
import type { Medicine } from "../lib/types";

export default function Home() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const q = sp.get("q") || "";
  const type = sp.get("type") || "";

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type);
    p.set("limit", "24");
    return p.toString();
  }, [q, type]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api<{ items: Medicine[] }>(`/api/medicines?${queryString}`);
        if (!cancelled) setItems(data.items || []);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  return (
    <div className="w-full">
      {/* full-width hero */}
      <div className="w-full border-b border-teal-200/50 bg-gradient-to-br from-teal-100/90 via-violet-50/80 to-fuchsia-100/70">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-teal-800/80">Trusted online pharmacy</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-800 via-violet-800 to-fuchsia-700 bg-clip-text text-transparent">
                Order medicines fast, safely, and with clear offers.
              </h1>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Search by medicine name and filter by type. New items from admin get colourful artwork automatically from the name.
              </p>
            </div>
            <Card>
              <div className="grid gap-3">
                <input
                  value={q}
                  onChange={(e) =>
                    setSp((prev) => {
                      prev.set("q", e.target.value);
                      return prev;
                    })
                  }
                  placeholder="Search medicine (e.g., Paracetamol)"
                  className="w-full rounded-xl border border-teal-200/60 bg-white/90 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400/40"
                />
                <div className="flex gap-2">
                  <select
                    value={type}
                    onChange={(e) =>
                      setSp((prev) => {
                        prev.set("type", e.target.value);
                        return prev;
                      })
                    }
                    className="flex-1 rounded-xl border border-violet-200/60 bg-white/90 px-4 py-3"
                  >
                    <option value="">All types</option>
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                    <option value="inhaler">Inhaler</option>
                    <option value="powder">Powder</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={() => setSp({})}
                    className="rounded-xl border border-fuchsia-200 bg-white/90 px-4 py-3 text-sm font-semibold text-fuchsia-900 hover:bg-fuchsia-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        {err ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{err}</div> : null}
        {loading ? <p className="mt-6 font-medium text-violet-600">Loading medicines…</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* keep grid for "all" view when searching */}
          {q.trim() || type ? (
            items.map((m) => (
              <Link key={m._id} to={`/medicines/${m._id}`} className="group block">
                <div className="h-full overflow-hidden rounded-2xl border border-teal-200/50 bg-white shadow-md shadow-teal-500/5 transition hover:shadow-xl hover:shadow-violet-300/20 hover:border-violet-300/60">
                  <MedicineThumb m={m} className="h-40 w-full" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 group-hover:underline decoration-violet-400">{m.name}</div>
                        <div className="mt-1 text-xs font-medium text-violet-600/90">
                          {m.type.toUpperCase()}
                          {m.company?.name ? ` • ${m.company.name}` : ""}
                        </div>
                        {m.description ? <div className="mt-2 text-sm text-slate-600 line-clamp-2">{m.description}</div> : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-extrabold text-teal-800">₹{m.price}</div>
                        {m.mrp > m.price ? <div className="text-xs text-slate-400 line-through">₹{m.mrp}</div> : null}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium">
                      <span className={m.stockQty > 0 ? "text-emerald-700" : "text-red-700"}>
                        {m.stockQty > 0 ? `In stock (${m.stockQty})` : "Out of stock"}
                      </span>
                      <span className={m.requiresPrescription ? "text-amber-700" : "text-slate-500"}>
                        {m.requiresPrescription ? "Prescription required" : "No prescription"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="lg:col-span-3 sm:col-span-2 col-span-1">
              <HorizontalRow
                title="Super saving deals"
                right={
                  <Link to="/offers" className="text-sm font-semibold text-violet-700 hover:underline">
                    See all →
                  </Link>
                }
              >
                {items.slice(0, 12).map((m) => (
                  <ProductCard key={m._id} m={m} />
                ))}
              </HorizontalRow>

              <HorizontalRow
                title="Popular medicines"
                right={
                  <Link to="/?type=tablet" className="text-sm font-semibold text-teal-700 hover:underline">
                    Tablets →
                  </Link>
                }
              >
                {items
                  .slice(0, 12)
                  .reverse()
                  .map((m) => (
                    <ProductCard key={m._id} m={m} />
                  ))}
              </HorizontalRow>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

