/**
 * WebSocket Service for React Native
 *
 * Provides profile-channel WebSocket support with:
 * - authenticated connection
 * - reconnection with backoff
 * - event-based subscriptions
 * - optional logout callback for auth errors
 */

import config from '../config/config';
import DeviceIdService from './DeviceIdService';
import SecureStorageService from './SecureStorageService';

export interface WebSocketMessage {
  type: string;
  data: any;
  deviceId?: string;
  timestamp?: string;
  error?: string;
  message?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionStateHandler = (state: ConnectionState) => void;
type LogoutHandler = () => Promise<void> | void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private secureStorage: SecureStorageService;
  private deviceIdService: DeviceIdService;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionStateHandlers: ConnectionStateHandler[] = [];
  private logoutHandler: LogoutHandler | null = null;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;
  private connectionPromise: Promise<void> | null = null;
  private maxReconnectAttempts = 3;
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  };

  private constructor() {
    this.secureStorage = SecureStorageService.getInstance();
    this.deviceIdService = DeviceIdService.getInstance();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public setLogoutHandler(handler: LogoutHandler): void {
    this.logoutHandler = handler;
  }

  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  public onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.connectionStateHandlers.push(handler);
    handler(this.getConnectionState());
    return () => {
      this.connectionStateHandlers = this.connectionStateHandlers.filter(h => h !== handler);
    };
  }

  public onMessage(eventName: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(eventName)) {
      this.messageHandlers.set(eventName, []);
    }
    this.messageHandlers.get(eventName)!.push(handler);

    return () => {
      const handlers = this.messageHandlers.get(eventName) || [];
      this.messageHandlers.set(eventName, handlers.filter(h => h !== handler));
    };
  }

  public async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.connectionState.isConnected || this.connectionState.isConnecting) {
      return;
    }

    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateConnectionState({
        error: 'Maximum WebSocket reconnection attempts reached',
      });
      return;
    }

    this.connectionPromise = this.performConnection();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async performConnection(): Promise<void> {
    this.updateConnectionState({
      isConnecting: true,
      error: null,
    });

    let accessToken = await this.secureStorage.getSessionItem('access_token');
    if (!accessToken) {
      accessToken = await this.secureStorage.getSecureItem('access_token');
    }

    const userFromSession = await this.secureStorage.getSessionItem('user');
    const userFromStorage = await this.secureStorage.getItem('user');
    const userString = userFromSession || userFromStorage;
    const user = userString ? JSON.parse(userString) : null;

    if (!accessToken || !user?.id) {
      this.updateConnectionState({
        isConnecting: false,
        isConnected: false,
        error: 'Missing auth context for WebSocket connection',
      });
      return;
    }

    const deviceId = await this.deviceIdService.getDeviceId();
    const params = new URLSearchParams({
      token: accessToken,
      deviceId,
    });

    const wsEndpoint = config.wsEndpoint.replace('http://', 'ws://').replace('https://', 'wss://');
    const wsUrl = `${wsEndpoint}/ws/profile/${user.id}/?${params.toString()}`;

    await new Promise<void>((resolve, reject) => {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.updateConnectionState({
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        });
        this.startPing();
        resolve();
      };

      this.socket.onerror = () => {
        this.updateConnectionState({
          isConnecting: false,
          isConnected: false,
          error: 'WebSocket connection failed',
        });
        reject(new Error('WebSocket connection failed'));
      };

      this.socket.onclose = async (event) => {
        this.stopPing();
        this.socket = null;

        this.updateConnectionState({
          isConnected: false,
          isConnecting: false,
          error: event.reason || 'WebSocket disconnected',
        });

        if (event.code === 4002 || event.code === 4003 || event.code === 4004 || event.code === 4005) {
          if (this.logoutHandler) {
            await this.logoutHandler();
          }
          return;
        }

        this.scheduleReconnect();
      };

      this.socket.onmessage = async (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'auth_error') {
            if ((message.error === 'token_blacklisted' || message.error === 'invalid_token') && this.logoutHandler) {
              await this.logoutHandler();
            }
            this.updateConnectionState({
              error: message.message || message.error || 'Authentication error',
            });
            return;
          }

          this.emitMessage(message);
        } catch {
          this.updateConnectionState({
            error: 'Invalid WebSocket payload received',
          });
        }
      };
    });
  }

  public disconnect(): void {
    this.clearReconnectTimeout();
    this.stopPing();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connectionPromise = null;
    this.updateConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    });
  }

  public async send(type: string, data: any): Promise<void> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const deviceId = await this.deviceIdService.getDeviceId();
    this.socket.send(
      JSON.stringify({
        type,
        data,
        deviceId,
        timestamp: new Date().toISOString(),
      })
    );
  }

  private emitMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message));

    const wildcardHandlers = this.messageHandlers.get('*') || [];
    wildcardHandlers.forEach(handler => handler(message));
  }

  private updateConnectionState(patch: Partial<ConnectionState>): void {
    this.connectionState = {
      ...this.connectionState,
      ...patch,
    };

    this.connectionStateHandlers.forEach(handler => handler(this.getConnectionState()));
  }

  private scheduleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const nextAttempt = this.connectionState.reconnectAttempts + 1;
    const backoff = Math.min(1000 * 2 ** (nextAttempt - 1), 8000);

    this.updateConnectionState({
      reconnectAttempts: nextAttempt,
    });

    this.clearReconnectTimeout();
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect().catch(() => {
        this.updateConnectionState({
          error: 'WebSocket reconnection failed',
        });
      });
    }, backoff);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingIntervalId = setInterval(async () => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        return;
      }

      const deviceId = await this.deviceIdService.getDeviceId();
      this.socket.send(
        JSON.stringify({
          type: 'ping',
          deviceId,
          timestamp: new Date().toISOString(),
        })
      );
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }
}

export default WebSocketService;
