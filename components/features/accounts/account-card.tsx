import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { accountTypeLabels } from "@/lib/validations/account";
import * as LucideIcons from "lucide-react";

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
    _count: {
      transactions: number;
    };
  };
  onEdit: (account: any) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  // Obtener el icono de Lucide
  const IconComponent = account.icon
    ? (LucideIcons as any)[account.icon]
    : LucideIcons.CircleDollarSign;

  return (
    <Card className={`relative m-2 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-all ${!account.isActive ? "opacity-60" : ""}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
            style={{ backgroundColor: account.color || "bg-gray-700" }}
          >
            {IconComponent && (
              <IconComponent className="h-6 w-6 text-blue" />
            )}
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {account.name}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {accountTypeLabels[account.type as keyof typeof accountTypeLabels]}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-800">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(account.id)}
              className="text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <p className="text-3xl font-bold tracking-tight">
            {account.currency} ${Number(account.balance).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          {account.description && (
            <p className="mt-3 text-xs text-slate-400 line-clamp-2">
              {account.description}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-xs pt-4 border-t border-slate-800">
        <span className="text-slate-500">{account._count.transactions} transacciones</span>
        {!account.isActive && (
          <Badge variant="secondary" className="bg-slate-800 text-slate-400">Inactiva</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
