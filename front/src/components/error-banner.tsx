import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ru } from "@/lib/i18n/ru";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
  retryLabel?: string;
};

export function ErrorBanner({ message, onRetry, className, retryLabel = ru.common.retry }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="alert"
    >
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="shrink-0 border-destructive/40">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
