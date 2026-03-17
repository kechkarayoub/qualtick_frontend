export {};

const mockToastShow = jest.fn();
const mockT = jest.fn((key: string) => key);

const mockDeviceIdService = {
	getDeviceId: jest.fn(),
};

const mockSecureStorage = {
	getSessionItem: jest.fn(),
	getSecureItem: jest.fn(),
	setSessionItem: jest.fn(),
	setSecureItem: jest.fn(),
	removeSessionItem: jest.fn(),
	removeSecureItem: jest.fn(),
	removeItem: jest.fn(),
};

let requestInterceptor: ((config: any) => Promise<any>) | undefined;
let responseErrorInterceptor: ((error: any) => Promise<any>) | undefined;

const axiosInstance: any = jest.fn();
axiosInstance.interceptors = {
	request: {
		use: jest.fn((onFulfilled: any) => {
			requestInterceptor = onFulfilled;
		}),
	},
	response: {
		use: jest.fn((_onSuccess: any, onError: any) => {
			responseErrorInterceptor = onError;
		}),
	},
};
axiosInstance.get = jest.fn();
axiosInstance.post = jest.fn();
axiosInstance.put = jest.fn();
axiosInstance.patch = jest.fn();
axiosInstance.delete = jest.fn();

const mockAxiosCreate = jest.fn(() => axiosInstance);
const mockAxiosPost = jest.fn();

jest.mock('axios', () => ({
	__esModule: true,
	default: {
		create: mockAxiosCreate,
		post: mockAxiosPost,
	},
}));

jest.mock('react-native', () => ({
	Platform: { OS: 'ios' },
}));

jest.mock('react-native-toast-message', () => ({
	__esModule: true,
	default: {
		show: mockToastShow,
	},
}));

jest.mock('i18next', () => ({
	t: (key: string) => mockT(key),
}));

