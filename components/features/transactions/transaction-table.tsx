"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  description: string;
  date: string;
  notes?: string;
  account: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionTable({
  transactions,
  isLoading,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/transactions/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la transacción");
      }

      if (onDelete) {
        onDelete(deleteId);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "INCOME":
        return {
          icon: TrendingUp,
          label: "Ingreso",
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        };
      case "EXPENSE":
        return {
          icon: TrendingDown,
          label: "Gasto",
          color: "text-red-500",
          bgColor: "bg-red-500/10",
        };
      case "TRANSFER":
        return {
          icon: ArrowLeftRight,
          label: "Transferencia",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        };
      default:
        return {
          icon: TrendingUp,
          label: "Desconocido",
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
        };
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);

    return (
      <span
        className={
          type === "INCOME"
            ? "text-green-500 font-semibold"
            : type === "EXPENSE"
            ? "text-red-500 font-semibold"
            : "text-blue-500 font-semibold"
        }
      >
        {type === "INCOME" ? "+" : type === "EXPENSE" ? "-" : ""}{formatted}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground mb-2">No hay transacciones registradas</p>
        <p className="text-sm text-muted-foreground">
          Comienza creando tu primera transacción
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="w-[140px]">Fecha</TableHead>
                <TableHead className="w-[130px]">Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right w-[140px]">Monto</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const typeConfig = getTypeConfig(transaction.type);
                const Icon = typeConfig.icon;

                return (
                  <TableRow
                    key={transaction.id}
                    className="border-slate-800 hover:bg-slate-800/30"
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${typeConfig.bgColor} ${typeConfig.color} border-none`}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: transaction.account.color }}
                        />
                        <span className="text-sm">{transaction.account.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {transaction.category ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: transaction.category.color }}
                          />
                          <span className="text-sm">{transaction.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin categoría</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatAmount(Number(transaction.amount), transaction.type)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-slate-800 bg-slate-900"
                        >
                          <DropdownMenuItem
                            onClick={() => onEdit?.(transaction)}
                            className="hover:bg-slate-800 focus:bg-slate-800"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(transaction.id)}
                            className="hover:bg-slate-800 focus:bg-slate-800 text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La transacción será eliminada
              permanentemente y los balances de las cuentas serán actualizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
