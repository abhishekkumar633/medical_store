import MedStoreLogo from "./MedStoreLogo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-teal-200/50 bg-gradient-to-r from-teal-50/80 via-white to-fuchsia-50/60">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <MedStoreLogo size={36} />
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-teal-700 to-violet-700 bg-clip-text text-transparent">
              MedStore
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Online medicine catalog, offers, cart, checkout, invoices, and admin reporting — built as a full‑stack demo.
          </p>
          <p className="mt-3 text-xs text-slate-500">For educational use only. Not medical advice.</p>
        </div>

        <div>
          <div className="font-bold">Contact</div>
          <ul className="mt-2 text-sm text-slate-600 grid gap-1">
            <li>Support: support@medstore.com</li>
            <li>Phone: +91 90000 00000</li>
            <li>Hours: 9:00 AM – 9:00 PM</li>
          </ul>
        </div>

        <div>
          <div className="font-bold">Social</div>
          <ul className="mt-2 text-sm grid gap-2">
            <li>
              <a className="text-slate-700 hover:underline" href="https://instagram.com/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a className="text-slate-700 hover:underline" href="https://facebook.com/" target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a className="text-slate-700 hover:underline" href="https://x.com/" target="_blank" rel="noreferrer">
                X (Twitter)
              </a>
            </li>
            <li>
              <a className="text-slate-700 hover:underline" href="https://linkedin.com/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-teal-100 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} MedStore. All rights reserved.</span>
          <span>Built with React + Express + MongoDB</span>
        </div>
      </div>
    </footer>
  );
}

