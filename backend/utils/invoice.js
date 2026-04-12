export function makeInvoiceNo() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `INV-${yyyy}${mm}${dd}-${rand}`;
}

