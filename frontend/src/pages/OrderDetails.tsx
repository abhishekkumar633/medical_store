import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Order } from "../lib/types";
import { useAuth } from "../lib/auth";

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await api<{ order: Order }>(`/api/orders/${id}`);
        setOrder(data.order);
      } catch (e: any) {
        setErr(e.message || "Failed");
      }
    })();
  }, [user, id]);

  if (!user) return <div className="mx-auto max-w-3xl px-4 py-10">Login required.</div>;
  if (err) return <div className="mx-auto max-w-3xl px-4 py-10">{err}</div>;
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-10 text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/orders" className="text-sm text-slate-600 hover:underline">
        ← Back to orders
      </Link>
      <div className="mt-4 grid gap-4">
        <Card>
          <div className="flex justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Invoice</div>
              <div className="text-xl font-extrabold">{order.invoiceNo}</div>
              <div className="mt-1 text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-xl font-extrabold">₹{order.total.toFixed(2)}</div>
              <div className="mt-1 text-sm text-slate-600">
                {order.paymentMethod} • {order.paymentStatus}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="font-bold">Items</div>
          <div className="mt-3 grid gap-2">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between gap-3 text-sm">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-xs text-slate-500">
                    Qty {it.qty}
                    {it.requiresPrescription ? " • Prescription required" : ""}
                  </div>
                </div>
                <div className="font-semibold">₹{(it.qty * it.unitPrice).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Discount</span>
              <span>₹{order.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

