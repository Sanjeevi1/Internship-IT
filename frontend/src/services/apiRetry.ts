import { AxiosError, AxiosResponse } from 'axios';
import api from './api';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

const defaultConfig: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

export async function withRetry<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  config: RetryConfig = {}
): Promise<AxiosResponse<T>> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: AxiosError | null = null;
  
  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as AxiosError;
      
      if (!finalConfig.shouldRetry(lastError) || attempt === finalConfig.maxRetries - 1) {
        throw error;
      }

      console.log(`Attempt ${attempt + 1} failed, retrying in ${finalConfig.retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay));
    }
  }

  throw lastError;
}

// Wrapped API methods with retry
export const apiWithRetry = {
  get: <T>(url: string, config?: RetryConfig) => 
    withRetry(() => api.get<T>(url), config),
  
  post: <T>(url: string, data?: any, config?: RetryConfig) =>
    withRetry(() => api.post<T>(url, data), config),
  
  put: <T>(url: string, data?: any, config?: RetryConfig) =>
    withRetry(() => api.put<T>(url, data), config),
  
  patch: <T>(url: string, data?: any, config?: RetryConfig) =>
    withRetry(() => api.patch<T>(url, data), config),
  
  delete: <T>(url: string, config?: RetryConfig) =>
    withRetry(() => api.delete<T>(url), config),
}; 