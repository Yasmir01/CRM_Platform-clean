import { useState, useCallback, useEffect } from "react";

/**
 * Generic async-request hook.
 *
 * @param requestFn   A function that returns a Promise (e.g. fetch, axios.get…).
 * @param deps        Dependency array – the request is re-run when any dep changes.
 * @returns           { data, error, loading, refetch }
 */
export function useApiRequest<T>(
  requestFn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [requestFn]);

  useEffect(() => {
    // run on mount and whenever deps change
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refetch: fetchData } as const;
}

export default useApiRequest;
