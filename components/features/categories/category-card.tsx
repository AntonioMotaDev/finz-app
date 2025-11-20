"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown, Loader2, Lock } from "lucide-react";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    color?: string;
    icon?: string;
    description?: string;
    isDefault: boolean;
    _count?: {
      transactions: number;
    };
  };
  onEdit?: (category: any) => void;
  onDelete?: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar la categoría");
      }

      if (onDelete) {
        onDelete(category.id);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Obtener el componente del icono
  const IconComponent = (Icons as any)[category.icon || "Tag"] || Icons.Tag;
  
  // Icono según el tipo
  const TypeIcon = category.type === "INCOME" ? TrendingUp : TrendingDown;
  const typeColor = category.type === "INCOME" ? "text-green-500" : "text-red-500";
  const typeBg = category.type === "INCOME" ? "bg-green-500/10" : "bg-red-500/10";

  return (
    <>
      <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-colors overflow-hidden group">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Icono principal */}
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <IconComponent
                  className="h-6 w-6"
                  style={{ color: category.color }}
                />
              </div>

              {/* Nombre y tipo */}
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  {category.name}
                  {category.isDefault && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`${typeBg} ${typeColor} border-none text-xs`}
                  >
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {category.type === "INCOME" ? "Ingreso" : "Gasto"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Menú de acciones */}
            {!category.isDefault && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-slate-800 bg-slate-900"
                >
                  <DropdownMenuItem
                    onClick={() => onEdit?.(category)}
                    className="hover:bg-slate-800 focus:bg-slate-800"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="hover:bg-slate-800 focus:bg-slate-800 text-red-500 focus:text-red-500"
                    disabled={category._count && category._count.transactions > 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Descripción */}
          {category.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Estadísticas */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <p className="text-xs text-muted-foreground">Transacciones</p>
              <p className="text-lg font-bold">
                {category._count?.transactions || 0}
              </p>
            </div>

            {category.isDefault && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Predeterminada</p>
                <Badge variant="outline" className="mt-1 border-slate-700">
                  Sistema
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Barra de color inferior */}
        <div
          className="h-1"
          style={{ backgroundColor: category.color }}
        />
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría "{category.name}" será
              eliminada permanentemente.
              {category._count && category._count.transactions > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  Esta categoría tiene {category._count.transactions} transacción(es)
                  asociada(s) y no puede ser eliminada.
                </span>
              )}
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
              disabled={
                isDeleting ||
                (category._count && category._count.transactions > 0)
              }
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
