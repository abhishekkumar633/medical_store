import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Order } from "../lib/types";
import { useAuth } from "../lib/auth";

export default function Orders() {
  const { user } = useAuth();
  const [items, setItems] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await api<{ items: Order[] }>("/api/orders");
        setItems(data.items || []);
      } catch (e: any) {
        setErr(e.message || "Failed");
      }
    })();
  }, [user]);

  if (!user) return <div className="mx-auto max-w-3xl px-4 py-10">Login required.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="text-2xl font-extrabold tracking-tight">My Orders</h2>
      {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
      <div className="mt-6 grid gap-4">
        {items.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`}>
            <Card>
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-bold">{o.invoiceNo}</div>
                  <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">₹{o.total.toFixed(2)}</div>
                  <div className="text-xs text-slate-600">
                    {o.paymentMethod} • {o.paymentStatus}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {items.length === 0 ? <Card>Your orders will appear here after checkout.</Card> : null}
      </div>
    </div>
  );
}

