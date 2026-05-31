import { toast } from "sonner";
import { mapApiErrorToUi } from "@/lib/api-error-mapper";

/** 403 is already surfaced via `apiRequest` toast; 401 triggers global logout + toast in AuthProvider. */
export function toastApiError(error: unknown, fallbackMessage: string) {
  const mapped = mapApiErrorToUi(error, fallbackMessage);
  if (mapped.status === 403 || mapped.status === 401) return;
  toast.error(mapped.message);
}
