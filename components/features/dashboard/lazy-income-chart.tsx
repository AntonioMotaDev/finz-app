"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// recharts (~100 KB gz) sólo se descarga cuando la gráfica entra en pantalla.
const IncomeVsExpensesChart = dynamic(
  () => import("./income-vs-expenses-chart").then((m) => m.IncomeVsExpensesChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return <Skeleton className="h-[360px] w-full rounded-[1.75rem]" />;
}

type Data = React.ComponentProps<typeof import("./income-vs-expenses-chart").IncomeVsExpensesChart>["data"];

export function LazyIncomeChart({ data }: { data: Data }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver está en todos los navegadores soportados (Baseline)
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{visible ? <IncomeVsExpensesChart data={data} /> : <ChartSkeleton />}</div>;
}
