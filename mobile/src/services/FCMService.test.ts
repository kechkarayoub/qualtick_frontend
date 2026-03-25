export {};

const mockPlatform = { OS: 'android' as 'android' | 'ios' };

const mockDeviceIdService = { getDeviceId: jest.fn() };
const mockApiService = {
	post: jest.fn(),
	delete: jest.fn(),
};

let storedTokenRefreshCallback: ((token: string) => void) | null = null;
let storedForegroundCallback: ((msg: any) => Promise<void>) | null = null;

const mockMessagingInstance = {
	requestPermission: jest.fn(),
	getToken: jest.fn(),
	onTokenRefresh: jest.fn((cb: (token: string) => void) => {
		storedTokenRefreshCallback = cb;
		return jest.fn();
	}),
	onMessage: jest.fn((cb: (msg: any) => Promise<void>) => {
		storedForegroundCallback = cb;
		return jest.fn();
	}),
};

const mockMessagingFactory: any = jest.fn(() => mockMessagingInstance);
mockMessagingFactory.AuthorizationStatus = {
	AUTHORIZED: 1,
	PROVISIONAL: 2,
	DENIED: 0,
	NOT_DETERMINED: -1,
};

jest.mock('react-native', () => ({
	Platform: mockPlatform,
}));

jest.mock('@react-native-firebase/messaging', () => ({
	__esModule: true,
	default: mockMessagingFactory,
}), { virtual: true });

jest.mock('./AuthenticatedApiService', () => ({
	__esModule: true,
	default: { getInstance: jest.fn(() => mockApiService) },
}));

jest.mock('./DeviceIdService', () => ({
	__esModule: true,
	default: { getInstance: jest.fn(() => mockDeviceIdService) },
}));

describe('FCMService', () => {
	const loadServiceClass = () => require('./FCMService').default;
	const flush = () => new Promise<void>((r) => setImmediate(r));

	beforeEach(() => {
		jest.clearAllMocks();
		storedTokenRefreshCallback = null;
		storedForegroundCallback = null;
		mockPlatform.OS = 'android';

		mockMessagingInstance.requestPermission.mockResolvedValue(
			mockMessagingFactory.AuthorizationStatus.AUTHORIZED,
		);
		mockMessagingInstance.getToken.mockResolvedValue('fcm-token-abc');
		mockDeviceIdService.getDeviceId.mockResolvedValue('device-xyz');
		mockApiService.post.mockResolvedValue({ data: { success: true } });
		mockApiService.delete.mockResolvedValue({ data: { success: true } });
	});

	afterEach(() => {
		jest.resetModules();
	});

	it('returns singleton instance', () => {
		const FCMService = loadServiceClass();
		const a = FCMService.getInstance();
		const b = FCMService.getInstance();
		expect(a).toBe(b);
	});

	it('initialize: requests permission, registers token and sets up listeners', async () => {
		const FCMService = loadServiceClass();
		await FCMService.getInstance().initialize();
		await flush();

		expect(mockMessagingInstance.requestPermission).toHaveBeenCalled();
		expect(mockApiService.post).toHaveBeenCalledWith('/accounts/fcm-token/', {
			token: 'fcm-token-abc',
			platform: 'android',
			device_id: 'device-xyz',
		});
		expect(mockMessagingInstance.onTokenRefresh).toHaveBeenCalled();
		expect(mockMessagingInstance.onMessage).toHaveBeenCalled();
	});

	it('initialize: uses ios platform on iOS', async () => {
		mockPlatform.OS = 'ios';
		const FCMService = loadServiceClass();
		await FCMService.getInstance().initialize();
		await flush();

		expect(mockApiService.post).toHaveBeenCalledWith(
			'/accounts/fcm-token/',
			expect.objectContaining({ platform: 'ios' }),
		);
	});

	it('initialize: skips registration when permission is denied', async () => {
		mockMessagingInstance.requestPermission.mockResolvedValue(
			mockMessagingFactory.AuthorizationStatus.DENIED,
		);
		const FCMService = loadServiceClass();
		await FCMService.getInstance().initialize();
		await flush();

		expect(mockApiService.post).not.toHaveBeenCalled();
	});

	it('initialize: does not throw when token registration fails', async () => {
		mockApiService.post.mockRejectedValue(new Error('network error'));
		const FCMService = loadServiceClass();
		await expect(FCMService.getInstance().initialize()).resolves.not.toThrow();
	});

	it('onMessage: delivers foreground messages to subscribers', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		await service.initialize();
		await flush();

		const received: any[] = [];
		service.onMessage((msg: any) => received.push(msg));

		expect(storedForegroundCallback).not.toBeNull();
		await storedForegroundCallback!({
			messageId: 'msg-1',
			notification: { title: 'Hello', body: 'World' },
			data: { type: 'alert' },
		});

		expect(received).toHaveLength(1);
		expect(received[0]).toEqual({
			messageId: 'msg-1',
			title: 'Hello',
			body: 'World',
			data: { type: 'alert' },
		});
	});

	it('onMessage: unsubscribe stops delivery', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		await service.initialize();
		await flush();

		const received: any[] = [];
		const unsub = service.onMessage((msg: any) => received.push(msg));
		unsub();

		await storedForegroundCallback!({
			messageId: 'msg-2',
			notification: { title: 'Dropped', body: '' },
			data: {},
		});

		expect(received).toHaveLength(0);
	});

	it('token refresh: re-registers new token with backend', async () => {
		mockMessagingInstance.getToken.mockResolvedValue('initial-token');
		const FCMService = loadServiceClass();
		await FCMService.getInstance().initialize();
		await flush();

		mockApiService.post.mockClear();
		expect(storedTokenRefreshCallback).not.toBeNull();
		await storedTokenRefreshCallback!('new-refreshed-token');
		await flush();

		expect(mockApiService.post).toHaveBeenCalledWith('/accounts/fcm-token/', {
			token: 'new-refreshed-token',
			platform: 'android',
			device_id: 'device-xyz',
		});
	});

	it('deregisterToken: sends DELETE request with the current token', async () => {
		const FCMService = loadServiceClass();
		const service = FCMService.getInstance();
		await service.deregisterToken();
		await flush();

		expect(mockApiService.delete).toHaveBeenCalledWith('/accounts/fcm-token/', {
			data: { token: 'fcm-token-abc' },
		});
	});

	it('deregisterToken: does not throw on API error', async () => {
		mockApiService.delete.mockRejectedValue(new Error('net error'));
		const FCMService = loadServiceClass();
		await expect(FCMService.getInstance().deregisterToken()).resolves.not.toThrow();
	});
});
