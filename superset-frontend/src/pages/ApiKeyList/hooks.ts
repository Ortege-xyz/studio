import { SupersetClient } from '@superset-ui/core';
import { useCallback, useState } from 'react';

export interface ApiToken {
  id: number;
  token: string;
  created_at: string;
  expires_at: string;
  status: string;
  show: boolean;
}

export function useGetApiKeysTokens() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiToken[]>([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async function fetchData() {
    try {
      setIsLoading(true);
      const response = await SupersetClient.get({
        endpoint: '/api/v1/apikeys/',
      });

      const result = response.json.result.map((item: any) => {
        item.show = false;
        const now = new Date();
        const expires = new Date(item.expires_at);
        item.status = now > expires ? 'Expired' : 'Active';
        return item;
      });
      setResult(result);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      setError(error);
    }
  }, []);

  return { isLoading, result, error, fetchData };
}
