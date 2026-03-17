import type i18nType from 'i18next';

const mockGetLocales = jest.fn();

jest.mock('react-native-localize', () => ({
	getLocales: () => mockGetLocales(),
}));

describe('i18n configuration', () => {
	const loadI18n = (): typeof i18nType => {
		jest.resetModules();
		const module = require('./index');
		return module.default;
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('uses detected supported language from device locale', async () => {
		mockGetLocales.mockReturnValue([{ languageCode: 'fr' }]);

		const i18n = loadI18n();
		await Promise.resolve();
		expect(i18n.language).toBe('fr');
		const fallback = i18n.options.fallbackLng as any;
		expect(Array.isArray(fallback) ? fallback[0] : fallback).toBe('en');
	});

	it('falls back to english for unsupported locale', async () => {
		mockGetLocales.mockReturnValue([{ languageCode: 'de' }]);

		const i18n = loadI18n();
		await Promise.resolve();
		expect(i18n.language).toBe('en');
		expect(i18n.options.supportedLngs).toEqual(expect.arrayContaining(['en', 'fr', 'ar']));
	});

	it('falls back to english when locale detection throws', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		mockGetLocales.mockImplementation(() => {
			throw new Error('locales unavailable');
		});

		const i18n = loadI18n();
		await Promise.resolve();
		expect(i18n.language).toBe('en');
		expect(warnSpy).toHaveBeenCalled();

		warnSpy.mockRestore();
	});

	it('configures interpolation formatters and namespaces', async () => {
		mockGetLocales.mockReturnValue([{ languageCode: 'en' }]);
		const i18n = loadI18n();
		await Promise.resolve();

		const format = (i18n.options.interpolation as any).format as (value: string, formatName: string) => string;
		expect(format('hello', 'uppercase')).toBe('HELLO');
		expect(format('HELLO', 'lowercase')).toBe('hello');
		expect(format('qualitick', 'capitalize')).toBe('Qualitick');
		expect(i18n.options.ns).toEqual(expect.arrayContaining(['auth', 'navigation', 'privacyPolicy', 'helpCenter']));
	});
});
