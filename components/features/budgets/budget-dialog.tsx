"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetForm } from "./budget-form";
import { CreateBudgetInput } from "@/lib/validations/budget";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<CreateBudgetInput> & { id?: string };
  onSubmit: (data: CreateBudgetInput) => Promise<void>;
}

export function BudgetDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: BudgetDialogProps) {
  const handleSubmit = async (data: CreateBudgetInput) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id
              ? "Actualiza los detalles de tu presupuesto"
              : "Define un límite de gasto para una categoría específica"}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
