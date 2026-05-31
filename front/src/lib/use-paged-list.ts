import { useCallback, useEffect, useMemo, useState } from "react";

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UsePagedListOptions<TItem, TParams> = {
  enabled: boolean;
  limit: number;
  params: TParams;
  fetchPage: (args: { page: number; limit: number; params: TParams }) => Promise<PagedResult<TItem>>;
};

export function usePagedList<TItem, TParams>({
  enabled,
  limit,
  params,
  fetchPage
}: UsePagedListOptions<TItem, TParams>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (!enabled) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchPage({ page: targetPage, limit, params });
        setItems(response.items);
        setTotal(response.total);
        setPage(response.page);
        setTotalPages(response.totalPages);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Ошибка загрузки";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, fetchPage, limit, params]
  );

  useEffect(() => {
    setPage(1);
    void loadPage(1);
  }, [enabled, paramsKey]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const safe = Math.max(1, Math.min(nextPage, Math.max(totalPages, 1)));
      if (safe === page && !error) return;
      void loadPage(safe);
    },
    [error, loadPage, page, totalPages]
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    setPage: goToPage,
    reload: () => loadPage(page)
  };
}
