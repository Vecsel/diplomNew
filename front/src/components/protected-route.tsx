import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/auth-context";
import { ru } from "@/lib/i18n/ru";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthChecking } = useAuth();

  if (isAuthChecking) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        <p className="text-sm">{ru.auth.sessionChecking}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
