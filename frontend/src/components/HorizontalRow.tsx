import type { ReactNode } from "react";

export default function HorizontalRow({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
          {title}
        </h3>
        {right}
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}

