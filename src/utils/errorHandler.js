/**
 * Standardized API Error Handler Utility for Vaultonaut Frontend.
 * Classifies network errors, rate limits, timeouts, and authorization failures.
 */

export function parseApiError(error) {
  if (!error) {
    return {
      message: 'An unknown error occurred.',
      type: 'unknown',
      status: 500
    };
  }

  // Abort / Cancellation
  if (error.name === 'CanceledError' || error.name === 'AbortError') {
    return {
      message: 'Request was cancelled by user.',
      type: 'canceled',
      status: 0
    };
  }

  // Network Offline / Timeout
  if (!navigator.onLine || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return {
      message: 'Network connection lost. Please check your internet connection and try again.',
      type: 'network',
      status: 0
    };
  }

  const response = error.response;
  if (response) {
    const status = response.status;
    const backendMsg = response.data?.detail || response.data?.message;

    switch (status) {
      case 400:
        return {
          message: backendMsg || 'Invalid request payload. Please check your input.',
          type: 'validation',
          status: 400
        };
      case 401:
        return {
          message: 'Session expired. Please log in again to continue.',
          type: 'auth',
          status: 401
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          type: 'auth',
          status: 403
        };
      case 404:
        return {
          message: backendMsg || 'The requested resource was not found.',
          type: 'not_found',
          status: 404
        };
      case 429:
        return {
          message: 'Rate limit exceeded. Too many requests. Please wait a moment before trying again.',
          type: 'rate_limit',
          status: 429
        };
      case 500:
      case 502:
      case 503:
      default:
        return {
          message: backendMsg || 'The AI service encountered a temporary server error. Please try again.',
          type: 'server',
          status
        };
    }
  }

  return {
    message: error.message || 'An unexpected application error occurred.',
    type: 'unknown',
    status: 500
  };
}
