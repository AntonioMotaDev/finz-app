import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountForm } from "./account-form";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: any;
  onSaved: () => void;
}

export function AccountDialog({
  open,
  onOpenChange,
  account,
  onSaved,
}: AccountDialogProps) {
  const handleSaved = () => {
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {account ? "Editar Cuenta" : "Nueva Cuenta"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Modifica los datos de tu cuenta financiera."
              : "Crea una nueva cuenta para gestionar tus finanzas."}
          </DialogDescription>
        </DialogHeader>
        <AccountForm
          account={account}
          onSaved={handleSaved}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
