const mockEnv = {
	get: jest.fn(),
	getAppConfig: jest.fn(),
	getSocialConfig: jest.fn(),
	getFirebaseConfig: jest.fn(),
	getFeatureFlags: jest.fn(),
	getBoolean: jest.fn(),
	getContactInfo: jest.fn(),
	getSocialMediaLinks: jest.fn(),
	getSecurityConfig: jest.fn(),
	getWebSocketConfig: jest.fn(),
};

jest.mock('../services/EnvService', () => ({
	__esModule: true,
	default: mockEnv,
}));

describe('config', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();

		(global as any).__DEV__ = false;

		mockEnv.get.mockImplementation((key: string, fallback?: string) => {
			if (key === 'REACT_APP_BACKEND_ENDPOINT') return 'https://api.example.com';
			if (key === 'REACT_APP_WS_BACKEND_HOST') return 'ws.example.com';
			if (key === 'REACT_APP_WS_BACKEND_PORT') return '9100';
			if (key === 'REACT_APP_DEFAULT_COUNTRY_CODE') return 'MA';
			return fallback ?? '';
		});

		mockEnv.getAppConfig.mockReturnValue({ name: 'Qualitick', version: '1.0.0' });
		mockEnv.getSocialConfig.mockReturnValue({ google: { enabled: true } });
		mockEnv.getFirebaseConfig.mockReturnValue({ projectId: 'test-project' });
		mockEnv.getFeatureFlags.mockReturnValue({ enableSignup: true });
		mockEnv.getContactInfo.mockReturnValue({ supportEmail: 'support@qualitick.com' });
		mockEnv.getSocialMediaLinks.mockReturnValue({ facebook: 'https://fb.example.com' });
		mockEnv.getSecurityConfig.mockReturnValue({ encryptionKey: 'secret' });
		mockEnv.getWebSocketConfig.mockReturnValue({ enabled: true, host: 'ws.example.com', port: '9100' });

		mockEnv.getBoolean.mockImplementation((key: string) => {
			if (key === 'REACT_APP_ENABLE_GOOGLE_LOGIN') return true;
			if (key === 'REACT_APP_ENABLE_FACEBOOK_LOGIN') return false;
			if (key === 'REACT_APP_ENABLE_APPLE_LOGIN') return false;
			return false;
		});
	});

	it('builds config values from EnvService', () => {
		const config = require('./config').default;

		expect(config.backendEndpoint).toBe('https://api.example.com');
		expect(config.wsEndpoint).toBe('ws://ws.example.com:9100');
		expect(config.apiTimeout).toBe(30000);
		expect(config.app).toEqual({ name: 'Qualitick', version: '1.0.0' });
		expect(config.social).toEqual({ google: { enabled: true } });
		expect(config.firebase).toEqual({ projectId: 'test-project' });
		expect(config.regional.defaultCountryCode).toBe('MA');
		expect(config.contact).toEqual({ supportEmail: 'support@qualitick.com' });
	});

	it('computes enableSocialLogin from provider flags', () => {
		const config = require('./config').default;
		expect(config.features.enableSocialLogin).toBe(true);

		mockEnv.getBoolean.mockReturnValue(false);
		jest.resetModules();
		const configNoSocial = require('./config').default;
		expect(configNoSocial.features.enableSocialLogin).toBe(false);
	});

	it('exposes validation and ui defaults', () => {
		const config = require('./config').default;
		expect(config.validation.password.minLength).toBe(6);
		expect(config.validation.username.maxLength).toBe(30);
		expect(config.ui.animations.duration).toBe(300);
		expect(config.ui.loading.timeout).toBe(10000);
	});
});
