"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAccountSchema,
  accountTypeLabels,
  accountTypeColors,
  accountTypeIcons,
  type CreateAccountInput,
} from "@/lib/validations/account";
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
import { Loader2 } from "lucide-react";

interface AccountFormProps {
  account?: any;
  onSaved: () => void;
  onCancel?: () => void;
}

export function AccountForm({ account, onSaved, onCancel }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(createAccountSchema) as any,
    defaultValues: account
      ? {
          name: account.name,
          type: account.type,
          balance: Number(account.balance),
          currency: account.currency || "MXN",
          description: account.description || "",
          color: account.color || "",
          icon: account.icon || "",
          isActive: account.isActive,
        }
      : {
          name: "",
          type: "BANK_ACCOUNT",
          balance: 0,
          currency: "MXN",
          description: "",
          color: "",
          icon: "",
          isActive: true,
        },
  });

  // Actualizar color e icono cuando cambia el tipo
  const selectedType = form.watch("type") as keyof typeof accountTypeIcons;
  
  useEffect(() => {
    if (selectedType && !account) {
      form.setValue("color", accountTypeColors[selectedType]);
      form.setValue("icon", accountTypeIcons[selectedType]);
    }
  }, [selectedType, account, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const url = account ? `/api/accounts/${account.id}` : "/api/accounts";
      const method = account ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar la cuenta");
      }

      onSaved();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la cuenta *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: BBVA Cuenta Nómina" {...field} />
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
              <FormLabel>Tipo de Cuenta *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance Inicial</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                El balance actual de esta cuenta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona moneda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre esta cuenta..."
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
            {account ? "Actualizar" : "Crear"} Cuenta
          </Button>
        </div>
      </form>
    </Form>
  );
}
