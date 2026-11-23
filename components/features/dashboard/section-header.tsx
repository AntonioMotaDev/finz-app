import Link from "next/link";

export function SectionHeader({
  title,
  id,
  href,
  linkLabel = "Ver todo",
  action,
}: {
  title: string;
  id?: string;
  href?: string;
  linkLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-bold tracking-tight">{title}</h2>
      {action}
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
