import { contactContent, getContactContent } from './contact';

describe('contact content', () => {
	it('returns default contact content with expected form and info sections', () => {
		const content = getContactContent();

		expect(content.id).toBe('contact');
		expect(content.title).toBe('Contact Us');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));

		expect(content.content.contactInfo.items).toHaveLength(3);
		expect(content.content.form.fields).toHaveLength(4);
		expect(content.content.form.fields[2].type).toBe('select');
		expect(content.content.form.fields[2].options).toHaveLength(5);
		expect(content.content.form.fields[3].minLength).toBe(10);
		expect(content.content.form.submitText).toBe('Send Message');
	});

	it('uses provided translation function for labels and options', () => {
		const t = jest.fn((key: string) => `i18n:${key}`);
		const content = getContactContent('v1.0.0', t);

		expect(content.title).toBe('i18n:contact:title');
		expect(content.content.hero.title).toBe('i18n:contact:hero.title');
		expect(content.content.form.fields[0].label).toBe('i18n:contact:form.fields.name.label');
		expect(content.content.form.fields[2].options[0].label).toBe('i18n:contact:form.fields.subject.options.support');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(contactContent['v1.0.0']).toBeDefined();
		expect(contactContent['v1.0.0'].id).toBe('contact');
		expect(contactContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

