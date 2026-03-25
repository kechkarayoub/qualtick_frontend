/**
 * FCM Notification Service for the React Web App
 *
 * Responsibilities:
 *  - Initialize Firebase app (reuses the config already in config.ts).
 *  - Request notification permission.
 *  - Obtain the FCM web registration token (requires a VAPID key).
 *  - Register / refresh that token with the backend.
 *  - Deliver foreground messages to subscribers.
 *
 * Usage:
 *   import FCMService from '../services/FCMService';
 *   const service = FCMService.getInstance();
 *   await service.initialize();           // call once after login
 *   service.onMessage((msg) => { ... });  // subscribe to foreground notifications
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
  deleteToken,
} from 'firebase/messaging';

import config from '../config/config';
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
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private apiService: AuthenticatedApiService;
  private deviceIdService: DeviceIdService;
  private messageHandlers: MessageHandler[] = [];
  private unsubscribeForeground: (() => void) | null = null;
  private currentToken: string | null = null;

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
   * Call once after the user authenticates.
   * Initializes Firebase, requests permission, registers the token with the backend
   * and wires up foreground message handling.
   */
  public async initialize(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    this.initializeFirebase();

    const granted = await this.requestPermission();
    if (!granted) {
      return;
    }

    await this.registerToken();
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
   * Deregister the current browser token from the backend and Firebase.
   * Call on logout.
   */
  public async deregisterToken(): Promise<void> {
    if (!this.messaging || !this.currentToken) {
      return;
    }
    try {
      await this.apiService.delete('/accounts/fcm-token/', {
        data: { token: this.currentToken },
      } as any);
      await deleteToken(this.messaging);
      this.currentToken = null;
    } catch {
      // Non-critical
    }
  }

  /**
   * Tear down foreground listener. Call on component unmount if needed.
   */
  public destroy(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
  }

  private isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator
    );
  }

  private initializeFirebase(): void {
    if (getApps().length === 0) {
      this.app = initializeApp(config.firebase);
    } else {
      this.app = getApps()[0];
    }
    this.messaging = getMessaging(this.app);
  }

  private async requestPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  private async registerToken(): Promise<void> {
    if (!this.messaging) {
      return;
    }
    try {
      const vapidKey = (config.firebase as any).vapidKey;
      const token = await getToken(this.messaging, { vapidKey });
      if (!token) {
        return;
      }
      this.currentToken = token;
      const deviceId = await this.deviceIdService.getDeviceId();
      await this.apiService.post('/accounts/fcm-token/', {
        token,
        platform: 'web',
        device_id: deviceId,
      });
    } catch {
      // Token registration failure is non-fatal
    }
  }

  private listenForForegroundMessages(): void {
    if (!this.messaging) {
      return;
    }
    this.unsubscribeForeground = onMessage(
      this.messaging,
      (payload: MessagePayload) => {
        const message: FCMMessage = {
          messageId: payload.messageId,
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: (payload.data as Record<string, string>) ?? {},
        };
        this.messageHandlers.forEach((handler) => handler(message));
      },
    );
  }
}

export default FCMService;
