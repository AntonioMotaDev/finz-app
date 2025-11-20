"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  categoryTypeLabels,
  defaultCategoryColors,
  availableCategoryIcons,
  type CreateCategoryInput,
} from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFormProps {
  category?: any;
  onSaved: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, onSaved, onCancel }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    category?.color || defaultCategoryColors[0]
  );
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || "Tag");
  const [iconSearch, setIconSearch] = useState("");

  const form = useForm<any>({
    resolver: zodResolver(createCategorySchema) as any,
    defaultValues: category
      ? {
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          description: category.description || "",
        }
      : {
          name: "",
          type: "EXPENSE",
          color: defaultCategoryColors[0],
          icon: "Tag",
          description: "",
        },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const url = category ? `/api/categories/${category.id}` : "/api/categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          color: selectedColor,
          icon: selectedIcon,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar la categoría");
      }

      onSaved();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar iconos por búsqueda
  const filteredIcons = availableCategoryIcons.filter((icon) =>
    icon.label.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la categoría *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Alimentación" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!category}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(categoryTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category && (
                <FormDescription>
                  No se puede cambiar el tipo de una categoría existente
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selector de Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Color *
          </label>
          <div className="grid grid-cols-6 gap-2">
            {defaultCategoryColors.map((color) => {
              const IconComponent = (Icons as any)[selectedIcon] || Icons.Tag;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    relative h-12 rounded-lg border-2 transition-all hover:scale-105
                    ${selectedColor === color ? "border-white scale-105" : "border-slate-700"}
                  `}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">Color seleccionado: {selectedColor}</p>
        </div>

        {/* Selector de Icono */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Icono *
          </label>
          <Input
            type="text"
            placeholder="Buscar icono..."
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-48 border border-slate-800 rounded-lg p-2">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((iconData) => {
                const IconComponent = (Icons as any)[iconData.value] || Icons.Tag;
                const isSelected = selectedIcon === iconData.value;

                return (
                  <button
                    key={iconData.value}
                    type="button"
                    onClick={() => setSelectedIcon(iconData.value)}
                    className={`
                      relative h-12 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/20 scale-105"
                          : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
                      }
                    `}
                    title={iconData.label}
                  >
                    <IconComponent
                      className="h-5 w-5"
                      style={{ color: selectedColor }}
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <p className="text-sm text-muted-foreground">
            Icono seleccionado: {selectedIcon}
          </p>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre esta categoría..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-slate-100"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-900 hover:bg-gray-800"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Actualizar" : "Crear"} Categoría
          </Button>
        </div>
      </form>
    </Form>
  );
}
