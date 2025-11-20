"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  Target,
  PieChart,
  Settings,
  LogOut,
  MoreHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Navegación principal - se muestra en bottom nav móvil
const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Cuentas",
    href: "/accounts",
    icon: Wallet,
  },
  {
    name: "Transacciones",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: PieChart,
  },
];

// Navegación secundaria - se muestra en el dropdown "Más"
const secondaryNavigation = [
  {
    name: "Categorías",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Presupuestos",
    href: "/budgets",
    icon: Target,
  },
  {
    name: "Metas de Ahorro",
    href: "/goals",
    icon: TrendingUp,
  },
];

// Toda la navegación para desktop
const allNavigation = [...mainNavigation, ...secondaryNavigation];

export function Sidebar() {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-black border-r border-slate-800">
        <div className="flex h-full flex-col w-full">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-gray-700 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent">
              Finz
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {allNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg shadow-blue-500/50"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-slate-800 p-3 space-y-1">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/settings"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-900/20 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Main navigation items */}
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 min-w-[64px]",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-slate-400 hover:text-slate-200 active:scale-95"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* More dropdown */}
          <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 min-w-[64px]",
                  (pathname === "/categories" || pathname === "/budgets" || pathname === "/goals" || pathname === "/settings")
                    ? "bg-gray-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-slate-400 hover:text-slate-200 active:scale-95"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">Más</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-48 mb-2"
            >
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 cursor-pointer",
                        isActive && "bg-slate-900 text-blue-400"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-3 cursor-pointer",
                    pathname === "/settings" && "bg-slate-900 text-blue-400"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-400 focus:text-red-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Bottom spacer for mobile content */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
