import { featuresContent, getFeaturesContent } from './features';

describe('features content', () => {
	it('returns default features content with expected sections and counts', () => {
		const content = getFeaturesContent();

		expect(content.id).toBe('features');
		expect(content.title).toBe('Features');
		expect(content.version).toBe('v1.0.0');
		expect(content.lastUpdated).toEqual(new Date('2024-01-01'));

		expect(content.content.hero.title).toBe('Powerful Features for Healthcare Platforms');
		expect(content.content.coreFeatures.items).toHaveLength(6);
		expect(content.content.advancedFeatures.items).toHaveLength(3);
		expect(content.content.callToAction.title).toBe('Ready to Get Started?');
	});

	it('uses provided translation function for nested feature labels', () => {
		const t = jest.fn((key: string) => `tx:${key}`);
		const content = getFeaturesContent('v1.0.0', t);

		expect(content.title).toBe('tx:features:title');
		expect(content.content.coreFeatures.title).toBe('tx:features:coreFeatures.title');
		expect(content.content.coreFeatures.items[0].title).toBe('tx:features:coreFeatures.items.patientManagement.title');
		expect(content.content.advancedFeatures.items[0].title).toBe('tx:features:advancedFeatures.items.realtimeMonitoring.title');
		expect(content.content.callToAction.description).toBe('tx:features:callToAction.description');
		expect(t).toHaveBeenCalled();
	});

	it('exports backward-compatible version map', () => {
		expect(featuresContent['v1.0.0']).toBeDefined();
		expect(featuresContent['v1.0.0'].id).toBe('features');
		expect(featuresContent['v1.0.0'].version).toBe('v1.0.0');
	});
});

