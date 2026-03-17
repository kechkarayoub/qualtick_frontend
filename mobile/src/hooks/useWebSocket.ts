/**
 * React Native hook for WebSocket service
 */

import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

import useAuth from './useAuth';
import WebSocketService, {
  ConnectionState,
  WebSocketMessage,
} from '../services/WebSocketService';

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: ConnectionState;
  subscribe: (eventName: string, handler: (message: WebSocketMessage) => void) => () => void;
  send: (eventName: string, data: any) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const useWebSocket = (): UseWebSocketReturn => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const webSocketService = WebSocketService.getInstance();

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    webSocketService.getConnectionState()
  );

  useEffect(() => {
    webSocketService.setLogoutHandler(async () => {
      await logout();
    });

    const unsubscribe = webSocketService.onConnectionStateChange((state) => {
      setConnectionState(state);
    });

    return unsubscribe;
  }, [logout, webSocketService]);

  const subscribe = useCallback(
    (eventName: string, handler: (message: WebSocketMessage) => void) => {
      return webSocketService.onMessage(eventName, handler);
    },
    [webSocketService]
  );

  const send = useCallback(
    async (eventName: string, data: any) => {
      try {
        await webSocketService.send(eventName, data);
      } catch {
        Toast.show({
          type: 'error',
          text1: t('errors:title', { defaultValue: 'Error' }),
          text2: t('errors:websocket.sendFailed', { defaultValue: 'Failed to send message' }),
        });
      }
    },
    [t, webSocketService]
  );

  const connect = useCallback(async () => {
    try {
      await webSocketService.connect();
    } catch {
      Toast.show({
        type: 'error',
        text1: t('errors:title', { defaultValue: 'Error' }),
        text2: t('errors:websocket.connectionFailed', { defaultValue: 'Failed to connect' }),
      });
    }
  }, [t, webSocketService]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, [webSocketService]);

  return {
    isConnected: connectionState.isConnected,
    connectionState,
    subscribe,
    send,
    connect,
    disconnect,
  };
};

export const useProfileWebSocket = () => {
  const { t } = useTranslation();
  const { subscribe, ...rest } = useWebSocket();

  useEffect(() => {
    const unsubscribeProfileUpdate = subscribe('profile_update', (message) => {
      if (message?.data?.action === 'profile_updated') {
        Toast.show({
          type: 'success',
          text1: t('websockets:profile.updatedRemotely', { defaultValue: 'Profile updated from another device' }),
        });
      }
    });

    const unsubscribePasswordUpdate = subscribe('profile_password_update', (message) => {
      if (message?.data?.action === 'password_changed') {
        Toast.show({
          type: 'info',
          text1: t('websockets:auth.passwordChangedElsewhere', {
            defaultValue: 'Password changed from another device. You will be logged out.',
          }),
        });
      }
    });

    const unsubscribePasswordReset = subscribe('profile_password_reset', (message) => {
      if (message?.data?.action === 'logout_required') {
        Toast.show({
          type: 'info',
          text1: t('websockets:auth.passwordReset', {
            defaultValue: 'Password was reset. You will be logged out.',
          }),
        });
      }
    });

    return () => {
      unsubscribeProfileUpdate();
      unsubscribePasswordUpdate();
      unsubscribePasswordReset();
    };
  }, [subscribe, t]);

  return rest;
};

export default useWebSocket;
