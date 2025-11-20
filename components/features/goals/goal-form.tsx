"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { savingsGoalSchema, type SavingsGoalFormData } from "@/lib/validations/savings-goal"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface GoalFormProps {
  defaultValues?: Partial<SavingsGoalFormData>
  onSubmit: (data: SavingsGoalFormData) => Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
}

export function GoalForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Crear Meta",
}: GoalFormProps) {
  const form = useForm({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      targetAmount: defaultValues?.targetAmount || 0,
      currentAmount: defaultValues?.currentAmount || 0,
      deadline: defaultValues?.deadline || "",
      description: defaultValues?.description || "",
    },
  })

  const handleSubmit = async (data: SavingsGoalFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Meta *</FormLabel>
              <FormControl>
                <Input
                  placeholder="ej: Viaje a Europa, Auto nuevo, Fondo de emergencia"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Objetivo *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>¿Cuánto quieres ahorrar?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Actual</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>¿Cuánto has ahorrado ya?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Límite (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>
              <FormDescription>
                ¿Cuándo quieres alcanzar esta meta?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Agrega detalles sobre tu meta..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-900 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 text-white"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
