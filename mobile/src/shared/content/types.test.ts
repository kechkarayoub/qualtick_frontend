import type {
	CompanyInfo,
	ContentVersion,
	ModalContent,
	ModalContentProvider,
	VersionedContent,
} from './types';

describe('shared content types', () => {
	it('supports creating valid typed objects for core interfaces', () => {
		const version: ContentVersion = {
			version: 'v1.0.0',
			lastUpdated: new Date('2024-01-01'),
			title: 'Initial',
			description: 'First release',
		};

		const modal: ModalContent = {
			id: 'privacy-policy',
			title: 'Privacy Policy',
			version: 'v1.0.0',
			lastUpdated: new Date('2024-01-01'),
			content: { section: 'intro' },
		};

		const company: CompanyInfo = {
			name: 'Qualitick',
			supportEmail: 'support@qualitick.com',
			address: 'Address',
			website: 'https://qualitick.com',
		};

		const versioned: VersionedContent = {
			id: 'privacy-policy',
			currentVersion: 'v1.0.0',
			versions: { 'v1.0.0': version },
			content: { 'v1.0.0': modal.content },
		};

		expect(version.version).toBe('v1.0.0');
		expect(modal.id).toBe('privacy-policy');
		expect(company.supportEmail).toContain('@');
		expect(versioned.currentVersion).toBe('v1.0.0');
	});

	it('supports a modal provider implementation contract', () => {
		const provider: ModalContentProvider = {
			getModalContent: () => ({
				id: 'about-us',
				title: 'About Us',
				version: 'v1.0.0',
				lastUpdated: new Date('2024-01-01'),
				content: {},
			}),
			getLatestVersion: () => 'v1.0.0',
			getAllVersions: () => [{ version: 'v1.0.0', lastUpdated: new Date('2024-01-01'), title: 'About Us' }],
			hasContentChanged: (_id, lastKnownVersion) => lastKnownVersion !== 'v1.0.0',
			getCompanyInfo: () => ({ name: 'Qualitick', supportEmail: 'support@qualitick.com' }),
		};

		expect(provider.getModalContent('about-us')?.version).toBe('v1.0.0');
		expect(provider.getLatestVersion('about-us')).toBe('v1.0.0');
		expect(provider.getAllVersions('about-us')).toHaveLength(1);
		expect(provider.hasContentChanged('about-us', 'v0.9.0')).toBe(true);
		expect(provider.getCompanyInfo().name).toBe('Qualitick');
	});
});

