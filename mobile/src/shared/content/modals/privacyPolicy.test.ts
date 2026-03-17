import { getPrivacyPolicyContent, privacyPolicyContent } from './privacyPolicy';

describe('privacyPolicy content', () => {
	it('returns default content structure and metadata', () => {
		const content = getPrivacyPolicyContent();

		expect(content.id).toBe('privacy-policy');
		expect(content.title).toBe('Privacy Policy');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));

		expect(content.content.informationWeCollect.personalInfo.items).toHaveLength(5);
		expect(content.content.informationWeCollect.automaticInfo.items).toHaveLength(5);
		expect(content.content.howWeUse.items).toHaveLength(7);
		expect(content.content.dataSecurity.items).toHaveLength(6);
		expect(content.content.yourRights.items).toHaveLength(7);
		expect(content.content.cookies.items).toHaveLength(5);
		expect(content.content.contact.email).toBe('privacy@qualitick.com');
	});

	it('uses provided translation function for deeply nested values', () => {
		const t = jest.fn((key: string) => `i18n:${key}`);
		const content = getPrivacyPolicyContent('v1.0.0', t);

		expect(content.title).toBe('i18n:privacyPolicy:title');
		expect(content.content.introduction.title).toBe('i18n:privacyPolicy:sections.introduction.title');
		expect(content.content.informationWeCollect.personalInfo.items[0]).toBe('i18n:privacyPolicy:sections.dataCollection.subsections.personalInfo.items.0');
		expect(content.content.footer.effectiveDate).toBe('i18n:privacyPolicy:effectiveDate');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(privacyPolicyContent['v1.0.0']).toBeDefined();
		expect(privacyPolicyContent['v1.0.0'].id).toBe('privacy-policy');
		expect(privacyPolicyContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

