import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(fetchFn, immediate = true, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    if (isMounted.current) setLoading(true);
    if (isMounted.current) setError(null);
    try {
      const result = await fetchFn(...args);
      if (isMounted.current) setData(result);
      return result;
    } catch (err) {
      if (isMounted.current) setError(err.message || 'Erreur');
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...deps]);

  const refresh = useCallback(() => execute(), [execute]);

  return { data, loading, error, refresh, execute };
}