import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { 
    method = 'GET', 
    body = null, 
    headers = {}, 
    enabled = true,
    dependencies = []
  } = options;

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🚀 Fetching: ${method} ${endpoint}`);
      
      let response;
      if (method === 'GET') {
        response = await api.get(endpoint);
      } else if (method === 'POST') {
        response = await api.post(endpoint, body, { headers });
      } else if (method === 'PUT') {
        response = await api.put(endpoint, body, { headers });
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint);
      }
      
      console.log(`✅ Success: ${method} ${endpoint}`);
      setData(response.data);
    } catch (err) {
      console.error(`❌ Error: ${method} ${endpoint}`, err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, enabled, ...dependencies]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Simple mutation hook
export const useMutation = (endpoint, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { method = 'POST', onSuccess, onError } = options;

  const mutate = async (body = null, customHeaders = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🚀 Mutating: ${method} ${endpoint}`);
      
      let response;
      if (method === 'POST') {
        response = await api.post(endpoint, body, { headers: customHeaders });
      } else if (method === 'PUT') {
        response = await api.put(endpoint, body, { headers: customHeaders });
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint);
      }
      
      console.log(`✅ Success: ${method} ${endpoint}`);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error(`❌ Error: ${method} ${endpoint}`, err.message);
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}; 