import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Cart } from "../lib/types";
import { useAuth } from "../lib/auth";

export default function CartPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const summary = useMemo(() => {
    const subtotal = cart?.items?.reduce((s, it) => s + it.unitPrice * it.qty, 0) || 0;
    return { subtotal };
  }, [cart]);

  async function load() {
    const data = await api<{ cart: Cart }>("/api/cart");
    setCart(data.cart);
  }

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  async function updateQty(medicineId: string, qty: number) {
    await api("/api/cart/items", { method: "PUT", body: JSON.stringify({ medicineId, qty }) });
    await load();
  }

  async function applyCoupon() {
    setErr(null);
    try {
      await api("/api/cart/apply-coupon", { method: "POST", body: JSON.stringify({ couponCode }) });
      await load();
    } catch (e: any) {
      setErr(e.message || "Failed to apply coupon");
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <div className="font-bold">Please login to view your cart.</div>
          <Link className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" to="/login">
            Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Cart</h2>
      {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="mt-6 grid gap-4">
        <Card>
          {!cart || cart.items.length === 0 ? (
            <div className="text-slate-600">Your cart is empty.</div>
          ) : (
            <div className="grid gap-3">
              {cart.items.map((it) => (
                <div key={it.medicine._id} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">{it.medicine.name}</div>
                    <div className="text-xs text-slate-500">₹{it.unitPrice} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border px-3 py-1" onClick={() => void updateQty(it.medicine._id, it.qty - 1)}>
                      -
                    </button>
                    <span className="w-8 text-center">{it.qty}</span>
                    <button className="rounded-lg border px-3 py-1" onClick={() => void updateQty(it.medicine._id, it.qty + 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t pt-3 text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-extrabold">₹{summary.subtotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border px-4 py-3"
              placeholder="Coupon code (e.g., WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button onClick={() => void applyCoupon()} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
              Apply
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              disabled={!cart || cart.items.length === 0}
              onClick={() => nav("/checkout")}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