jest.mock('../config/config', () => ({
	__esModule: true,
	default: {
		backendEndpoint: 'https://api.example.com',
		apiTimeout: 30000,
	},
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

describe('AuthenticatedApiService', () => {
	const loadServiceClass = () => require('./AuthenticatedApiService').default;

	beforeEach(() => {
		jest.clearAllMocks();
		requestInterceptor = undefined;
		responseErrorInterceptor = undefined;

		mockDeviceIdService.getDeviceId.mockResolvedValue('device-1');
		mockSecureStorage.getSessionItem.mockResolvedValue(null);
		mockSecureStorage.getSecureItem.mockResolvedValue(null);
		mockSecureStorage.setSessionItem.mockResolvedValue(undefined);
		mockSecureStorage.setSecureItem.mockResolvedValue(undefined);
		mockSecureStorage.removeSessionItem.mockResolvedValue(undefined);
		mockSecureStorage.removeSecureItem.mockResolvedValue(undefined);
		mockSecureStorage.removeItem.mockResolvedValue(undefined);

		axiosInstance.mockResolvedValue({ data: { ok: true } });
		axiosInstance.get.mockResolvedValue({ data: { ok: true } });
		axiosInstance.post.mockResolvedValue({ data: { ok: true } });
		axiosInstance.put.mockResolvedValue({ data: { ok: true } });
		axiosInstance.patch.mockResolvedValue({ data: { ok: true } });
		axiosInstance.delete.mockResolvedValue({ data: { ok: true } });

		mockAxiosPost.mockResolvedValue({
			data: {
				access: 'new-access',
				refresh: 'new-refresh',
			},
		});

		loadServiceClass().getInstance();
	});

	afterEach(() => {
		jest.resetModules();
	});

	it('creates singleton and sets axios interceptors', () => {
		const AuthenticatedApiService = loadServiceClass();
		const a = AuthenticatedApiService.getInstance();
		const b = AuthenticatedApiService.getInstance();

		expect(a).toBe(b);
		expect(mockAxiosCreate).toHaveBeenCalledWith({
			baseURL: 'https://api.example.com',
			timeout: 30000,
		});
		expect(axiosInstance.interceptors.request.use).toHaveBeenCalled();
		expect(axiosInstance.interceptors.response.use).toHaveBeenCalled();
	});

	it('request interceptor attaches device id, platform, auth token and content type', async () => {
		mockSecureStorage.getSessionItem.mockResolvedValueOnce('session-access');

		const requestConfig = { headers: {}, data: { hello: 'world' } };
		const updated = await requestInterceptor!(requestConfig);

		expect(mockDeviceIdService.getDeviceId).toHaveBeenCalled();
		expect(updated.headers['X-Device-ID']).toBe('device-1');
		expect(updated.headers['X-Platform']).toBe('ios');
		expect(updated.headers.Authorization).toBe('Bearer session-access');
		expect(updated.headers['Content-Type']).toBe('application/json');
	});

	it('retries once on 401 with refreshed token', async () => {
		mockSecureStorage.getSessionItem
			.mockResolvedValueOnce('refresh-token')
			.mockResolvedValueOnce('existing-session-access');

		const originalRequest = { _retry: false, headers: {} as any };
		const error = { response: { status: 401 }, config: originalRequest };

		await responseErrorInterceptor!(error);

		expect(mockAxiosPost).toHaveBeenCalledWith(
			'https://api.example.com/accounts/api/token/refresh/',
			{ refresh: 'refresh-token' }
		);
		expect(mockSecureStorage.setSessionItem).toHaveBeenCalledWith('access_token', 'new-access');
		expect(mockSecureStorage.setSessionItem).toHaveBeenCalledWith('refresh_token', 'new-refresh');
		expect(axiosInstance).toHaveBeenCalledWith(originalRequest);
		expect((originalRequest.headers as any).Authorization).toBe('Bearer new-access');
	});

	it('handles already retried 401 by clearing session and invoking callback', async () => {
		const AuthenticatedApiService = loadServiceClass();
		const service = AuthenticatedApiService.getInstance();
		const onSessionExpired = jest.fn();
		service.onSessionExpired = onSessionExpired;

		const error = { response: { status: 401 }, config: { _retry: true, headers: {} } };
		await expect(responseErrorInterceptor!(error)).rejects.toBe(error);

		expect(mockSecureStorage.removeSecureItem).toHaveBeenCalledWith('access_token');
		expect(mockSecureStorage.removeSecureItem).toHaveBeenCalledWith('refresh_token');
		expect(mockSecureStorage.removeSessionItem).toHaveBeenCalledWith('access_token');
		expect(mockSecureStorage.removeSessionItem).toHaveBeenCalledWith('refresh_token');
		expect(mockSecureStorage.removeSessionItem).toHaveBeenCalledWith('user');
		expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('user');
		expect(onSessionExpired).toHaveBeenCalled();
		expect(mockToastShow).toHaveBeenCalled();
	});

	it('handles network errors with toast and rejects error', async () => {
		const error = { request: {}, config: { headers: {} } };
		await expect(responseErrorInterceptor!(error)).rejects.toBe(error);
		expect(mockToastShow).toHaveBeenCalled();
	});

	it('proxies http verbs to axios instance', async () => {
		const AuthenticatedApiService = loadServiceClass();
		const service = AuthenticatedApiService.getInstance();

		await service.get('/a');
		await service.post('/b', { x: 1 });
		await service.put('/c', { x: 1 });
		await service.patch('/d', { x: 1 });
		await service.delete('/e');

		expect(axiosInstance.get).toHaveBeenCalledWith('/a', undefined);
		expect(axiosInstance.post).toHaveBeenCalledWith('/b', { x: 1 }, undefined);
		expect(axiosInstance.put).toHaveBeenCalledWith('/c', { x: 1 }, undefined);
		expect(axiosInstance.patch).toHaveBeenCalledWith('/d', { x: 1 }, undefined);
		expect(axiosInstance.delete).toHaveBeenCalledWith('/e', undefined);
	});

	it('sets, clears and checks tokens with storage fallbacks', async () => {
		const AuthenticatedApiService = loadServiceClass();
		const service = AuthenticatedApiService.getInstance();

		await service.setTokens({ accessToken: 'a1', refreshToken: 'r1' }, true);
		expect(mockSecureStorage.setSessionItem).toHaveBeenCalledWith('access_token', 'a1');
		expect(mockSecureStorage.setSessionItem).toHaveBeenCalledWith('refresh_token', 'r1');

		await service.setTokens({ accessToken: 'a2', refreshToken: 'r2' }, false);
		expect(mockSecureStorage.setSecureItem).toHaveBeenCalledWith('access_token', 'a2');
		expect(mockSecureStorage.setSecureItem).toHaveBeenCalledWith('refresh_token', 'r2');

		await service.clearTokens();
		expect(mockSecureStorage.removeSecureItem).toHaveBeenCalledWith('access_token');
		expect(mockSecureStorage.removeSecureItem).toHaveBeenCalledWith('refresh_token');
		expect(mockSecureStorage.removeSessionItem).toHaveBeenCalledWith('access_token');
		expect(mockSecureStorage.removeSessionItem).toHaveBeenCalledWith('refresh_token');

		mockSecureStorage.getSessionItem.mockResolvedValueOnce(null);
		mockSecureStorage.getSecureItem.mockResolvedValueOnce('secure-token');
		await expect(service.hasValidToken()).resolves.toBe(true);

		mockSecureStorage.getSessionItem.mockResolvedValueOnce(null);
		mockSecureStorage.getSecureItem.mockResolvedValueOnce(null);
		await expect(service.hasValidToken()).resolves.toBe(false);
	});

	it('logout sends refresh token to backend when available and swallows api errors', async () => {
		const AuthenticatedApiService = loadServiceClass();
		const service = AuthenticatedApiService.getInstance();

		mockSecureStorage.getSessionItem.mockResolvedValueOnce('refresh-1');
		await service.logout({ reason: 'manual' });
		expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/logout/', {
			reason: 'manual',
			refresh_token: 'refresh-1',
		});

		axiosInstance.post.mockRejectedValueOnce(new Error('logout failed'));
		mockSecureStorage.getSessionItem.mockResolvedValueOnce('refresh-2');
		await expect(service.logout({})).resolves.toBeUndefined();
	});
});

