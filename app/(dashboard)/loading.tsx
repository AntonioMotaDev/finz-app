import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto instantáneo mientras se resuelve cualquier página del área privada. */
export default function Loading() {
  return (
    <div className="space-y-6 px-4 pt-6 sm:px-6 lg:px-10 lg:pt-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-9 w-56 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-[1.75rem]" />
    </div>
  );
}
