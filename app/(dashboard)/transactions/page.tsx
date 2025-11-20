"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  TransactionTable,
  TransactionDialog,
  TransactionFilters,
  QuickAddTransaction,
} from "@/components/features/transactions";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchTransactions = useCallback(async (page = 1, currentFilters = {}) => {
    try {
      setIsLoading(true);

      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...currentFilters,
      });

      const response = await fetch(`/api/transactions?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1, filters);
  }, [filters, fetchTransactions]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    fetchTransactions(pagination.currentPage, filters);
  };

  const handleSaved = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    fetchTransactions(pagination.currentPage, filters);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchTransactions(page, filters);
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos tus ingresos y gastos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={handleNewTransaction}
            className="bg-blue-900 hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
          <p className="text-sm text-muted-foreground">Total de transacciones</p>
          <p className="text-2xl font-bold mt-1">{pagination.totalCount}</p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
          <p className="text-sm text-muted-foreground">Página actual</p>
          <p className="text-2xl font-bold mt-1">
            {pagination.currentPage} de {pagination.totalPages || 1}
          </p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
          <p className="text-sm text-muted-foreground">Mostrando</p>
          <p className="text-2xl font-bold mt-1">
            {transactions.length} registros
          </p>
        </div>
      </div>

      {/* Filtros */}
      <TransactionFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Tabla de transacciones */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} de{" "}
            {pagination.totalCount} transacciones
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog para crear/editar transacción */}
      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={editingTransaction}
        onSaved={handleSaved}
      />

      {/* Botón flotante para móviles */}
      <QuickAddTransaction onSaved={() => fetchTransactions(pagination.currentPage, filters)} />
    </div>
  );
}
