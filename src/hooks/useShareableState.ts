import { useState, useCallback, useEffect } from 'react';

export function useShareableState() {
  const [copied, setCopied] = useState(false);

  // Sync state to URL without reloading page
  const updateUrlParams = useCallback((params: Record<string, string | number | boolean>) => {
    try {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.set(key, String(val));
        } else {
          url.searchParams.delete(key);
        }
      });
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  // Read initial params
  const getUrlParams = useCallback(() => {
    try {
      const search = window.location.search;
      return new URLSearchParams(search);
    } catch {
      return new URLSearchParams();
    }
  }, []);

  // Copy link
  const copyShareableLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    updateUrlParams,
    getUrlParams,
    copyShareableLink,
    copied,
  };
}
