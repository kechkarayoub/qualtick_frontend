const mockLinking = {
	getInitialURL: jest.fn(),
	addEventListener: jest.fn(),
};

jest.mock('react-native', () => ({
	Linking: mockLinking,
}));

describe('DeepLinkingService', () => {
	const buildNavRef = () => ({
		current: {
			navigate: jest.fn(),
		},
	}) as any;

	const loadService = () => require('./DeepLinkingService').default;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		jest.resetModules();
	});

	it('parses reset password and email verification URLs', () => {
		const service = loadService();

		expect(
			service.parseResetPasswordUrl('https://example.com/auth/reset-password?uid=u1&token=t1')
		).toEqual({ uid: 'u1', token: 't1' });
		expect(service.parseResetPasswordUrl('https://example.com/auth/reset-password?uid=u1')).toBeNull();

		expect(
			service.parseEmailVerificationUrl('https://example.com/verify-email?uid=u2&token=t2')
		).toEqual({ uid: 'u2', token: 't2' });
		expect(service.parseEmailVerificationUrl('https://example.com/verify-email?token=t2')).toBeNull();
	});

	it('queues URL until navigation is ready and then processes it', async () => {
		const service = loadService();
		const navRef = buildNavRef();
		service.setNavigationRef(navRef);

		await service.handleUrl('https://example.com/auth/reset-password?uid=u1&token=t1');
		expect(navRef.current.navigate).not.toHaveBeenCalled();

		service.onNavigationReady();
		jest.runAllTimers();

		expect(navRef.current.navigate).toHaveBeenCalledWith('AuthStack', {
			screen: 'ResetPassword',
			params: { uid: 'u1', token: 't1' },
		});
	});

	it('logs out authenticated user before navigating to reset password', async () => {
		const service = loadService();
		const navRef = buildNavRef();
		const logout = jest.fn().mockResolvedValue(undefined);

		service.setNavigationRef(navRef);
		service.onNavigationReady();
		service.setAuthState(true, logout);

		await service.handleUrl('https://example.com/auth/reset-password?uid=u1&token=t1');
		expect(logout).toHaveBeenCalledTimes(1);

		jest.runAllTimers();
		expect(navRef.current.navigate).toHaveBeenCalledWith('AuthStack', {
			screen: 'ResetPassword',
			params: { uid: 'u1', token: 't1' },
		});
	});

	it('navigates to email verification and unknown urls fallback to NotFound', async () => {
		const service = loadService();
		const navRef = buildNavRef();

		service.setNavigationRef(navRef);
		service.onNavigationReady();

		await service.handleUrl('https://example.com/verify-email?uid=u2&token=t2');
		jest.runAllTimers();
		expect(navRef.current.navigate).toHaveBeenCalledWith('AuthStack', {
			screen: 'VerifyEmail',
			params: { uid: 'u2', token: 't2' },
		});

		await service.handleUrl('https://example.com/unknown/path');
		jest.runAllTimers();
		expect(navRef.current.navigate).toHaveBeenCalledWith('NotFound');
	});

	it('initializes deep link listeners and returns cleanup function', async () => {
		const remove = jest.fn();
		let listener: ((event: { url: string }) => void) | undefined;

		mockLinking.getInitialURL.mockResolvedValue('https://example.com/auth/reset-password?uid=u1&token=t1');
		mockLinking.addEventListener.mockImplementation((_event: string, cb: any) => {
			listener = cb;
			return { remove };
		});

		const service = loadService();
		const handleSpy = jest.spyOn(service, 'handleUrl');

		const cleanup = service.init();
		await Promise.resolve();
		expect(handleSpy).toHaveBeenCalledWith('https://example.com/auth/reset-password?uid=u1&token=t1');

		listener?.({ url: 'https://example.com/verify-email?uid=u2&token=t2' });
		expect(handleSpy).toHaveBeenCalledWith('https://example.com/verify-email?uid=u2&token=t2');

		cleanup();
		expect(remove).toHaveBeenCalledTimes(1);
	});
});

