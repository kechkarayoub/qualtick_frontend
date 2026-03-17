import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import TermsOfServiceModal from './TermsOfServiceModal';

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

describe('TermsOfServiceModal', () => {
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
		mockUseCompanyInfo.mockReturnValue({ supportEmail: 'legal@qualitick.com', address: '2 Main St' });
	});

	it('renders loading and error states', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const loadingTree = renderWithAct(<TermsOfServiceModal isOpen onClose={jest.fn()} />);
		expect(loadingTree.root.findAllByType(Text).some((n) => String(n.props.children).includes('Loading'))).toBe(true);

		mockUseModalContent.mockReturnValue({ content: null, loading: false, error: 'No terms' });
		const errorTree = renderWithAct(<TermsOfServiceModal isOpen onClose={jest.fn()} />);
		expect(errorTree.root.findByProps({ children: 'No terms' })).toBeTruthy();
	});

	it('renders populated terms sections and contact info', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: new Date('2026-03-01T00:00:00.000Z'),
				content: {
					introduction: { text: 'Intro', items: ['Intro item'] },
					acceptance: { text: 'Acceptance', items: ['Agree'] },
					eligibility: { text: 'Eligibility', items: ['18+'] },
					accountRegistration: { text: 'Registration', items: ['Secure account'] },
					useOfServices: {
						text: 'Use text',
						permitted: { text: 'Permitted', items: ['Allowed'] },
						prohibited: { text: 'Prohibited', items: ['Forbidden'] },
					},
					userContent: {
						text: 'User content',
						license: { text: 'License', items: ['License item'] },
						responsibilities: { text: 'Responsibilities', items: ['Responsibility'] },
					},
					privacy: { text: 'Privacy', items: ['Privacy item'] },
					intellectualProperty: { text: 'IP', items: ['IP item'] },
					payments: { text: 'Payments', items: ['Payment item'] },
					disclaimers: { text: 'Disclaimers', items: ['Disclaimer item'] },
					limitation: { text: 'Limitation', items: ['Limit item'] },
					termination: { text: 'Termination', items: ['Terminate'] },
					governingLaw: { text: 'Law', items: ['Jurisdiction'] },
					changes: { text: 'Changes', items: ['Change item'] },
					contact: { text: 'Contact legal' },
					footer: { text: 'Terms footer' },
				},
			},
		});

		const tree = renderWithAct(<TermsOfServiceModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Intro' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Use text' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Permitted' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Prohibited' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'User content' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Contact legal' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('legal@qualitick.com'))).toBe(true);
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('2 Main St'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Terms footer' })).toBeTruthy();
	});
});
