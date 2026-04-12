import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Offer } from "../lib/types";

export default function Offers() {
  const [items, setItems] = useState<Offer[]>([]);

  useEffect(() => {
    (async () => {
      const data = await api<{ items: Offer[] }>("/api/offers");
      setItems(data.items || []);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Offers</h2>
      <p className="mt-1 text-slate-600">Apply coupon codes at checkout/cart.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((o) => (
          <Card key={o._id}>
            <div className="text-xs text-slate-500">Coupon</div>
            <div className="mt-1 text-xl font-extrabold">{o.couponCode || "-"}</div>
            <div className="mt-2 text-sm text-slate-600">{o.description || o.title}</div>
            <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {o.discountPercent}% OFF
            </div>
          </Card>
        ))}
        {items.length === 0 ? <Card>No active offers right now.</Card> : null}
      </div>
    </div>
  );
}

