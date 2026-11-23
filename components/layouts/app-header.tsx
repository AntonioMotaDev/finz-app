"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Search, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AppHeaderProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "¡Buenos días!";
  if (h < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const firstName = user.name?.split(" ")[0] || "Usuario";
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim().slice(0, 100);
    router.push(q ? `/transactions?search=${encodeURIComponent(q)}` : "/transactions");
  };

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pt-5 sm:px-6 lg:gap-6 lg:px-10 lg:pt-8">
      {/* Saludo */}
      <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
        <Avatar className="h-11 w-11 ring-2 ring-card">
          {user.image && (
            <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />
          )}
          <AvatarFallback className="bg-brand-soft text-sm font-bold text-brand-soft-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-bold leading-tight sm:text-lg" suppressHydrationWarning>
            {getGreeting()} <span aria-hidden>👋</span>
          </p>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            Empieza tu día con <span className="font-semibold uppercase text-foreground/80">{firstName}</span>
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <form
        role="search"
        onSubmit={onSearch}
        className="order-last w-full lg:order-none lg:mx-auto lg:max-w-md lg:flex-1"
      >
        <label htmlFor="global-search" className="sr-only">
          Buscar transacciones
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="global-search"
            type="search"
            value={query}
            maxLength={100}
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar transacciones…"
            className="h-11 w-full rounded-full bg-muted pl-11 pr-4 text-sm outline-none ring-1 ring-transparent transition placeholder:text-muted-foreground focus:bg-card focus:ring-ring"
          />
        </div>
      </form>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-ink-foreground shadow-sm transition-opacity hover:opacity-90 dark:bg-card dark:ring-1 dark:ring-border"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mi cuenta</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-semibold">{user.name || "Usuario"}</p>
              {user.email && (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="flex cursor-pointer items-center gap-2 text-danger focus:text-danger"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
