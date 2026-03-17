export {};
const mockPlatform = { OS: 'ios' };
const mockConfig = {
	features: {
		enableGoogleLogin: true,
		enableFacebookLogin: true,
		enableAppleLogin: true,
	},
	social: {
		google: {
			webClientId: 'test.apps.googleusercontent.com',
			iosClientId: 'ios-client-id',
		},
	},
};

const mockGoogleSignin = {
	configure: jest.fn(),
	hasPlayServices: jest.fn(),
	signIn: jest.fn(),
	signOut: jest.fn(),
};

const mockStatusCodes = {
	SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
	IN_PROGRESS: 'IN_PROGRESS',
	PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

const mockGoogleCredential = { provider: 'google' };
const mockFirebaseUser = {
	getIdToken: jest.fn(),
};
const mockAuthClient = {
	signInWithCredential: jest.fn(),
	signOut: jest.fn(),
	currentUser: null as any,
};

const mockAuthFactory: any = jest.fn(() => mockAuthClient);
mockAuthFactory.GoogleAuthProvider = {
	credential: jest.fn(() => mockGoogleCredential),
};

jest.mock('react-native', () => ({
	Platform: mockPlatform,
}));

jest.mock('../config/config', () => ({
	__esModule: true,
	default: mockConfig,
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
	GoogleSignin: mockGoogleSignin,
	statusCodes: mockStatusCodes,
}));

jest.mock('@react-native-firebase/auth', () => ({
	__esModule: true,
	default: mockAuthFactory,
}));

describe('SocialAuthService', () => {
	const loadServiceClass = () => require('./SocialAuthService').default;
	const flush = () => new Promise<void>(resolve => setImmediate(resolve));

	beforeEach(() => {
		jest.clearAllMocks();
		mockPlatform.OS = 'ios';

		mockConfig.features.enableGoogleLogin = true;
		mockConfig.features.enableFacebookLogin = true;
		mockConfig.features.enableAppleLogin = true;
		mockConfig.social.google.webClientId = 'test.apps.googleusercontent.com';
		mockConfig.social.google.iosClientId = 'ios-client-id';

		mockGoogleSignin.configure.mockResolvedValue(undefined);
		mockGoogleSignin.hasPlayServices.mockResolvedValue(true);
		mockGoogleSignin.signOut.mockResolvedValue(undefined);

		mockFirebaseUser.getIdToken.mockResolvedValue('firebase-access-token');
		mockAuthClient.signInWithCredential.mockResolvedValue({ user: mockFirebaseUser });
		mockAuthClient.signOut.mockResolvedValue(undefined);
		mockAuthClient.currentUser = null;
	});

	afterEach(() => {
		jest.resetModules();
	});

	it('returns singleton instance', async () => {
		const SocialAuthService = loadServiceClass();
		const a = SocialAuthService.getInstance();
		const b = SocialAuthService.getInstance();
		await flush();

		expect(a).toBe(b);
		expect(mockGoogleSignin.configure).toHaveBeenCalled();
	});

	it('exposes provider availability based on config and platform', async () => {
		const SocialAuthService = loadServiceClass();
		const service = SocialAuthService.getInstance();
		await flush();

		expect(service.isGoogleSignInAvailable()).toBe(true);
		expect(service.isFacebookSignInAvailable()).toBe(true);
		expect(service.isAppleSignInAvailable()).toBe(true);
		expect(service.getAvailableProviders()).toEqual(['google', 'facebook', 'apple']);

		mockPlatform.OS = 'android';
		expect(service.isAppleSignInAvailable()).toBe(false);
	});

	it('signs in with Google and maps user payload', async () => {
		mockGoogleSignin.signIn.mockResolvedValue({
			data: {
				idToken: 'google-id-token',
				user: {
					id: 'user-1',
					email: 'user@example.com',
					givenName: 'John',
					familyName: 'Doe',
					name: 'John Doe',
					photo: 'https://img',
				},
			},
		});

		const SocialAuthService = loadServiceClass();
		const service = SocialAuthService.getInstance();
		await flush();

		const result = await service.signInWithGoogle();

		expect(mockGoogleSignin.hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
		expect(mockAuthFactory.GoogleAuthProvider.credential).toHaveBeenCalledWith('google-id-token');
		expect(mockAuthClient.signInWithCredential).toHaveBeenCalledWith(mockGoogleCredential);
		expect(result).toEqual({
			provider: 'google',
			user: {
				id: 'user-1',
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				name: 'John Doe',
				photo: 'https://img',
			},
			idToken: 'google-id-token',
			accessToken: 'firebase-access-token',
		});
	});

	it('maps known Google sign-in errors', async () => {
		mockGoogleSignin.signIn.mockRejectedValueOnce({ code: mockStatusCodes.SIGN_IN_CANCELLED });

		const SocialAuthService = loadServiceClass();
		const service = SocialAuthService.getInstance();
		await flush();

		await expect(service.signInWithGoogle()).rejects.toThrow('Google Sign-In was cancelled');
	});

	it('throws when Google sign-in is unavailable', async () => {
		mockConfig.features.enableGoogleLogin = false;
		const SocialAuthService = loadServiceClass();
		const service = SocialAuthService.getInstance();
		await flush();

		await expect(service.signInWithGoogle()).rejects.toThrow('Google Sign-In is not available');
	});

	it('supports sign out and current-user helpers', async () => {
		const SocialAuthService = loadServiceClass();
		const service = SocialAuthService.getInstance();
		await flush();

		mockAuthClient.currentUser = { uid: 'firebase-user' };
		expect(service.getCurrentUser()).toEqual({ uid: 'firebase-user' });
		expect(service.isSignedIn()).toBe(true);

		await service.signOut();
		expect(mockAuthClient.signOut).toHaveBeenCalled();
		expect(mockGoogleSignin.signOut).toHaveBeenCalled();

		await expect(service.signInWithFacebook()).rejects.toThrow('Facebook Sign-In not implemented yet');
		await expect(service.signInWithApple()).rejects.toThrow('Apple Sign-In not implemented yet');
	});
});

