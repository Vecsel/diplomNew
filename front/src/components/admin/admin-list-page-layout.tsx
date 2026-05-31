import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminListPageLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  toolbar?: ReactNode;
  listError?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Table / dense content area */
  contentClassName?: string;
};

export function AdminListPageLayout({
  title,
  description,
  actions,
  stats,
  toolbar,
  listError,
  banner,
  children,
  className,
  contentClassName
}: AdminListPageLayoutProps) {
  return (
    <div className={cn("mx-auto max-w-[1400px] space-y-8", className)}>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pb-0.5">{actions}</div> : null}
      </div>
      {stats}
      {listError}
      <Card className={cn("overflow-hidden border-border/80 shadow-sm")}>
        {toolbar ? <CardHeader className="space-y-0 border-b border-border/60 bg-muted/20 pb-4 pt-6">{toolbar}</CardHeader> : null}
        <CardContent className={cn("space-y-4 p-0", toolbar ? "" : "pt-6")}>
          {banner ? <div className="border-b border-border/60 px-6 py-3">{banner}</div> : null}
          <div className={cn("px-2 pb-4 pt-2 sm:px-4 sm:pb-6", contentClassName)}>{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
