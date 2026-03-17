import { getTermsOfServiceContent, termsOfServiceContent } from './termsOfService';

describe('termsOfService content', () => {
	it('returns default content with expected section data', () => {
		const content = getTermsOfServiceContent();

		expect(content.id).toBe('terms-of-service');
		expect(content.title).toBe('Terms of Service');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));

		expect(content.content.eligibility.items).toHaveLength(4);
		expect(content.content.accountRegistration.items).toHaveLength(4);
		expect(content.content.useOfServices.permitted.items).toHaveLength(4);
		expect(content.content.useOfServices.prohibited.items).toHaveLength(6);
		expect(content.content.userContent.responsibilities.items).toHaveLength(4);
		expect(content.content.payments.items).toHaveLength(4);
		expect(content.content.contact.email).toBe('Email: {supportEmail}');
	});

	it('uses provided translation function for nested fields', () => {
		const t = jest.fn((key: string) => `tr:${key}`);
		const content = getTermsOfServiceContent('v1.0.0', t);

		expect(content.title).toBe('tr:terms:title');
		expect(content.content.introduction.title).toBe('tr:terms:introduction.title');
		expect(content.content.eligibility.items[0]).toBe('tr:terms:eligibility.items.age');
		expect(content.content.useOfServices.prohibited.items[0]).toBe('tr:terms:useOfServices.prohibited.items.illegal');
		expect(content.content.footer.text).toBe('tr:terms:footer.text');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(termsOfServiceContent['v1.0.0']).toBeDefined();
		expect(termsOfServiceContent['v1.0.0'].id).toBe('terms-of-service');
		expect(termsOfServiceContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

