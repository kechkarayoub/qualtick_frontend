import modalContentProvider, {
	getAboutUs,
	getContact,
	getCookiesPolicy,
	getFeatures,
	getHelpCenter,
	getPrivacyPolicy,
	getTermsOfService,
	modals,
} from './index';

describe('shared content index provider', () => {
	it('returns content for known modals and null for unknown ids', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

		const about = modalContentProvider.getModalContent('about-us');
		const unknown = modalContentProvider.getModalContent('does-not-exist');

		expect(about).not.toBeNull();
		expect(about?.id).toBe('about-us');
		expect(unknown).toBeNull();
		expect(warnSpy).toHaveBeenCalled();

		warnSpy.mockRestore();
	});

	it('interpolates company variables in content strings', () => {
		const about = modalContentProvider.getModalContent('about-us');
		const contact = modalContentProvider.getModalContent('contact');
		const terms = modalContentProvider.getModalContent('terms-of-service');

		expect(about?.content.contact.email).toBe('support@qualitick.com');
		expect(contact?.content.contactInfo.items[0].value).toBe('support@qualitick.com');
		expect(terms?.content.contact.email).toBe('Email: support@qualitick.com');
	});

	it('supports version and change-detection APIs', () => {
		expect(modalContentProvider.getLatestVersion('about-us')).toBe('v1.0.0');
		expect(modalContentProvider.hasContentChanged('about-us', 'v0.9.0')).toBe(true);
		expect(modalContentProvider.hasContentChanged('about-us', 'v1.0.0')).toBe(false);

		const versions = modalContentProvider.getAllVersions('about-us');
		expect(versions).toHaveLength(1);
		expect(versions[0].version).toBe('v1.0.0');

		const detection = modalContentProvider.getContentWithChangeDetection('about-us', 'v0.1.0');
		expect(detection.content?.id).toBe('about-us');
		expect(detection.hasChanged).toBe(true);
	});

	it('exposes available ids, aliases and convenience getters', () => {
		const ids = modalContentProvider.getAvailableModalIds();
		expect(ids).toEqual(
			expect.arrayContaining([
				'privacy-policy',
				'terms-of-service',
				'cookies-policy',
				'about-us',
				'features',
				'contact',
				'help-center',
			])
		);

		expect(modals.aboutUs()?.id).toBe('about-us');
		expect(modals['about-us']()?.id).toBe('about-us');
		expect(modals.helpCenter()?.id).toBe('help-center');
		expect(modals['help-center']()?.id).toBe('help-center');

		expect(getPrivacyPolicy()?.id).toBe('privacy-policy');
		expect(getTermsOfService()?.id).toBe('terms-of-service');
		expect(getCookiesPolicy()?.id).toBe('cookies-policy');
		expect(getAboutUs()?.id).toBe('about-us');
		expect(getFeatures()?.id).toBe('features');
		expect(getContact()?.id).toBe('contact');
		expect(getHelpCenter()?.id).toBe('help-center');
		expect(modalContentProvider.getCompanyInfo().supportEmail).toBe('support@qualitick.com');
		expect(modalContentProvider).toBeDefined();
	});
});

