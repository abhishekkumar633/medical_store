import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Medicine } from "../lib/types";
import { useAuth } from "../lib/auth";
import MedicineThumb from "../components/MedicineThumb";

export default function MedicineDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Medicine | null>(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ item: Medicine }>(`/api/medicines/${id}`);
        if (!cancelled) setItem(data.item);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function addToCart() {
    if (!user) return nav("/login");
    await api("/api/cart/items", { method: "POST", body: JSON.stringify({ medicineId: id, qty }) });
    nav("/cart");
  }

  if (err) return <div className="mx-auto max-w-3xl px-4 py-8">{err}</div>;
  if (!item) return <div className="mx-auto max-w-3xl px-4 py-8 text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm font-semibold text-violet-700 hover:underline">
        ← Back
      </Link>
      <div className="mt-4 grid gap-4">
        <Card>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="h-44 w-full rounded-2xl border border-teal-200/60 overflow-hidden bg-white shadow-inner">
              <MedicineThumb m={item} className="h-full w-full" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{item.name}</h2>
              <div className="mt-1 text-sm text-slate-600">
                {item.type.toUpperCase()}
                {item.company?.name ? ` • ${item.company.name}` : ""}
                {item.category?.name ? ` • ${item.category.name}` : ""}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl font-extrabold">₹{item.price}</div>
                {item.mrp > item.price ? <div className="text-sm text-slate-400 line-through">₹{item.mrp}</div> : null}
              </div>
              {item.description ? (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm">
            <div className={item.stockQty > 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
              {item.stockQty > 0 ? `In stock (${item.stockQty})` : "Out of stock"}
            </div>
            <div className={item.requiresPrescription ? "text-amber-700 font-semibold" : "text-slate-600 font-semibold"}>
              {item.requiresPrescription ? "Prescription required" : "No prescription needed"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-28 rounded-xl border px-3 py-2"
            />
            <button
              disabled={item.stockQty <= 0}
              onClick={() => void addToCart()}
              className="rounded-xl bg-gradient-to-r from-teal-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              Add to cart
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

