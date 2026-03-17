import { Alert } from 'react-native';
import { ConsentManager } from './ConsentManager';

describe('ConsentManager', () => {
	const t = jest.fn((key: string, options?: any) => options?.defaultValue || key);

	beforeEach(() => {
		jest.clearAllMocks();
		(ConsentManager as any).instance = undefined;
	});

	it('returns singleton instance', () => {
		const a = ConsentManager.getInstance();
		const b = ConsentManager.getInstance();
		expect(a).toBe(b);
	});

	it('returns null for traditional flow', async () => {
		const manager = ConsentManager.getInstance();
		await expect(manager.showConsentFlow('traditional')).resolves.toBeNull();
	});

	it('returns null when oauth flow is called without translate initialization', async () => {
		const manager = ConsentManager.getInstance();
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(manager.showConsentFlow('oauth', { provider: 'Google' })).resolves.toBeNull();
		expect(warnSpy).toHaveBeenCalled();

		warnSpy.mockRestore();
	});

	it('resolves oauth consent when user accepts', async () => {
		const manager = ConsentManager.getInstance();
		manager.initialize({}, t as any);

		const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(
			(_title, _message, buttons) => {
				const acceptButton = buttons?.[2];
				if (acceptButton && 'onPress' in acceptButton && acceptButton.onPress) {
					acceptButton.onPress();
				}
			}
		);

		const consent = await manager.showConsentFlow('oauth', {
			provider: 'Google',
			email: 'user@example.com',
		});

		expect(alertSpy).toHaveBeenCalled();
		expect(consent).not.toBeNull();
		expect(consent?.consentMethod).toBe('oauth');
		expect(consent?.acceptTerms).toBe(true);
		expect(consent?.acceptPrivacy).toBe(true);
		expect(consent?.acceptCookies).toBe(true);
	});

	it('resolves oauth consent as null when user cancels', async () => {
		const manager = ConsentManager.getInstance();
		manager.initialize({}, t as any);

		const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(
			(_title, _message, buttons) => {
				const cancelButton = buttons?.[1];
				if (cancelButton && 'onPress' in cancelButton && cancelButton.onPress) {
					cancelButton.onPress();
				}
			}
		);

		await expect(manager.showConsentFlow('oauth', { provider: 'Google' })).resolves.toBeNull();
		expect(alertSpy).toHaveBeenCalled();
	});

	it('validates traditional consent with all required flags', () => {
		const manager = ConsentManager.getInstance();

		expect(
			manager.validateTraditionalConsent({
				acceptTerms: false,
				acceptPrivacy: true,
				acceptCookies: true,
			})
		).toBeNull();

		const valid = manager.validateTraditionalConsent({
			acceptTerms: true,
			acceptPrivacy: true,
			acceptCookies: true,
		});
		expect(valid?.consentMethod).toBe('traditional');
		expect(valid?.acceptTerms).toBe(true);
	});

	it('supports progressive consent placeholder, recording, and refresh comparison', async () => {
		const manager = ConsentManager.getInstance();

		await expect(manager.showProgressiveConsent(['terms'])).resolves.toBeNull();

		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
		manager.recordConsent(
			{
				acceptTerms: true,
				acceptPrivacy: true,
				acceptCookies: true,
				consentTimestamp: '2024-01-01T00:00:00.000Z',
				consentMethod: 'traditional',
			},
			'u1'
		);
		expect(logSpy).toHaveBeenCalled();
		logSpy.mockRestore();

		expect(manager.needsConsentRefresh('2024-01-01T00:00:00.000Z', '2024-02-01T00:00:00.000Z')).toBe(true);
		expect(manager.needsConsentRefresh('2024-03-01T00:00:00.000Z', '2024-02-01T00:00:00.000Z')).toBe(false);
	});
});

