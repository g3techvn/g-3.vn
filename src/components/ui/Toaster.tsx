import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export function Toaster() {
  const { toast } = useToast();

  return (
    <ToastProvider>
      {toast.show && (
        <Toast variant={toast.variant}>
          <div className="grid gap-1">
            <ToastDescription>{toast.message}</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
} 