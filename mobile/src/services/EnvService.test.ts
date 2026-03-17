export {};
const mockConfig: Record<string, any> = {};
const mockGeneratedEnv: Record<string, string> = {};

jest.mock('react-native-config', () => mockConfig);
jest.mock('../env.generated', () => mockGeneratedEnv);

describe('EnvService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		for (const key of Object.keys(mockConfig)) delete mockConfig[key];
		for (const key of Object.keys(mockGeneratedEnv)) delete mockGeneratedEnv[key];
	});

	const loadService = () => {
		const envService = require('./EnvService').default;
		return envService;
	};

	it('prefers react-native-config value, then generated env, then default', () => {
		mockConfig.REACT_APP_NAME = 'FromConfig';
		mockGeneratedEnv.REACT_APP_NAME = 'FromGenerated';
		const envService = loadService();

		expect(envService.get('REACT_APP_NAME', 'Fallback')).toBe('FromConfig');

		delete mockConfig.REACT_APP_NAME;
		expect(envService.get('REACT_APP_NAME', 'Fallback')).toBe('FromGenerated');

		delete mockGeneratedEnv.REACT_APP_NAME;
		expect(envService.get('REACT_APP_NAME', 'Fallback')).toBe('Fallback');
	});

	it('parses boolean and number values with defaults', () => {
		const envService = loadService();

		mockConfig.REACT_APP_ENABLE_SIGNUP = 'yes';
		expect(envService.getBoolean('REACT_APP_ENABLE_SIGNUP', false)).toBe(true);

		mockConfig.REACT_APP_ENABLE_SIGNUP = '0';
		expect(envService.getBoolean('REACT_APP_ENABLE_SIGNUP', true)).toBe(false);

		mockConfig.REACT_APP_WS_BACKEND_PORT = '9000';
		expect(envService.getNumber('REACT_APP_WS_BACKEND_PORT', 0)).toBe(9000);

		mockConfig.REACT_APP_WS_BACKEND_PORT = 'not-a-number';
		expect(envService.getNumber('REACT_APP_WS_BACKEND_PORT', 7000)).toBe(7000);
	});

	it('returns grouped app and feature configuration', () => {
		const envService = loadService();

		Object.assign(mockConfig, {
			REACT_APP_NAME: 'Qualitick',
			REACT_APP_VERSION: '1.0.0',
			REACT_APP_BACKEND_ENDPOINT: 'https://api.example.com',
			REACT_APP_DEFAULT_COUNTRY_CODE: 'US',
			REACT_APP_IS_TEST: 'true',
			REACT_APP_PIPLINE: 'dev',
			REACT_APP_DISABLE_LOG_MESSAGE: 'false',
			REACT_APP_ENABLE_SIGNUP: 'true',
			REACT_APP_ENABLE_GOOGLE_LOGIN: '1',
			REACT_APP_ENABLE_FACEBOOK_LOGIN: '0',
			REACT_APP_ENABLE_APPLE_LOGIN: 'no',
			REACT_APP_ENABLE_EMAIL_VERIFICATION: 'yes',
		});

		expect(envService.getAppConfig()).toEqual({
			name: 'Qualitick',
			version: '1.0.0',
			backendEndpoint: 'https://api.example.com',
			defaultCountryCode: 'US',
			isTest: true,
			pipeline: 'dev',
			disableLogMessage: false,
		});

		expect(envService.getFeatureFlags()).toEqual({
			enableSignup: true,
			enableGoogleLogin: true,
			enableFacebookLogin: false,
			enableAppleLogin: false,
			enableEmailVerification: true,
		});
	});

	it('returns composed configuration groups', () => {
		const envService = loadService();

		Object.assign(mockConfig, {
			REACT_APP_FIREBASE_WEB_API_KEY: 'api-key',
			REACT_APP_FIREBASE_WEB_AUTH_DOMAIN: 'auth-domain',
			REACT_APP_FIREBASE_WEB_PROJECT_ID: 'project-id',
			REACT_APP_FIREBASE_WEB_STORAGE_BUCKET: 'bucket',
			REACT_APP_FIREBASE_WEB_MESSAGING_SENDER_ID: 'sender',
			REACT_APP_FIREBASE_WEB_APP_ID: 'app-id',
			REACT_APP_FIREBASE_WEB_MEASUREMENT_ID: 'measure',
			REACT_APP_FIREBASE_VAPID_KEY: 'vapid',
			REACT_APP_GOOGLE_SIGN_IN_ANDROID_CLIENT_ID: 'ga',
			REACT_APP_GOOGLE_SIGN_IN_IOS_CLIENT_ID: 'gi',
			REACT_APP_GOOGLE_SIGN_IN_WEB_CLIENT_ID: 'gw',
			REACT_APP_FACEBOOK_SIGN_IN_ANDROID_CLIENT_ID: 'fa',
			REACT_APP_FACEBOOK_SIGN_IN_IOS_CLIENT_ID: 'fi',
			REACT_APP_FACEBOOK_SIGN_IN_WEB_CLIENT_ID: 'fw',
			REACT_APP_APPLE_SIGN_IN_ANDROID_CLIENT_ID: 'aa',
			REACT_APP_APPLE_SIGN_IN_IOS_CLIENT_ID: 'ai',
			REACT_APP_APPLE_SIGN_IN_WEB_CLIENT_ID: 'aw',
			REACT_APP_USE_WEBSOCKETS: 'true',
			REACT_APP_WS_BACKEND_HOST: 'localhost',
			REACT_APP_WS_BACKEND_PORT: '9000',
			REACT_APP_SUPPORT_EMAIL: 'support@example.com',
			REACT_APP_SOCIAL_FACEBOOK_URL: 'fb',
			REACT_APP_SOCIAL_TWITTER_URL: 'tw',
			REACT_APP_SOCIAL_INSTAGRAM_URL: 'ig',
			REACT_APP_SOCIAL_TIKTOK_URL: 'tt',
			REACT_APP_SOCIAL_YOUTUBE_URL: 'yt',
			REACT_APP_SOCIAL_LINKEDIN_URL: 'li',
			REACT_APP_ENCRYPTION_KEY: 'enc',
			REACT_APP_ENABLE_GOOGLE_LOGIN: 'true',
			REACT_APP_ENABLE_FACEBOOK_LOGIN: 'false',
			REACT_APP_ENABLE_APPLE_LOGIN: 'true',
		});

		expect(envService.getFirebaseConfig().apiKey).toBe('api-key');
		expect(envService.getSocialConfig().google.enabled).toBe(true);
		expect(envService.getSocialConfig().facebook.enabled).toBe(false);
		expect(envService.getWebSocketConfig()).toEqual({
			enabled: true,
			host: 'localhost',
			port: '9000',
		});
		expect(envService.getContactInfo()).toEqual({ supportEmail: 'support@example.com' });
		expect(envService.getSocialMediaLinks().youtube).toBe('yt');
		expect(envService.getSecurityConfig()).toEqual({ encryptionKey: 'enc' });
		expect(envService.getAllConfig()).toMatchObject({
			app: expect.any(Object),
			features: expect.any(Object),
			firebase: expect.any(Object),
			social: expect.any(Object),
			websocket: expect.any(Object),
			contact: expect.any(Object),
			socialMedia: expect.any(Object),
			security: expect.any(Object),
		});
	});

	it('supports mode helper methods', () => {
		const envService = loadService();
		mockConfig.REACT_APP_IS_TEST = 'true';

		expect(envService.isDevelopment()).toBe(__DEV__);
		expect(envService.isTest()).toBe(true);
	});
});

