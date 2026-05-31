import { Boxes } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ru } from "@/lib/i18n/ru";

type GroupsStatsCardsProps = {
  total: number;
};

export function GroupsStatsCards({ total }: GroupsStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1">
      <Card className="border-border/80 bg-gradient-to-br from-muted/40 to-background shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{ru.groups.stats.total}</CardTitle>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">{total}</div>
          <CardDescription className="mt-1">{ru.groups.stats.totalHint}</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
