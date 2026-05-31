import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function TableSkeleton({ rows = 6, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("overflow-x-auto rounded-md border border-border", className)}>
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-3 py-2 text-left">
                <div className="h-4 w-20 animate-pulse rounded bg-muted-foreground/20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-3 py-3">
                  <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-muted-foreground/15" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
