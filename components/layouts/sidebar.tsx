"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Wallet,
  ArrowLeftRight,
  Tags,
  Target,
  PieChart,
  Settings,
  LogOut,
  MoreHorizontal,
  PiggyBank,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FinzLogo } from "@/components/layouts/finz-logo";

// Navegación principal - se muestra en bottom nav móvil
const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Cuentas", href: "/accounts", icon: Wallet },
  { name: "Transacciones", href: "/transactions", icon: ArrowLeftRight },
  { name: "Reportes", href: "/reports", icon: PieChart },
];

// Navegación secundaria - se muestra en el menú "Más" en móvil
const secondaryNavigation = [
  { name: "Categorías", href: "/categories", icon: Tags },
  { name: "Presupuestos", href: "/budgets", icon: Target },
  { name: "Metas de Ahorro", href: "/goals", icon: PiggyBank },
];

const allNavigation = [...mainNavigation, ...secondaryNavigation];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** Elemento del rail: icono + tooltip CSS (sin JS extra) + muesca de estado activo. */
function RailLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
        active
          ? "bg-white text-ink shadow-sm"
          : "text-white/55 hover:bg-white/10 hover:text-white"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-[22px] top-1/2 h-3 w-1.5 -translate-y-1/2 rounded-r-full bg-white"
        />
      )}
      <Icon className="h-5 w-5" />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-xl bg-popover px-3 py-1.5 text-xs font-semibold text-popover-foreground opacity-0 shadow-lg ring-1 ring-border transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const isSecondaryActive =
    secondaryNavigation.some((i) => isActivePath(pathname, i.href)) ||
    isActivePath(pathname, "/settings");

  return (
    <>
      {/* Desktop rail (estilo "bezel" oscuro) */}
      <aside
        aria-label="Navegación principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col items-center bg-ink py-7 dark:bg-black lg:flex"
      >
        <Link href="/dashboard" aria-label="Finz - inicio" className="mb-10">
          <FinzLogo className="h-9 w-9 text-white" />
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-3">
          {allNavigation.map((item) => (
            <RailLink
              key={item.href}
              href={item.href}
              label={item.name}
              icon={item.icon}
              active={isActivePath(pathname, item.href)}
            />
          ))}
          <RailLink
            href="/settings"
            label="Configuración"
            icon={Settings}
            active={isActivePath(pathname, "/settings")}
          />
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-3 bottom-3 z-50 rounded-3xl bg-ink/95 shadow-2xl backdrop-blur-lg pb-safe dark:bg-black/95 lg:hidden"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavigation.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200",
                  isActive
                    ? "bg-white text-ink"
                    : "text-white/60 hover:text-white active:scale-95"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{item.name}</span>
              </Link>
            );
          })}

          <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200",
                  isSecondaryActive
                    ? "bg-white text-ink"
                    : "text-white/60 hover:text-white active:scale-95"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Más</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 w-52">
              {secondaryNavigation.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex cursor-pointer items-center gap-3",
                      isActivePath(pathname, item.href) && "text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex cursor-pointer items-center gap-3",
                    isActivePath(pathname, "/settings") && "text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-danger focus:text-danger"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
