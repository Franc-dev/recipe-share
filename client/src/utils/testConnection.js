import api from './api';

export const testServerConnection = async () => {
  console.log('🧪 Testing server connection...');
  
  try {
    // Test basic health endpoint
    const healthResponse = await api.get('/health');
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test API health endpoint
    const apiHealthResponse = await api.get('/api/health');
    console.log('✅ API health check successful:', apiHealthResponse.data);
    
    // Test CORS endpoint
    const corsResponse = await api.get('/api/cors-test');
    console.log('✅ CORS test successful:', corsResponse.data);
    
    return {
      success: true,
      health: healthResponse.data,
      apiHealth: apiHealthResponse.data,
      cors: corsResponse.data
    };
  } catch (error) {
    console.error('❌ Server connection test failed:', error);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - server might not be running');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - server might be slow');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.response?.status
    };
  }
};

export const testApiUrl = () => {
  const apiUrl = api.defaults.baseURL;
  console.log('🌐 Current API URL:', apiUrl);
  console.log('🌐 Environment:', process.env.NODE_ENV);
  console.log('🌐 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('🌐 REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
  
  return apiUrl;
}; 