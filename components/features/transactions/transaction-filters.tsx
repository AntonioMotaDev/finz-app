    "use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { transactionTypeLabels } from "@/lib/validations/transaction";

interface TransactionFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export function TransactionFilters({
  onFilterChange,
  initialFilters = {},
}: TransactionFiltersProps) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: initialFilters.type || "",
    accountId: initialFilters.accountId || "",
    categoryId: initialFilters.categoryId || "",
    startDate: initialFilters.startDate || "",
    endDate: initialFilters.endDate || "",
    minAmount: initialFilters.minAmount || "",
    maxAmount: initialFilters.maxAmount || "",
    search: initialFilters.search || "",
  });

  // Cargar cuentas y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/categories"),
        ]);

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          setAccounts(accountsData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    // Limpiar valores vacíos
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    onFilterChange(cleanFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      type: "",
      accountId: "",
      categoryId: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      search: "",
    };
    setFilters(emptyFilters);
    onFilterChange({});
  };

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== null && value !== undefined
  ).length;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y botón de filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por descripción..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            className="pl-10 bg-slate-900 border-slate-800 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className={`border-slate-800 bg-slate-900 hover:bg-slate-800 ${
              activeFiltersCount > 0 ? "border-blue-500" : ""
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-500 text-white px-1.5 py-0">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {isOpen && (
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tipo de transacción */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => handleFilterChange("type", value === "all" ? "" : value)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(transactionTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuenta */}
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select
                value={filters.accountId || "all"}
                onValueChange={(value) => handleFilterChange("accountId", value === "all" ? "" : value)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Todas las cuentas" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900">
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: account.color }}
                        />
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={filters.categoryId || "all"}
                onValueChange={(value) => handleFilterChange("categoryId", value === "all" ? "" : value)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha inicio */}
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="bg-slate-900 border-slate-800"
              />
            </div>

            {/* Fecha fin */}
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="bg-slate-900 border-slate-800"
              />
            </div>

            {/* Monto mínimo */}
            <div className="space-y-2">
              <Label>Monto mínimo</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                className="bg-slate-900 border-slate-800"
              />
            </div>

            {/* Monto máximo */}
            <div className="space-y-2">
              <Label>Monto máximo</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                className="bg-slate-900 border-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800"
            >
              Limpiar
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-blue-900 hover:bg-gray-800"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
