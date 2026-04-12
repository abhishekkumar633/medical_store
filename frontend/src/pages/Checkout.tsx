import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Cart, Order } from "../lib/types";
import { useAuth } from "../lib/auth";

export default function Checkout() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [onlineSuccess, setOnlineSuccess] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const subtotal = useMemo(() => cart?.items?.reduce((s, it) => s + it.unitPrice * it.qty, 0) || 0, [cart]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await api<{ cart: Cart }>("/api/cart");
      setCart(data.cart);
    })();
  }, [user]);

  async function place() {
    setErr(null);
    setPlacing(true);
    try {
      const data = await api<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod,
          paymentSuccess: paymentMethod === "ONLINE" ? onlineSuccess : undefined,
          shippingAddress: { name: user?.name },
        }),
      });
      nav(`/orders/${data.order._id}`);
    } catch (e: any) {
      setErr(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  if (!user) return <div className="mx-auto max-w-3xl px-4 py-10">Login required.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Checkout</h2>
      {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="mt-6 grid gap-4">
        <Card>
          <div className="font-bold">Order summary</div>
          <div className="mt-3 text-sm text-slate-600">Items: {cart?.items?.length || 0}</div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-extrabold">₹{subtotal.toFixed(2)}</span>
          </div>
        </Card>

        <Card>
          <div className="font-bold">Payment</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                paymentMethod === "COD" ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50"
              }`}
            >
              Cash on Delivery
            </button>
            <button
              onClick={() => setPaymentMethod("ONLINE")}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                paymentMethod === "ONLINE" ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50"
              }`}
            >
              Online (mock)
            </button>
          </div>

          {paymentMethod === "ONLINE" ? (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <input
                id="success"
                type="checkbox"
                checked={onlineSuccess}
                onChange={(e) => setOnlineSuccess(e.target.checked)}
              />
              <label htmlFor="success" className="text-slate-700">
                Mark payment as successful
              </label>
            </div>
          ) : null}

          <div className="mt-5 flex justify-end">
            <button
              disabled={placing || !cart || cart.items.length === 0}
              onClick={() => void place()}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {placing ? "Placing..." : "Place order"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

