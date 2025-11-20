"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingDown, TrendingUp, Search } from "lucide-react";
import { CategoryCard, CategoryForm } from "@/components/features/categories";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    fetchCategories();
  };

  const handleSaved = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    fetchCategories();
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  // Filtrar categorías por tipo y búsqueda
  const filteredCategories = categories.filter((category) => {
    const matchesType = category.type === activeTab;
    const matchesSearch = searchQuery
      ? category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  // Separar categorías predeterminadas de personalizadas
  const defaultCategories = filteredCategories.filter((cat) => cat.isDefault);
  const customCategories = filteredCategories.filter((cat) => !cat.isDefault);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-1">
            Organiza tus transacciones por categorías
          </p>
        </div>
        <Button
          onClick={handleNewCategory}
          className="bg-blue-900 hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
          <p className="text-sm text-muted-foreground">Total de categorías</p>
          <p className="text-2xl font-bold mt-1">{categories.length}</p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
          <p className="text-sm text-muted-foreground">Categorías de gastos</p>
          <p className="text-2xl font-bold mt-1 text-red-500">
            {categories.filter((c) => c.type === "EXPENSE").length}
          </p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
          <p className="text-sm text-muted-foreground">Categorías de ingresos</p>
          <p className="text-2xl font-bold mt-1 text-green-500">
            {categories.filter((c) => c.type === "INCOME").length}
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar categorías..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 focus:border-blue-500"
        />
      </div>

      {/* Tabs por tipo */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-slate-900 border border-slate-800">
          <TabsTrigger
            value="EXPENSE"
            className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger
            value="INCOME"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Ingresos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="EXPENSE" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando categorías...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">
                No hay categorías de gastos
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Intenta con otra búsqueda"
                  : "Crea tu primera categoría de gastos"}
              </p>
            </div>
          ) : (
            <>
              {/* Categorías personalizadas */}
              {customCategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Mis Categorías ({customCategories.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías predeterminadas */}
              {defaultCategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Categorías Predeterminadas ({defaultCategories.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="INCOME" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando categorías...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">
                No hay categorías de ingresos
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Intenta con otra búsqueda"
                  : "Crea tu primera categoría de ingresos"}
              </p>
            </div>
          ) : (
            <>
              {/* Categorías personalizadas */}
              {customCategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Mis Categorías ({customCategories.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías predeterminadas */}
              {defaultCategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Categorías Predeterminadas ({defaultCategories.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para crear/editar categoría */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSaved={handleSaved}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
