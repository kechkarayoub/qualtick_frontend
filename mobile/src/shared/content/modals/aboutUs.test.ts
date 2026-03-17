import { aboutUsContent, getAboutUsContent } from './aboutUs';

describe('aboutUs content', () => {
	it('returns default about us content shape and metadata', () => {
		const content = getAboutUsContent();

		expect(content.id).toBe('about-us');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));
		expect(content.title).toBe('About Us');
		expect(content.content.hero.title).toBe('Welcome to Qualitick');
		expect(content.content.features.items).toHaveLength(3);
		expect(content.content.values.items).toHaveLength(4);
		expect(content.content.contact.email).toBe('{supportEmail}');
	});

	it('uses provided translation function for translatable values', () => {
		const t = jest.fn((key: string) => `translated:${key}`);
		const content = getAboutUsContent('v1.0.0', t);

		expect(content.title).toBe('translated:aboutUs:title');
		expect(content.content.hero.title).toBe('translated:aboutUs:hero.title');
		expect(content.content.features.items[0].title).toBe('translated:aboutUs:features.items.patientManagement.title');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(aboutUsContent['v1.0.0']).toBeDefined();
		expect(aboutUsContent['v1.0.0'].id).toBe('about-us');
		expect(aboutUsContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

