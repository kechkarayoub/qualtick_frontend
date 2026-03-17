export {};

const mockConfig = {
	wsEndpoint: 'ws://localhost:9000',
};

const mockDeviceIdService = {
	getDeviceId: jest.fn(),
};

const mockSecureStorage = {
	getSessionItem: jest.fn(),
	getSecureItem: jest.fn(),
	getItem: jest.fn(),
};

const wsInstances: MockWebSocket[] = [];

class MockWebSocket {
	static OPEN = 1;
	static CLOSED = 3;

	public url: string;
	public readyState = 0;
	public onopen: (() => void) | null = null;
	public onerror: (() => void) | null = null;
	public onclose: ((event: { code: number; reason: string }) => void) | null = null;
	public onmessage: ((event: { data: string }) => void) | null = null;

	public send = jest.fn();
	public close = jest.fn(() => {
		this.readyState = MockWebSocket.CLOSED;
		this.onclose?.({ code: 1000, reason: 'closed' });
	});

	constructor(url: string) {
		this.url = url;
		wsInstances.push(this);
	}

	triggerOpen() {
		this.readyState = MockWebSocket.OPEN;
		this.onopen?.();
	}

	triggerError() {
		this.onerror?.();
	}

	triggerClose(code = 1000, reason = 'closed') {
		this.readyState = MockWebSocket.CLOSED;
		this.onclose?.({ code, reason });
	}

	triggerMessage(payload: any) {
		const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
		this.onmessage?.({ data });
	}
}

jest.mock('../config/config', () => ({
	__esModule: true,
	default: mockConfig,
}));

jest.mock('./DeviceIdService', () => ({
	__esModule: true,
	default: {
		getInstance: jest.fn(() => mockDeviceIdService),
	},
}));

jest.mock('./SecureStorageService', () => ({
	__esModule: true,
	default: {
		getInstance: jest.fn(() => mockSecureStorage),
	},
}));

describe('WebSocketService', () => {
	const loadServiceClass = () => require('./WebSocketService').default;
	const waitForSocket = async (): Promise<MockWebSocket> => {
		for (let i = 0; i < 10; i += 1) {
			if (wsInstances[0]) {
				return wsInstances[0];
			}
			await Promise.resolve();
		}
		throw new Error('Socket was not created');
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		wsInstances.length = 0;
		(global as any).WebSocket = MockWebSocket;

		mockDeviceIdService.getDeviceId.mockResolvedValue('device-1');
		mockSecureStorage.getSessionItem.mockImplementation(async (key: string) => {
			if (key === 'access_token') return 'session-token';
			if (key === 'user') return JSON.stringify({ id: 42 });
			return null;
		});
		mockSecureStorage.getSecureItem.mockResolvedValue(null);
		mockSecureStorage.getItem.mockResolvedValue(null);
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		jest.resetModules();
	});

	it('connects with auth context and updates connection state', async () => {
		const WebSocketService = loadServiceClass();
		const service = WebSocketService.getInstance();

		const stateHandler = jest.fn();
		const unsubscribe = service.onConnectionStateChange(stateHandler);

		const connectPromise = service.connect();
		const socket = await waitForSocket();
		expect(wsInstances).toHaveLength(1);
		expect(socket.url).toContain('/ws/profile/42/');
		expect(socket.url).toContain('token=session-token');
		expect(socket.url).toContain('deviceId=device-1');

		socket.triggerOpen();
		await connectPromise;

		expect(service.getConnectionState().isConnected).toBe(true);
		expect(stateHandler).toHaveBeenCalled();
		unsubscribe();
	});

	it('returns error state when auth context is missing', async () => {
		mockSecureStorage.getSessionItem.mockResolvedValue(null);
		mockSecureStorage.getSecureItem.mockResolvedValue(null);

		const WebSocketService = loadServiceClass();
		const service = WebSocketService.getInstance();
		await service.connect();

		expect(service.getConnectionState()).toMatchObject({
			isConnected: false,
			isConnecting: false,
			error: 'Missing auth context for WebSocket connection',
		});
		expect(wsInstances).toHaveLength(0);
	});

	it('sends payload when connected and throws when disconnected', async () => {
		const WebSocketService = loadServiceClass();
		const service = WebSocketService.getInstance();

		const connectPromise = service.connect();
		const socket = await waitForSocket();
		socket.triggerOpen();
		await connectPromise;

		await service.send('profile_update', { name: 'A' });
		expect(socket.send).toHaveBeenCalled();
		const payload = JSON.parse((socket.send as jest.Mock).mock.calls[0][0]);
		expect(payload.type).toBe('profile_update');
		expect(payload.data).toEqual({ name: 'A' });
		expect(payload.deviceId).toBe('device-1');

		service.disconnect();
		await expect(service.send('x', {})).rejects.toThrow('WebSocket is not connected');
	});

	it('emits typed and wildcard message handlers and handles auth_error', async () => {
		const WebSocketService = loadServiceClass();
		const service = WebSocketService.getInstance();
		const logout = jest.fn();
		service.setLogoutHandler(logout);

		const typed = jest.fn();
		const wildcard = jest.fn();
		service.onMessage('profile_updated', typed);
		service.onMessage('*', wildcard);

		const connectPromise = service.connect();
		const socket = await waitForSocket();
		socket.triggerOpen();
		await connectPromise;

		socket.triggerMessage({ type: 'profile_updated', data: { ok: true } });
		expect(typed).toHaveBeenCalledWith({ type: 'profile_updated', data: { ok: true } });
		expect(wildcard).toHaveBeenCalledWith({ type: 'profile_updated', data: { ok: true } });

		socket.triggerMessage({
			type: 'auth_error',
			error: 'invalid_token',
			message: 'Token invalid',
			data: null,
		});
		await Promise.resolve();

		expect(logout).toHaveBeenCalled();
		expect(service.getConnectionState().error).toBe('Token invalid');
	});

	it('triggers reconnect attempt on non-auth close and supports explicit disconnect', async () => {
		const WebSocketService = loadServiceClass();
		const service = WebSocketService.getInstance();

		const connectPromise = service.connect();
		const socket = await waitForSocket();
		socket.triggerOpen();
		await connectPromise;

		socket.triggerClose(1006, 'abnormal');
		expect(service.getConnectionState().reconnectAttempts).toBe(1);

		jest.runOnlyPendingTimers();
		expect(service.getConnectionState().reconnectAttempts).toBeGreaterThanOrEqual(1);

		service.disconnect();
		expect(service.getConnectionState()).toMatchObject({
			isConnected: false,
			isConnecting: false,
			error: null,
			reconnectAttempts: 0,
		});
	});
});

