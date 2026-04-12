import type { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border bg-white shadow-sm p-4">{children}</div>;
}

