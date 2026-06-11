import { useState, useEffect, useCallback, useRef } from 'react';

export function useSearch(searchFn, delay = 350) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // If query is empty, clear results and stop loading
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Set loading true and start debounced search
    setLoading(true);
    setError(null);

    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await searchFn(query);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Erreur de recherche');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, searchFn, delay]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setLoading(false);
    setError(null);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return { query, setQuery, results, loading, error, clear };
}