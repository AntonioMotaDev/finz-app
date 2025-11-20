"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contributeSchema, type ContributeFormData } from "@/lib/validations/savings-goal"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, Target } from "lucide-react"

interface ContributeFormProps {
  goal: any
  onSubmit: (amount: number) => Promise<void>
  isSubmitting?: boolean
}

export function ContributeForm({ goal, onSubmit, isSubmitting = false }: ContributeFormProps) {
  const form = useForm({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      amount: 0,
    },
  })

  const handleSubmit = async (data: ContributeFormData) => {
    await onSubmit(data.amount)
  }

  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Goal Summary */}
      <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Progreso Actual</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(Number(goal.currentAmount))}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Meta Objetivo</span>
          </div>
          <span className="text-lg font-bold">
            {formatCurrency(Number(goal.targetAmount))}
          </span>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm">
            <span className="text-muted-foreground">Falta:</span>{" "}
            <span className="font-semibold text-lg">
              {formatCurrency(remaining)}
            </span>
          </p>
        </div>
      </div>

      {/* Contribute Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto a Contribuir *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={remaining}
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isSubmitting}
                    className="text-lg"
                  />
                </FormControl>
                <FormDescription>
                  ¿Cuánto quieres agregar a esta meta?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Montos rápidos:</p>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, remaining].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("amount", amount)}
                  disabled={isSubmitting || amount <= 0}
                >
                  {amount === remaining
                    ? "Completar"
                    : formatCurrency(amount)}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar Contribución
          </Button>
        </form>
      </Form>
    </div>
  )
}
