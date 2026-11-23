"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, MoreVertical, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export interface BalanceCardData {
  id: string;
  name: string;
  typeLabel: string;
  balance: number;
  currency: string;
}

/**
 * Tarjetas de saldo: la primera en "ink" (destacada), el resto en superficie clara.
 * El ojo oculta montos (modo privacidad) — útil al usar la app en público.
 */
export function BalanceCards({ accounts }: { accounts: BalanceCardData[] }) {
  const [hidden, setHidden] = useState(false);

  if (accounts.length === 0) {
    return (
      <Link
        href="/accounts"
        className="flex h-44 items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-5 w-5" />
        Crea tu primera cuenta
      </Link>
    );
  }

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
      {accounts.map((account, i) => {
        const featured = i === 0;
        return (
          <article
            key={account.id}
            className={cn(
              "relative isolate flex h-44 w-[82%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-sm sm:w-auto",
              featured
                ? "bg-ink text-ink-foreground dark:bg-gradient-to-br dark:from-[#2d3a55] dark:to-[#1b2233]"
                : "bg-card text-card-foreground ring-1 ring-border"
            )}
          >
            <div aria-hidden className="card-dots absolute inset-0 -z-10" />
            <div className="flex items-start justify-between gap-3">
              <p
                className="truncate text-2xl font-bold tracking-tight sm:text-[1.7rem]"
                aria-label={hidden ? "Saldo oculto" : undefined}
              >
                {hidden ? "••••••" : formatCurrency(account.balance, account.currency)}
              </p>
              <Link
                href="/accounts"
                aria-label={`Gestionar ${account.name}`}
                className={cn(
                  "-mr-2 rounded-full p-1.5 transition-colors",
                  featured ? "hover:bg-white/10" : "hover:bg-muted"
                )}
              >
                <MoreVertical className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="truncate">{account.name}</span>
              <button
                type="button"
                onClick={() => setHidden((h) => !h)}
                aria-pressed={hidden}
                aria-label={hidden ? "Mostrar saldos" : "Ocultar saldos"}
                className={cn(
                  "rounded-full p-1 opacity-70 transition hover:opacity-100",
                  featured ? "hover:bg-white/10" : "hover:bg-muted"
                )}
              >
                {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-end justify-between">
              <span className={cn("text-sm", featured ? "text-white/70" : "text-muted-foreground")}>
                {account.typeLabel}
              </span>
              <span className="font-mono text-sm font-bold italic tracking-wider opacity-90">
                {account.currency}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
