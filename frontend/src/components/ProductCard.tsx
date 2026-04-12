import { Link } from "react-router-dom";
import type { Medicine } from "../lib/types";
import MedicineThumb from "./MedicineThumb";

function calcDiscountPercent(m: Medicine) {
  if (!m.mrp || m.mrp <= 0) return 0;
  if (m.price >= m.mrp) return 0;
  return Math.round(((m.mrp - m.price) / m.mrp) * 100);
}

export default function ProductCard({ m }: { m: Medicine }) {
  const off = calcDiscountPercent(m);
  const rating = 4.3; // simple placeholder

  return (
    <Link to={`/medicines/${m._id}`} className="block w-[210px] shrink-0">
      <div className="rounded-2xl border border-teal-200/60 bg-white shadow-md shadow-teal-500/5 transition overflow-hidden hover:shadow-xl hover:shadow-fuchsia-200/40 hover:border-violet-300/70 hover:-translate-y-0.5">
        <div className="relative">
          <MedicineThumb m={m} className="h-32 w-full" />
          {off > 0 ? (
            <div className="absolute bottom-2 left-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              {off}% off
            </div>
          ) : null}
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">{m.type}</div>
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
              <span className="text-amber-500">★</span>
              {rating}
            </div>
          </div>

          <div className="mt-2 text-sm font-bold text-slate-900 leading-snug line-clamp-2">{m.name}</div>
          {m.description ? (
            <div className="mt-1 text-xs text-slate-600 line-clamp-2">{m.description}</div>
          ) : null}

          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-sm font-extrabold text-teal-800">₹{m.price}</div>
            {m.mrp > m.price ? <div className="text-xs text-slate-400 line-through">₹{m.mrp}</div> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

