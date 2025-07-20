import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { testServerConnection, testApiUrl } from '../utils/testConnection';

const QueryDebugger = () => {
  const [connectionTest, setConnectionTest] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Test API URL on component mount
    const url = testApiUrl();
    setApiUrl(url);
    
    // Test server connection
    testServerConnection().then(result => {
      setConnectionTest(result);
    });
  }, []);

  // Test query to debug API issues
  const { data, loading, error } = useApi('/api/health', {
    enabled: true
  });

  console.log('🔍 QueryDebugger state:', {
    data,
    loading,
    error
  });

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg m-4">
      <h3 className="font-bold text-yellow-800 mb-2">API Debugger</h3>
      
      <div className="text-sm space-y-2">
        <div>
          <strong>API URL:</strong> {apiUrl}
        </div>
        
        <div>
          <strong>Connection Test:</strong> 
          {connectionTest ? (
            connectionTest.success ? (
              <span className="text-green-600"> ✅ Connected</span>
            ) : (
              <span className="text-red-600"> ❌ Failed: {connectionTest.error}</span>
            )
          ) : (
            <span className="text-gray-600"> Testing...</span>
          )}
        </div>
        
        <div>
          <strong>Query Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Query Error:</strong> {error ? 'Yes' : 'No'}
        </div>
        
        {error && (
          <div>
            <strong>Error Message:</strong> {error.message}
          </div>
        )}
        
        {data && (
          <div>
            <strong>Query Data:</strong> {JSON.stringify(data)}
          </div>
        )}
      </div>
      
      <button 
        onClick={() => {
          testServerConnection().then(result => {
            setConnectionTest(result);
          });
        }}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
      >
        Retest Connection
      </button>
    </div>
  );
};

export default QueryDebugger; 