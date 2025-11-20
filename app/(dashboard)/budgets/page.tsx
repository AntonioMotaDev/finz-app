"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BudgetCard, BudgetDialog } from "@/components/features/budgets";
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
import { CreateBudgetInput } from "@/lib/validations/budget";
import { toast } from "sonner";
import { Plus, Loader2, Target, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Budget {
  id: string;
  amount: number;
  period: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  spent: number;
  percentage: number;
  remaining: number;
  daysRemaining: number;
  category: {
    id: string;
    name: string;
    type: string;
    color?: string | null;
    icon?: string | null;
  };
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets");
      if (!response.ok) throw new Error("Error al cargar presupuestos");
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar presupuestos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateBudgetInput) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear presupuesto");
      }

      toast.success("Presupuesto creado correctamente");
      fetchBudgets();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al crear presupuesto");
      throw error;
    }
  };

  const handleUpdate = async (data: CreateBudgetInput) => {
    if (!selectedBudget) return;

    try {
      const response = await fetch(`/api/budgets/${selectedBudget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar presupuesto");
      }

      toast.success("Presupuesto actualizado correctamente");
      fetchBudgets();
      setSelectedBudget(null);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar presupuesto");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedBudget) return;

    try {
      const response = await fetch(`/api/budgets/${selectedBudget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar presupuesto");
      }

      toast.success("Presupuesto eliminado correctamente");
      fetchBudgets();
      setSelectedBudget(null);
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al eliminar presupuesto");
    }
  };

  const openEditDialog = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setDialogOpen(true);
    }
  };

  const openDeleteDialog = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setDeleteDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedBudget(null);
  };

  const filteredBudgets = budgets.filter((budget) => {
    if (activeTab === "active") return budget.isActive && budget.daysRemaining > 0;
    if (activeTab === "warning") return budget.percentage >= 80;
    if (activeTab === "exceeded") return budget.percentage >= 100;
    return true;
  });

  const stats = {
    total: budgets.length,
    active: budgets.filter((b) => b.isActive && b.daysRemaining > 0).length,
    warning: budgets.filter((b) => b.percentage >= 80 && b.percentage < 100).length,
    exceeded: budgets.filter((b) => b.percentage >= 100).length,
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus límites de gasto por categoría
          </p>
        </div>
        <Button className="bg-blue-900 hover:bg-gray-800"  onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4 " />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-card p-6">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Activos</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-muted-foreground">Cerca del límite</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.warning}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-muted-foreground">Excedidos</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.exceeded}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todos {budgets.length > 0 && `(${budgets.length})`}
          </TabsTrigger>
          <TabsTrigger value="active">
            Activos {stats.active > 0 && `(${stats.active})`}
          </TabsTrigger>
          <TabsTrigger value="warning">
            Alertas {stats.warning > 0 && `(${stats.warning})`}
          </TabsTrigger>
          <TabsTrigger value="exceeded">
            Excedidos {stats.exceeded > 0 && `(${stats.exceeded})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Target className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {activeTab === "all"
                  ? "No hay presupuestos"
                  : activeTab === "active"
                  ? "No hay presupuestos activos"
                  : activeTab === "warning"
                  ? "No hay presupuestos cerca del límite"
                  : "No hay presupuestos excedidos"}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {activeTab === "all"
                  ? "Crea tu primer presupuesto para comenzar a controlar tus gastos"
                  : "Todos tus presupuestos están bajo control"}
              </p>
              {activeTab === "all" && (
                <Button className="bg-blue-900 hover:bg-gray-800" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Presupuesto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        initialData={
          selectedBudget
            ? {
                id: selectedBudget.id,
                categoryId: selectedBudget.category.id,
                amount: selectedBudget.amount.toString(),
                period: selectedBudget.period as "monthly" | "weekly" | "yearly",
                startDate: new Date(selectedBudget.startDate)
                  .toISOString()
                  .split("T")[0],
                endDate: selectedBudget.endDate
                  ? new Date(selectedBudget.endDate).toISOString().split("T")[0]
                  : "",
                isActive: selectedBudget.isActive,
              }
            : undefined
        }
        onSubmit={selectedBudget ? handleUpdate : handleCreate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el presupuesto de{" "}
              <strong>{selectedBudget?.category.name}</strong>. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
