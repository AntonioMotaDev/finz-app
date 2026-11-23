/** Logotipo Finz: monograma geométrico "F" (SVG inline, sin petición de red). */
export function FinzLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden className={className}>
      <path d="M6 30V6h24l-6 7H13v4h9l-5 6h-4v7H6Z" fill="currentColor" />
      <path d="M24 23h6v7h-6z" fill="currentColor" opacity=".45" />
    </svg>
  );
}
