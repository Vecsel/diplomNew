import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/login-page";
import { UsersPage } from "@/pages/users-page";
import { GroupsPage } from "@/pages/groups-page";
import { useAuth } from "@/features/auth/auth-context";
import { ru } from "@/lib/i18n/ru";

function LoginRoute() {
  const { isAuthenticated, isAuthChecking } = useAuth();
  if (isAuthChecking) return <div className="py-12 text-center text-muted-foreground">{ru.auth.sessionChecking}</div>;
  if (isAuthenticated) return <Navigate to="/users" replace />;
  return <LoginPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="login" element={<LoginRoute />} />
        <Route
          path="users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
