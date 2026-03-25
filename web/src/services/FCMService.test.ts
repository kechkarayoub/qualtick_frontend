export {};

const mockDeviceIdService = { getDeviceId: jest.fn() };
const mockApiService = {
	post: jest.fn(),
	delete: jest.fn(),
};

let storedForegroundCallback: ((payload: any) => void) | null = null;
let mockCurrentToken = 'web-fcm-token-xyz';

const mockGetToken = jest.fn(async () => mockCurrentToken);
const mockDeleteToken = jest.fn(async () => {});
const mockOnMessage = jest.fn((messaging: any, cb: (payload: any) => void) => {
	storedForegroundCallback = cb;
	return jest.fn();
});
const mockGetMessaging = jest.fn(() => ({}));
const mockInitializeApp = jest.fn(() => ({}));
const mockGetApps = jest.fn(() => []);

jest.mock('firebase/app', () => ({
	initializeApp: (...args: any[]) => mockInitializeApp.apply(null, args),
	getApps: () => mockGetApps(),
}));

jest.mock('firebase/messaging', () => ({
	getMessaging: (...args: any[]) => mockGetMessaging.apply(null, args),
	getToken: (...args: any[]) => mockGetToken.apply(null, args),
	onMessage: (...args: any[]) => mockOnMessage.apply(null, args),
	deleteToken: (...args: any[]) => mockDeleteToken.apply(null, args),
}));

jest.mock('../config/config', () => ({
	__esModule: true,
	default: {
		backendEndpoint: 'https://api.example.com',
		firebase: {
			apiKey: 'test-api-key',
			authDomain: 'test.firebaseapp.com',
			projectId: 'test-project',
			storageBucket: 'test.appspot.com',
			messagingSenderId: '1234567890',
			appId: 'test-app-id',
			vapidKey: 'test-vapid-key',
		},
	},
}));

jest.mock('./AuthenticatedApiService', () => ({
	__esModule: true,
	default: { getInstance: jest.fn(() => mockApiService) },
}));

jest.mock('./DeviceIdService', () => ({
	__esModule: true,
	default: { getInstance: jest.fn(() => mockDeviceIdService) },
}));

const originalNotification = (global as any).Notification;
const originalNavigator = global.navigator;
const originalWindowNotification = (global as any).window?.Notification;
const originalServiceWorker = (global as any).navigator?.serviceWorker;

function setupBrowserEnv(permission: NotificationPermission = 'granted') {
	const notificationMock = {
		requestPermission: jest.fn(async () => permission),
	};

	Object.defineProperty(global, 'navigator', {
		value: global.navigator ?? {},
		configurable: true,
		writable: true,
	});

	Object.defineProperty((global as any).navigator, 'serviceWorker', {
		value: {},
		configurable: true,
		writable: true,
	});

	if ((global as any).window) {
		Object.defineProperty((global as any).window, 'Notification', {
			value: notificationMock,
			configurable: true,
			writable: true,
		});
	}

	(global as any).Notification = notificationMock;
}

function teardownBrowserEnv() {
	(global as any).Notification = originalNotification;

	if ((global as any).window) {
		Object.defineProperty((global as any).window, 'Notification', {
			value: originalWindowNotification,
			configurable: true,
			writable: true,
		});
	}

	Object.defineProperty((global as any).navigator, 'serviceWorker', {
		value: originalServiceWorker,
		configurable: true,
		writable: true,
	});

	Object.defineProperty(global, 'navigator', {
		value: originalNavigator,
		configurable: true,
		writable: true,
	});
}

