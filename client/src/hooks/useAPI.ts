import { useState, useCallback, useRef } from 'react';

import { useDispatch, actions } from '../store';

const useAPI = () => {
  const dispatch = useDispatch();
  const abort = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const dev = process.env.NODE_ENV === 'development';
  const apiURL = dev ? process.env.REACT_APP_API_URL_DEV : process.env.REACT_APP_API_URL_PROD;

  const getContributions = useCallback(async () => {
    if (abort.current) abort.current?.abort();

    setLoading(true);

    const { signal } = (abort.current = new AbortController());

    try {
      const res = await fetch(`${apiURL}/github`, {
        signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (signal.aborted) return { aborted: true };

      setLoading(false);

      const response = await res.json();

      if (res.status >= 300) {
        dispatch(actions.set({ error: `${res.url}\n\n${JSON.stringify(response, null, 2)}` }));

        return { error: response };
      }

      dispatch(
        actions.set({
          github: response
        })
      );

      return { response };
    } catch (error) {
      setLoading(false);

      return { error };
    }
  }, [dispatch]);

  return {
    loading,
    getContributions
  };
};

export default useAPI;
