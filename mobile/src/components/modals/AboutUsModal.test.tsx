import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import AboutUsModal from './AboutUsModal';

const mockUseTheme = jest.fn();
const mockUseModalContent = jest.fn();
const mockUseCompanyInfo = jest.fn();
const mockT = jest.fn((key: string, options?: any) => options?.defaultValue || key);

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({
		t: mockT,
		i18n: { language: 'en' },
	}),
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
				<Text testID="base-title">{title}</Text>
				{children}
			</View>
		),
	};
});

describe('AboutUsModal', () => {
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
				text: '#111111',
				textSecondary: '#6B7280',
				error: '#EF4444',
				primary: '#3B82F6',
			},
		});
		mockUseCompanyInfo.mockReturnValue({});
	});

	it('renders loading state', () => {
		mockUseModalContent.mockReturnValue({
			content: null,
			loading: true,
			error: null,
		});

		const tree = renderWithAct(<AboutUsModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'About Us' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'common:loading' })).toBeTruthy();
	});

	it('renders error state when content fails', () => {
		mockUseModalContent.mockReturnValue({
			content: null,
			loading: false,
			error: new Error('failed'),
		});

		const tree = renderWithAct(<AboutUsModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'common:error.loadingContent' })).toBeTruthy();
	});

	it('renders rich content sections when data is available', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: '2026-02-12T00:00:00.000Z',
				content: {
					hero: { title: 'Welcome to Qualitick', subtitle: 'Quality first' },
					mission: { title: 'Our Mission', text: 'Help teams improve quality.' },
					features: {
						title: 'Features',
						items: [{ title: 'Audits', description: 'Run fast audits' }],
					},
					values: {
						title: 'Values',
						items: [{ title: 'Trust', description: 'We value trust' }],
					},
					contact: {
						title: 'Contact',
						email: 'hello@qualitick.com',
						phone: '+1-555-1000',
						address: 'Main St',
					},
				},
			},
		});

		const tree = renderWithAct(<AboutUsModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Welcome to Qualitick' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Our Mission' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Audits' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Trust' })).toBeTruthy();
		const allText = tree.root.findAllByType(Text).map((node) => String(node.props.children));
		expect(allText.some((text) => text.includes('common:email') && text.includes('hello@qualitick.com'))).toBe(true);
		expect(allText.some((text) => text.includes('common:phone') && text.includes('+1-555-1000'))).toBe(true);
		expect(allText.some((text) => text.includes('common:address') && text.includes('Main St'))).toBe(true);
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('common:lastUpdated'))).toBe(true);
	});

	it('passes expected props into BaseModal wrapper', () => {
		mockUseModalContent.mockReturnValue({
			content: null,
			loading: true,
			error: null,
		});

		const tree = renderWithAct(<AboutUsModal isOpen={false} onClose={jest.fn()} />);
		const wrapper = tree.root.findByProps({ testID: 'base-modal' });

		expect(wrapper.props['data-open']).toBe(false);
		expect(wrapper.props['data-size']).toBe('large');
	});
});
