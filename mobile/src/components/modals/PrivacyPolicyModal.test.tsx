import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import PrivacyPolicyModal from './PrivacyPolicyModal';

const mockUseTheme = jest.fn();
const mockUseModalContent = jest.fn();
const mockUseCompanyInfo = jest.fn();
const mockT = jest.fn((key: string, options?: any) => options?.defaultValue || key);

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('../../hooks/useModalContent', () => ({
	__esModule: true,
	useModalContent: (...args: any[]) => mockUseModalContent(...args),
	useCompanyInfo: (...args: any[]) => mockUseCompanyInfo(...args),
}));

jest.mock('./BaseModal', () => {
	const React = require('react');
	const { View, Text } = require('react-native');
	return {
		__esModule: true,
		default: ({ title, children, isOpen, size }: any) => (
			<View testID="base-modal" data-open={isOpen} data-size={size}>
				<Text>{title}</Text>
				{children}
			</View>
		),
	};
});

describe('PrivacyPolicyModal', () => {
	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseTheme.mockReturnValue({
			colors: {
				text: '#111',
				textSecondary: '#666',
				error: '#f00',
				primary: '#00f',
				surface: '#f8f8f8',
				background: '#fff',
			},
		});
		mockUseCompanyInfo.mockReturnValue({ supportEmail: 'privacy@qualitick.com', address: '1 Main St' });
	});

	it('renders loading state inside BaseModal', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const tree = renderWithAct(<PrivacyPolicyModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Privacy Policy' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('Loading'))).toBe(true);
	});

	it('renders error state inside BaseModal', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: false, error: 'Failed to load' });
		const tree = renderWithAct(<PrivacyPolicyModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Failed to load' })).toBeTruthy();
	});

	it('renders populated policy sections and company contact details', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: new Date('2026-03-01T00:00:00.000Z'),
				content: {
					introduction: { text: 'Privacy intro', items: ['Intro item'] },
					informationWeCollect: {
						personalInfo: { text: 'Personal info', items: ['Name'] },
						automaticInfo: { text: 'Automatic info', items: ['IP address'] },
					},
					howWeUse: { text: 'How we use', items: ['Service delivery'] },
					informationSharing: { text: 'Sharing text', items: ['Partners'] },
					dataSecurity: { text: 'Security text', items: ['Encryption'] },
					yourRights: { text: 'Rights text', items: ['Access'] },
					cookies: { text: 'Cookies text', items: ['Cookies'] },
					childrens: { text: 'Children text', items: ['Under 13'] },
					international: { text: 'International text', items: ['Transfers'] },
					changes: { text: 'Changes text', items: ['Updates'] },
					contact: { text: 'Contact text' },
					footer: { text: 'Footer policy text' },
				},
			},
		});

		const tree = renderWithAct(<PrivacyPolicyModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Privacy intro' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Personal info' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Automatic info' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Contact text' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('privacy@qualitick.com'))).toBe(true);
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('1 Main St'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Footer policy text' })).toBeTruthy();
	});
});
