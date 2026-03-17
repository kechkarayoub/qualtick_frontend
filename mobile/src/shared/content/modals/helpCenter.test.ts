import { getHelpCenterContent, helpCenterContent } from './helpCenter';

describe('helpCenter content', () => {
	it('returns default structure and key values', () => {
		const content = getHelpCenterContent();

		expect(content.id).toBe('help-center');
		expect(content.title).toBe('Help Center');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));

		expect(content.content.categories).toHaveLength(6);
		expect(content.content.faqs.length).toBeGreaterThanOrEqual(10);
		expect(content.content.contactSupport.email).toBe('{supportEmail}');
	});

	it('uses provided translation function for nested keys', () => {
		const t = jest.fn((key: string) => `tx:${key}`);
		const content = getHelpCenterContent('v1.0.0', t);

		expect(content.title).toBe('tx:helpCenter:title');
		expect(content.content.hero.title).toBe('tx:helpCenter:hero.title');
		expect(content.content.categories[0].name).toBe('tx:helpCenter:categories.all.name');
		expect(content.content.faqs[0].question).toBe('tx:helpCenter:faqs.account1.question');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(helpCenterContent['v1.0.0']).toBeDefined();
		expect(helpCenterContent['v1.0.0'].id).toBe('help-center');
		expect(helpCenterContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

