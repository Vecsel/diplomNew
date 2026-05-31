import { Shield, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ru } from "@/lib/i18n/ru";

type UsersStatsCardsProps = {
  total?: number;
  active?: number;
  administrators?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

function StatsValue({
  value,
  isLoading
}: {
  value: number | undefined;
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton className="h-8 w-24" />;
  if (typeof value !== "number") return <div className="text-2xl font-semibold tracking-tight text-muted-foreground">—</div>;
  return <div className="text-2xl font-semibold tracking-tight">{value}</div>;
}

export function UsersStatsCards({
  total,
  active,
  administrators,
  isLoading = false,
  error = null,
  onRetry
}: UsersStatsCardsProps) {
  const descriptionClass = error ? "mt-1 text-destructive" : "mt-1";
  const hintOrError = (hint: string) => (error ? error : hint);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-border/80 bg-gradient-to-br from-muted/40 to-background shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{ru.users.stats.total}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <StatsValue value={total} isLoading={isLoading} />
          <CardDescription className={descriptionClass}>{hintOrError(ru.users.stats.totalHint)}</CardDescription>
        </CardContent>
      </Card>
      <Card className="border-border/80 bg-gradient-to-br from-muted/40 to-background shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{ru.users.stats.active}</CardTitle>
          <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <StatsValue value={active} isLoading={isLoading} />
          <CardDescription className={descriptionClass}>{hintOrError(ru.users.stats.activeHint)}</CardDescription>
        </CardContent>
      </Card>
      <Card className="border-border/80 bg-gradient-to-br from-muted/40 to-background shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{ru.users.stats.admins}</CardTitle>
          <Shield className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <StatsValue value={administrators} isLoading={isLoading} />
          <CardDescription className={descriptionClass}>{hintOrError(ru.users.stats.adminsHint)}</CardDescription>
          {error && onRetry ? (
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
              {ru.common.retry}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
