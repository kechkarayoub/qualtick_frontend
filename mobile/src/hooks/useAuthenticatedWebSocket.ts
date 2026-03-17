/**
 * Automatically manages WebSocket lifecycle based on authentication state.
 */

import { useEffect } from 'react';

import useAuth from './useAuth';
import useWebSocket from './useWebSocket';

const useAuthenticatedWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const { connect, disconnect, ...webSocketState } = useWebSocket();

  useEffect(() => {
    if (isAuthenticated) {
      connect().catch(() => {
        // Error handled by useWebSocket toast path
      });
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  return webSocketState;
};

export default useAuthenticatedWebSocket;
