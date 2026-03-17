export {};

const mockDeviceIdService = {
	getDeviceId: jest.fn(),
};

let requestInterceptor: ((config: any) => Promise<any>) | undefined;

const axiosInstance: any = {
	interceptors: {
		request: {
			use: jest.fn((onFulfilled: any) => {
				requestInterceptor = onFulfilled;
			}),
		},
	},
	get: jest.fn(),
	post: jest.fn(),
	put: jest.fn(),
	patch: jest.fn(),
	delete: jest.fn(),
};

const mockAxiosCreate = jest.fn(() => axiosInstance);

jest.mock('axios', () => ({
	__esModule: true,
	default: {
		create: mockAxiosCreate,
	},
}));

jest.mock('../config/config', () => ({
	__esModule: true,
	default: {
		backendEndpoint: 'https://api.example.com',
		apiTimeout: 20000,
	},
}));

jest.mock('./DeviceIdService', () => ({
	__esModule: true,
	default: {
		getInstance: jest.fn(() => mockDeviceIdService),
	},
}));

describe('UnauthenticatedApiService', () => {
	const loadServiceClass = () => require('./UnauthenticatedApiService').default;

	beforeEach(() => {
		jest.clearAllMocks();
		requestInterceptor = undefined;
		mockDeviceIdService.getDeviceId.mockResolvedValue('device-123');

		axiosInstance.get.mockResolvedValue({ data: { ok: true } });
		axiosInstance.post.mockResolvedValue({ data: { ok: true } });
		axiosInstance.put.mockResolvedValue({ data: { ok: true } });
		axiosInstance.patch.mockResolvedValue({ data: { ok: true } });
		axiosInstance.delete.mockResolvedValue({ data: { ok: true } });

		loadServiceClass().getInstance();
	});

	afterEach(() => {
		jest.resetModules();
	});

	it('returns singleton instance and initializes axios', () => {
		const UnauthenticatedApiService = loadServiceClass();
		const a = UnauthenticatedApiService.getInstance();
		const b = UnauthenticatedApiService.getInstance();

		expect(a).toBe(b);
		expect(mockAxiosCreate).toHaveBeenCalledWith({
			baseURL: 'https://api.example.com',
			timeout: 20000,
		});
		expect(axiosInstance.interceptors.request.use).toHaveBeenCalled();
	});

	it('request interceptor adds device id and json content type', async () => {
		const config = { headers: {}, data: { foo: 'bar' } };
		const result = await requestInterceptor!(config);

		expect(mockDeviceIdService.getDeviceId).toHaveBeenCalled();
		expect(result.headers['X-Device-ID']).toBe('device-123');
		expect(result.headers['Content-Type']).toBe('application/json');
	});

	it('keeps existing content type untouched', async () => {
		const config = {
			headers: { 'Content-Type': 'multipart/form-data' },
			data: { foo: 'bar' },
		};
		const result = await requestInterceptor!(config);

		expect(result.headers['Content-Type']).toBe('multipart/form-data');
	});

	it('proxies http methods to axios instance', async () => {
		const UnauthenticatedApiService = loadServiceClass();
		const service = UnauthenticatedApiService.getInstance();

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
});

