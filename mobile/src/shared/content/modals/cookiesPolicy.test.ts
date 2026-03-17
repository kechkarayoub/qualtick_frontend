import { cookiesPolicyContent, getCookiesPolicyContent } from './cookiesPolicy';

describe('cookiesPolicy content', () => {
	it('returns default cookies policy content with key sections', () => {
		const content = getCookiesPolicyContent();

		expect(content.id).toBe('cookies-policy');
		expect(content.title).toBe('Cookies Policy');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));

		expect(content.content.typesOfCookies.essential.items).toHaveLength(4);
		expect(content.content.typesOfCookies.performance.items).toHaveLength(4);
		expect(content.content.typesOfCookies.functional.items).toHaveLength(4);
		expect(content.content.typesOfCookies.targeting.items).toHaveLength(4);
		expect(content.content.managing.browser.items).toHaveLength(4);
		expect(content.content.impact.items).toHaveLength(4);
		expect(content.content.contact.email).toBe('Email: {supportEmail}');
	});

	it('uses provided translation function for deeply nested keys', () => {
		const t = jest.fn((key: string) => `tr:${key}`);
		const content = getCookiesPolicyContent('v1.0.0', t);

		expect(content.title).toBe('tr:cookiesPolicy:title');
		expect(content.content.introduction.title).toBe('tr:cookiesPolicy:introduction.title');
		expect(content.content.typesOfCookies.essential.items[0]).toBe('tr:cookiesPolicy:typesOfCookies.essential.items.0');
		expect(content.content.footer.text).toBe('tr:cookiesPolicy:footer.text');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(cookiesPolicyContent['v1.0.0']).toBeDefined();
		expect(cookiesPolicyContent['v1.0.0'].id).toBe('cookies-policy');
		expect(cookiesPolicyContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

