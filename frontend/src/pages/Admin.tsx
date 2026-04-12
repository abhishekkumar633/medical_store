import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { api } from "../lib/api";

type Category = { _id: string; name: string; isActive: boolean };
type Disease = { _id: string; name: string; isActive: boolean };
type Company = { _id: string; name: string; isActive: boolean };
type Medicine = {
  _id: string;
  name: string;
  type: string;
  description?: string;
  price: number;
  mrp: number;
  stockQty: number;
  isActive: boolean;
  requiresPrescription?: boolean;
  category?: { name: string };
  company?: { name: string };
};
type Offer = { _id: string; title: string; couponCode?: string; discountPercent: number; isActive: boolean };

type ReportRow = any;

const sections = ["Medicines", "Categories", "Diseases", "Companies", "Offers", "Reports"] as const;
type Section = (typeof sections)[number];

export default function Admin() {
  const [section, setSection] = useState<Section>("Medicines");
  const [err, setErr] = useState<string | null>(null);

  // lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // create medicine
  const [mName, setMName] = useState("");
  const [mDescription, setMDescription] = useState("");
  const [mType, setMType] = useState("tablet");
  const [mPrice, setMPrice] = useState(10);
  const [mMrp, setMMrp] = useState(10);
  const [mStock, setMStock] = useState(10);
  const [mCategory, setMCategory] = useState<string>("");
  const [mCompany, setMCompany] = useState<string>("");
  const [mRx, setMRx] = useState(false);

  // reports
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [salesRows, setSalesRows] = useState<ReportRow[]>([]);
  const [stockRows, setStockRows] = useState<ReportRow[]>([]);

  async function loadAll() {
    setErr(null);
    try {
      const [cat, dis, comp, meds, off] = await Promise.all([
        api<{ items: Category[] }>("/api/admin/categories"),
        api<{ items: Disease[] }>("/api/admin/diseases"),
        api<{ items: Company[] }>("/api/admin/companies"),
        api<{ items: Medicine[] }>("/api/admin/medicines"),
        api<{ items: Offer[] }>("/api/admin/offers"),
      ]);
      setCategories(cat.items || []);
      setDiseases(dis.items || []);
      setCompanies(comp.items || []);
      setMedicines(meds.items || []);
      setOffers(off.items || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load admin data");
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function createCategory(name: string) {
    await api("/api/admin/categories", { method: "POST", body: JSON.stringify({ name }) });
    await loadAll();
  }
  async function createDisease(name: string) {
    await api("/api/admin/diseases", { method: "POST", body: JSON.stringify({ name }) });
    await loadAll();
  }
  async function createCompany(name: string) {
    await api("/api/admin/companies", { method: "POST", body: JSON.stringify({ name }) });
    await loadAll();
  }
  async function createOffer(title: string, couponCode: string, discountPercent: number) {
    await api("/api/admin/offers", { method: "POST", body: JSON.stringify({ title, couponCode, discountPercent, isActive: true }) });
    await loadAll();
  }
  async function createMedicine() {
    await api("/api/admin/medicines", {
      method: "POST",
      body: JSON.stringify({
        name: mName,
        description: mDescription,
        type: mType,
        category: mCategory || undefined,
        company: mCompany || undefined,
        requiresPrescription: mRx,
        price: mPrice,
        mrp: mMrp,
        stockQty: mStock,
        isActive: true,
      }),
    });
    setMName("");
    setMDescription("");
    await loadAll();
  }
  async function toggleActive(kind: "categories" | "diseases" | "companies" | "medicines" | "offers", id: string, isActive: boolean) {
    await api(`/api/admin/${kind}/${id}`, { method: "PUT", body: JSON.stringify({ isActive: !isActive }) });
    await loadAll();
  }
  async function adjustStock(id: string, delta: number) {
    await api(`/api/admin/medicines/${id}/stock`, { method: "PATCH", body: JSON.stringify({ changeQty: delta, reason: "Admin adjust" }) });
    await loadAll();
  }

  async function loadReports() {
    const qs = `year=${year}&month=${month}`;
    const [sales, stock] = await Promise.all([
      api<{ rows: ReportRow[] }>(`/api/reports/monthly-sales?${qs}`),
      api<{ rows: ReportRow[] }>(`/api/reports/monthly-stock?${qs}`),
    ]);
    setSalesRows(sales.rows || []);
    setStockRows(stock.rows || []);
  }

  const quickCounts = useMemo(
    () => ({
      medicines: medicines.length,
      categories: categories.length,
      diseases: diseases.length,
      companies: companies.length,
      offers: offers.length,
    }),
    [medicines, categories, diseases, companies, offers]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight">Admin</h2>
        <div className="text-sm text-slate-600">
          Meds {quickCounts.medicines} • Cats {quickCounts.categories} • Diseases {quickCounts.diseases} • Companies{" "}
          {quickCounts.companies} • Offers {quickCounts.offers}
        </div>
      </div>

      {err ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              section === s ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
        <button onClick={() => void loadAll()} className="ml-auto rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {section === "Medicines" ? (
          <>
            <Card>
              <div className="font-bold">Add medicine</div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <input
                  className="rounded-xl border px-3 py-2 md:col-span-2"
                  placeholder="Name"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                />
                <select className="rounded-xl border px-3 py-2" value={mType} onChange={(e) => setMType(e.target.value)}>
                  <option value="tablet">tablet</option>
                  <option value="capsule">capsule</option>
                  <option value="syrup">syrup</option>
                  <option value="injection">injection</option>
                  <option value="ointment">ointment</option>
                  <option value="drops">drops</option>
                  <option value="inhaler">inhaler</option>
                  <option value="powder">powder</option>
                  <option value="other">other</option>
                </select>
                <select className="rounded-xl border px-3 py-2" value={mCategory} onChange={(e) => setMCategory(e.target.value)}>
                  <option value="">Category</option>
                  {categories.filter((c) => c.isActive).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select className="rounded-xl border px-3 py-2" value={mCompany} onChange={(e) => setMCompany(e.target.value)}>
                  <option value="">Company</option>
                  {companies.filter((c) => c.isActive).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-xl border px-3 py-2"
                  type="number"
                  value={mPrice}
                  onChange={(e) => setMPrice(Number(e.target.value) || 0)}
                  placeholder="Price"
                />
                <button
                  disabled={!mName.trim()}
                  onClick={() => void createMedicine()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <input className="rounded-xl border px-3 py-2" type="number" value={mMrp} onChange={(e) => setMMrp(Number(e.target.value) || 0)} placeholder="MRP" />
                <input className="rounded-xl border px-3 py-2" type="number" value={mStock} onChange={(e) => setMStock(Number(e.target.value) || 0)} placeholder="Stock" />
                <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <input type="checkbox" checked={mRx} onChange={(e) => setMRx(e.target.checked)} />
                  Prescription required
                </label>
              </div>
              <div className="mt-2">
                <textarea
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Short description"
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                />
              </div>
            </Card>
            <Card>
              <div className="font-bold">Medicines</div>
              <div className="mt-3 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2">Name</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Company</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m) => (
                      <tr key={m._id} className="border-t">
                        <td className="py-2 font-semibold">{m.name}</td>
                        <td>{m.type}</td>
                        <td className="text-slate-600">{m.category?.name || "-"}</td>
                        <td className="text-slate-600">{m.company?.name || "-"}</td>
                        <td>₹{m.price}</td>
                        <td>{m.stockQty}</td>
                        <td>{m.isActive ? "Active" : "Inactive"}</td>
                        <td className="text-right space-x-2">
                          <button className="rounded-lg border px-2 py-1" onClick={() => void adjustStock(m._id, +10)}>
                            +10 stock
                          </button>
                          <button className="rounded-lg border px-2 py-1" onClick={() => void adjustStock(m._id, -10)}>
                            -10 stock
                          </button>
                          <button className="rounded-lg border px-2 py-1" onClick={() => void toggleActive("medicines", m._id, m.isActive)}>
                            Toggle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : null}

        {section === "Categories" ? <SimpleList title="Categories" items={categories} onCreate={createCategory} onToggle={(id, isActive) => toggleActive("categories", id, isActive)} /> : null}
        {section === "Diseases" ? <SimpleList title="Diseases" items={diseases} onCreate={createDisease} onToggle={(id, isActive) => toggleActive("diseases", id, isActive)} /> : null}
        {section === "Companies" ? <SimpleList title="Companies" items={companies} onCreate={createCompany} onToggle={(id, isActive) => toggleActive("companies", id, isActive)} /> : null}
        {section === "Offers" ? <OfferList offers={offers} onCreate={createOffer} onToggle={(id, isActive) => toggleActive("offers", id, isActive)} /> : null}

        {section === "Reports" ? (
          <Card>
            <div className="font-bold">Reports</div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <div className="text-xs text-slate-500">Year</div>
                <input className="rounded-xl border px-3 py-2" type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || year)} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Month</div>
                <input className="rounded-xl border px-3 py-2" type="number" value={month} onChange={(e) => setMonth(Number(e.target.value) || month)} />
              </div>
              <button onClick={() => void loadReports()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Load
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <div className="font-semibold">Monthly sales (product-wise)</div>
                <pre className="mt-2 rounded-xl border bg-slate-50 p-3 text-xs overflow-auto max-h-80">{JSON.stringify(salesRows.slice(0, 50), null, 2)}</pre>
              </div>
              <div>
                <div className="font-semibold">Monthly stock changes</div>
                <pre className="mt-2 rounded-xl border bg-slate-50 p-3 text-xs overflow-auto max-h-80">{JSON.stringify(stockRows.slice(0, 50), null, 2)}</pre>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function SimpleList({
  title,
  items,
  onCreate,
  onToggle,
}: {
  title: string;
  items: Array<{ _id: string; name: string; isActive: boolean }>;
  onCreate: (name: string) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [name, setName] = useState("");
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="font-bold">{title}</div>
        <div className="flex gap-2">
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder={`New ${title.slice(0, -1)} name`} value={name} onChange={(e) => setName(e.target.value)} />
          <button
            disabled={!name.trim()}
            onClick={() => void onCreate(name).then(() => setName(""))}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="py-2 font-semibold">{it.name}</td>
                <td>{it.isActive ? "Active" : "Inactive"}</td>
                <td className="text-right">
                  <button className="rounded-lg border px-2 py-1" onClick={() => void onToggle(it._id, it.isActive)}>
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OfferList({
  offers,
  onCreate,
  onToggle,
}: {
  offers: Offer[];
  onCreate: (title: string, couponCode: string, discountPercent: number) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [coupon, setCoupon] = useState("");
  const [pct, setPct] = useState(10);

  return (
    <Card>
      <div className="font-bold">Offers</div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
        <input className="rounded-xl border px-3 py-2 text-sm" type="number" value={pct} onChange={(e) => setPct(Number(e.target.value) || 0)} />
        <button
          disabled={!title.trim() || !coupon.trim()}
          onClick={() => void onCreate(title, coupon, pct).then(() => { setTitle(""); setCoupon(""); })}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Create
        </button>
      </div>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Title</th>
              <th>Coupon</th>
              <th>Discount</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="py-2 font-semibold">{o.title}</td>
                <td className="font-mono text-xs">{o.couponCode || "-"}</td>
                <td>{o.discountPercent}%</td>
                <td>{o.isActive ? "Active" : "Inactive"}</td>
                <td className="text-right">
                  <button className="rounded-lg border px-2 py-1" onClick={() => void onToggle(o._id, o.isActive)}>
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

