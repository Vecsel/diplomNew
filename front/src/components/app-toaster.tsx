import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function AppToaster() {
  const { resolvedDisplayTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedDisplayTheme}
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-background text-foreground shadow-md",
          title: "font-medium",
          description: "text-muted-foreground"
        }
      }}
    />
  );
}
