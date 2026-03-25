/**
 * FCM Notification Service for React Native (Android & iOS)
 *
 * Responsibilities:
 *  - Request notification permission on first launch.
 *  - Obtain the FCM registration token from @react-native-firebase/messaging.
 *  - Register / refresh that token with the backend via AuthenticatedApiService.
 *  - Listen for foreground and background push notifications.
 *  - Expose a clean API so any screen or hook can subscribe to incoming messages.
 *
 * Usage anywhere in the app:
 *   import FCMService from '../services/FCMService';
 *   const service = FCMService.getInstance();
 *   await service.initialize();              // call once at app startup
 *   service.onMessage((msg) => { ... });     // subscribe to foreground messages
 */

import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import AuthenticatedApiService from './AuthenticatedApiService';
import DeviceIdService from './DeviceIdService';

export interface FCMMessage {
  messageId: string | undefined;
  title: string | undefined;
  body: string | undefined;
  data: Record<string, string>;
}

type MessageHandler = (message: FCMMessage) => void;

class FCMService {
  private static instance: FCMService;
  private apiService: AuthenticatedApiService;
  private deviceIdService: DeviceIdService;
  private messageHandlers: MessageHandler[] = [];
  private unsubscribeForeground: (() => void) | null = null;

  private constructor() {
    this.apiService = AuthenticatedApiService.getInstance();
    this.deviceIdService = DeviceIdService.getInstance();
  }

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Call once at app startup (e.g. in App.tsx after the user is authenticated).
   * Requests permission, retrieves the token and registers it with the backend.
   * Also wires up foreground message handling and token-refresh listener.
   */
  public async initialize(): Promise<void> {
    const granted = await this.requestPermission();
    if (!granted) {
      return;
    }
    await this.registerToken();
    this.listenForTokenRefresh();
    this.listenForForegroundMessages();
  }

  /**
   * Subscribe to foreground FCM messages.
   * Returns an unsubscribe function.
   */
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Explicitly deregister the current device token from the backend.
   * Call this on logout so the backend stops sending push notifications to this device.
   */
  public async deregisterToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      await this.apiService.delete('/accounts/fcm-token/', { data: { token } });
    } catch (error) {
      console.error('Failed to deregister FCM token:', error);
      // Non-critical — a stale token will be cleaned up automatically by FCM
    }
  }

  /**
   * Tear down all listeners. Call on app unmount if needed.
   */
  public destroy(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
  }

  private async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  private async registerToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      const deviceId = await this.deviceIdService.getDeviceId();
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await this.apiService.post('/accounts/fcm-token/', {
        token,
        platform,
        device_id: deviceId,
      });
    } catch {
      // Token registration failure is non-fatal; the app should still function
    }
  }

  private listenForTokenRefresh(): void {
    messaging().onTokenRefresh(async (newToken) => {
      try {
        const deviceId = await this.deviceIdService.getDeviceId();
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        await this.apiService.post('/accounts/fcm-token/', {
          token: newToken,
          platform,
          device_id: deviceId,
        });
      } catch {
        // Non-fatal
      }
    });
  }

  private listenForForegroundMessages(): void {
    this.unsubscribeForeground = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        const message: FCMMessage = {
          messageId: remoteMessage.messageId,
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: (remoteMessage.data as Record<string, string>) ?? {},
        };
        this.messageHandlers.forEach((handler) => handler(message));
      },
    );
  }
}

export default FCMService;
