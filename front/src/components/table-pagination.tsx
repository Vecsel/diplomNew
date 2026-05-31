import { Button } from "@/components/ui/button";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const visible = getVisiblePages(page, totalPages);

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Назад
      </Button>
      <div className="flex items-center gap-1">
        {visible.map((item, idx) =>
          item === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="sm"
              className="min-w-9"
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}
      </div>
      <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Вперед
      </Button>
    </div>
  );
}