describe('FCMService (web)', () => {
	const loadServiceClass = () => require('./FCMService').default;
	const flush = async () => Promise.resolve();

	beforeEach(() => {
		jest.clearAllMocks();
		storedForegroundCallback = null;
		mockCurrentToken = 'web-fcm-token-xyz';

		mockGetApps.mockReturnValue([]);
		mockGetToken.mockResolvedValue(mockCurrentToken);
		mockDeviceIdService.getDeviceId.mockResolvedValue('browser-device-id');
		mockApiService.post.mockResolvedValue({ data: { success: true } });
		mockApiService.delete.mockResolvedValue({ data: { success: true } });

		setupBrowserEnv('granted');
	});

	afterEach(() => {
		teardownBrowserEnv();
		jest.resetModules();
	});

	it('returns singleton instance', () => {
		const FCMService = loadServiceClass();
		const a = FCMService.getInstance();
		const b = FCMService.getInstance();
		expect(a).toBe(b);
	});

	it('initialize: initializes firebase, requests permission and registers token', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		const isSupportedSpy = jest.spyOn(service as any, 'isSupported').mockReturnValue(true);
		const initializeFirebaseSpy = jest
			.spyOn(service as any, 'initializeFirebase')
			.mockImplementation(() => {
				(service as any).messaging = {};
			});
		const requestPermissionSpy = jest
			.spyOn(service as any, 'requestPermission')
			.mockResolvedValue(true);
		const registerTokenSpy = jest
			.spyOn(service as any, 'registerToken')
			.mockResolvedValue(undefined);
		const listenSpy = jest
			.spyOn(service as any, 'listenForForegroundMessages')
			.mockImplementation(() => undefined);

		await service.initialize();
		await flush();

		expect(isSupportedSpy).toHaveBeenCalled();
		expect(initializeFirebaseSpy).toHaveBeenCalled();
		expect(requestPermissionSpy).toHaveBeenCalled();
		expect(registerTokenSpy).toHaveBeenCalled();
		expect(listenSpy).toHaveBeenCalled();
	});

	it('initialize: reuses existing Firebase app', async () => {
		mockGetApps.mockReturnValue([{ name: 'default' }] as any);
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		jest.spyOn(service as any, 'isSupported').mockReturnValue(true);
		await service.initialize();
		await flush();

		expect(mockInitializeApp).not.toHaveBeenCalled();
	});

	it('initialize: skips registration when permission denied', async () => {
		setupBrowserEnv('denied');
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		jest.spyOn(service as any, 'isSupported').mockReturnValue(true);
		await service.initialize();
		await flush();

		expect(mockApiService.post).not.toHaveBeenCalled();
	});

	it('initialize: does not throw when token registration fails', async () => {
		mockApiService.post.mockRejectedValue(new Error('net error'));
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		jest.spyOn(service as any, 'isSupported').mockReturnValue(true);
		await expect(service.initialize()).resolves.not.toThrow();
	});

	it('initialize: skips when Notification API is unavailable', async () => {
		if ((global as any).window) {
			delete (global as any).window.Notification;
		}
		delete (global as any).Notification;
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		jest.spyOn(service as any, 'isSupported').mockReturnValue(false);
		await service.initialize();
		await flush();

		expect(mockInitializeApp).not.toHaveBeenCalled();
	});

	it('onMessage: registers subscriber handler', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();

		const handler = jest.fn();
		service.onMessage(handler);

		expect((service as any).messageHandlers).toContain(handler);
	});

	it('onMessage: unsubscribe removes subscriber handler', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();

		const handler = jest.fn();
		const unsub = service.onMessage(handler);
		expect((service as any).messageHandlers).toContain(handler);

		unsub();

		expect((service as any).messageHandlers).not.toContain(handler);
	});

	it('deregisterToken: calls backend DELETE and firebase deleteToken', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		(service as any).messaging = {};
		(service as any).currentToken = 'web-fcm-token-xyz';
		await flush();

		await service.deregisterToken();

		expect(mockApiService.delete).toHaveBeenCalledWith(
			'/accounts/fcm-token/',
			expect.objectContaining({ data: { token: 'web-fcm-token-xyz' } }),
		);
		expect(mockDeleteToken).toHaveBeenCalled();
	});

	it('deregisterToken: does not throw on API error', async () => {
		mockApiService.delete.mockRejectedValue(new Error('net error'));
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		jest.spyOn(service as any, 'isSupported').mockReturnValue(true);
		await service.initialize();
		await flush();

		await expect(service.deregisterToken()).resolves.not.toThrow();
	});
});
