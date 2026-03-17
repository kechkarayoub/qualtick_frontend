import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';

import ContactModal from './ContactModal';

const mockUseTheme = jest.fn();
const mockUseModalContent = jest.fn();
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

describe('ContactModal', () => {
	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	const findPressableAncestor = (node: ReactTestRenderer.ReactTestInstance | null | undefined) => {
		let current: any = node;
		while (current && typeof current.props?.onPress !== 'function') {
			current = current.parent;
		}
		return current;
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

		jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
	});

	afterEach(() => {
		(Linking.openURL as jest.Mock).mockRestore?.();
	});

	it('renders loading state', () => {
		mockUseModalContent.mockReturnValue({
			content: null,
			loading: true,
			error: null,
		});

		const tree = renderWithAct(<ContactModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Contact Us' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'common:loading' })).toBeTruthy();
	});

	it('renders error state when content is unavailable', () => {
		mockUseModalContent.mockReturnValue({
			content: null,
			loading: false,
			error: new Error('failed'),
		});

		const tree = renderWithAct(<ContactModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'common:error.loadingContent' })).toBeTruthy();
	});

	it('renders contact sections and opens email/phone/website links', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: '2026-02-12T00:00:00.000Z',
				content: {
					introduction: { text: 'Reach out anytime.' },
					methods: {
						title: 'Methods',
						items: [
							{ title: 'Email', description: 'Email us', type: 'email', value: 'support@qualitick.com' },
							{ title: 'Phone', description: 'Call us', type: 'phone', value: '+1-555-2000' },
							{ title: 'Web', description: 'Visit site', type: 'website', value: 'https://qualitick.com' },
						],
					},
					hours: {
						title: 'Hours',
						items: [{ day: 'Mon-Fri', time: '9:00-18:00' }],
						note: 'Closed on holidays',
					},
					address: {
						title: 'Address',
						street: '123 Main St',
						city: 'City',
						state: 'CA',
						zip: '90210',
						country: 'USA',
					},
					support: {
						title: 'Support',
						description: 'Priority support',
						email: 'help@qualitick.com',
					},
					emergency: {
						title: 'Emergency',
						description: 'Urgent issues only',
						phone: '+1-555-9999',
					},
				},
			},
		});

		const tree = renderWithAct(<ContactModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Methods' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Mon-Fri' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '123 Main St' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Priority support' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '+1-555-9999' })).toBeTruthy();

		const emailNode = tree.root.findByProps({ children: 'support@qualitick.com' });
		const emailPressable = findPressableAncestor(emailNode);
		expect(emailPressable).toBeTruthy();
		ReactTestRenderer.act(() => {
			emailPressable.props.onPress();
		});

		const phoneNode = tree.root.findByProps({ children: '+1-555-2000' });
		const phonePressable = findPressableAncestor(phoneNode);
		expect(phonePressable).toBeTruthy();
		ReactTestRenderer.act(() => {
			phonePressable.props.onPress();
		});

		const websiteNode = tree.root.findByProps({ children: 'https://qualitick.com' });
		const websitePressable = findPressableAncestor(websiteNode);
		expect(websitePressable).toBeTruthy();
		ReactTestRenderer.act(() => {
			websitePressable.props.onPress();
		});

		const supportEmailNode = tree.root.findByProps({ children: 'help@qualitick.com' });
		const supportEmailPressable = findPressableAncestor(supportEmailNode);
		expect(supportEmailPressable).toBeTruthy();
		ReactTestRenderer.act(() => {
			supportEmailPressable.props.onPress();
		});

		const emergencyPhoneNode = tree.root.findByProps({ children: '+1-555-9999' });
		const emergencyPhonePressable = findPressableAncestor(emergencyPhoneNode);
		expect(emergencyPhonePressable).toBeTruthy();
		ReactTestRenderer.act(() => {
			emergencyPhonePressable.props.onPress();
		});

		expect(Linking.openURL).toHaveBeenCalledWith('mailto:support@qualitick.com');
		expect(Linking.openURL).toHaveBeenCalledWith('tel:+1-555-2000');
		expect(Linking.openURL).toHaveBeenCalledWith('https://qualitick.com');
		expect(Linking.openURL).toHaveBeenCalledWith('mailto:help@qualitick.com');
		expect(Linking.openURL).toHaveBeenCalledWith('tel:+1-555-9999');
	});

	it('passes expected props into BaseModal wrapper', () => {
		mockUseModalContent.mockReturnValue({
			content: null,
			loading: true,
			error: null,
		});

		const tree = renderWithAct(<ContactModal isOpen={false} onClose={jest.fn()} />);
		const wrapper = tree.root.findByProps({ testID: 'base-modal' });

		expect(wrapper.props['data-open']).toBe(false);
		expect(wrapper.props['data-size']).toBe('large');
	});
});
