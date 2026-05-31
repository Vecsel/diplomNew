import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Boxes, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";
import { ru } from "@/lib/i18n/ru";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isActive
      ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
      : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
  );

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const onLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={isAuthenticated ? "/users" : "/login"}
              className="group flex min-w-0 items-center gap-3 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight">{ru.layout.brand}</span>
                <span className="block truncate text-xs text-muted-foreground">{ru.layout.subtitle}</span>
              </span>
            </Link>

            {isAuthenticated ? (
              <nav
                className="hidden items-center rounded-lg border border-border/60 bg-muted/30 p-1 md:flex"
                aria-label={ru.layout.navPrimary}
              >
                <NavLink to="/users" className={navClass}>
                  <span className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4 opacity-70" />
                    {ru.layout.navUsers}
                  </span>
                </NavLink>
                <NavLink to="/groups" className={navClass}>
                  <span className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 opacity-70" />
                    {ru.layout.navGroups}
                  </span>
                </NavLink>
              </nav>
            ) : (
              <span className="hidden text-xs text-muted-foreground md:inline">{ru.layout.signInHint}</span>
            )}

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 max-w-[200px] gap-2 border-border/80 bg-background/80 px-3"
                      aria-label={ru.layout.userMenuAria}
                    >
                      <span className="truncate text-left text-sm font-medium">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium leading-none">{user.fullName}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" />
                      {ru.layout.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>

          {isAuthenticated ? (
            <nav className="flex border-t border-border/50 pt-3 md:hidden" aria-label={ru.layout.navMobile}>
              <div className="flex w-full gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
                <NavLink to="/users" className={({ isActive }) => cn(navClass({ isActive }), "flex-1 text-center")}>
                  {ru.layout.navUsers}
                </NavLink>
                <NavLink to="/groups" className={({ isActive }) => cn(navClass({ isActive }), "flex-1 text-center")}>
                  {ru.layout.navGroups}
                </NavLink>
              </div>
            </nav>
          ) : null}
        </div>
      </header>
      <main className={cn("mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8", onLogin ? "max-w-md py-12" : "")}>
        <Outlet />
      </main>
    </div>
  );
}
