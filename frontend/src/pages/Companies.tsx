import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../lib/api";
import type { Company, Medicine } from "../lib/types";

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => {
    (async () => {
      const data = await api<{ items: Company[] }>("/api/companies");
      setCompanies(data.items || []);
    })();
  }, []);

  async function selectCompany(c: Company) {
    setSelected(c);
    const data = await api<{ items: Medicine[] }>(`/api/companies/${c._id}/medicines`);
    setMeds(data.items || []);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Companies</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="font-bold">All companies</div>
          <div className="mt-3 grid gap-2">
            {companies.map((c) => (
              <button
                key={c._id}
                onClick={() => void selectCompany(c)}
                className={`text-left rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 ${
                  selected?._id === c._id ? "border-slate-900" : ""
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Card>
        <div className="md:col-span-2">
          <Card>
            <div className="font-bold">{selected ? selected.name : "Select a company"}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {meds.map((m) => (
                <div key={m._id} className="rounded-xl border p-3">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.type.toUpperCase()}</div>
                  <div className="mt-2 font-extrabold">₹{m.price}</div>
                </div>
              ))}
              {selected && meds.length === 0 ? <div className="text-sm text-slate-600">No products found.</div> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

