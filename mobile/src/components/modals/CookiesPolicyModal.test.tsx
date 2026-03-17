import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import CookiesPolicyModal from './CookiesPolicyModal';

const mockUseTheme = jest.fn();
const mockUseModalContent = jest.fn();
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

describe('CookiesPolicyModal', () => {
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
			},
		});
	});

	it('renders loading state', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const tree = renderWithAct(<CookiesPolicyModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Cookies Policy' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'common:loading' })).toBeTruthy();
	});

	it('renders error state', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: false, error: new Error('nope') });
		const tree = renderWithAct(<CookiesPolicyModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'common:error.loadingContent' })).toBeTruthy();
	});

	it('renders populated cookies sections', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: '2026-03-01T00:00:00.000Z',
				content: {
					introduction: { text: 'Cookies intro' },
					whatAreCookies: { title: 'What are cookies', text: 'Cookie text' },
					types: {
						title: 'Cookie types',
						items: [{ title: 'Essential', description: 'Needed', examples: ['session', 'auth'] }],
					},
					howWeUse: { title: 'How we use', text: 'Usage', purposes: ['Security', 'Analytics'] },
					thirdParty: {
						title: 'Third-party',
						text: 'Third-party text',
						services: [{ name: 'Service A', purpose: 'Monitoring' }],
					},
					managing: {
						title: 'Manage cookies',
						text: 'Manage text',
						options: [{ title: 'Browser settings', description: 'Configure in browser' }],
					},
					contact: { title: 'Contact', text: 'Reach us', email: 'cookies@qualitick.com' },
				},
			},
		});

		const tree = renderWithAct(<CookiesPolicyModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'What are cookies' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Essential' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('cookies:examples'))).toBe(true);
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('Security'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Service A' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Browser settings' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'cookies@qualitick.com' })).toBeTruthy();
	});

	it('passes expected props into BaseModal', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const tree = renderWithAct(<CookiesPolicyModal isOpen={false} onClose={jest.fn()} />);
		const wrapper = tree.root.findByProps({ testID: 'base-modal' });

		expect(wrapper.props['data-open']).toBe(false);
		expect(wrapper.props['data-size']).toBe('large');
	});
});
