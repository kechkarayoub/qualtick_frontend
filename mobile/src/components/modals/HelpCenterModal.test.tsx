import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';

import HelpCenterModal from './HelpCenterModal';

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

describe('HelpCenterModal', () => {
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
				text: '#111',
				textSecondary: '#666',
				error: '#f00',
				primary: '#00f',
				success: '#0a0',
			},
		});
		jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
	});

	afterEach(() => {
		(Linking.openURL as jest.Mock).mockRestore?.();
	});

	it('renders loading and error states', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const loadingTree = renderWithAct(<HelpCenterModal isOpen onClose={jest.fn()} />);
		expect(loadingTree.root.findByProps({ children: 'common:loading' })).toBeTruthy();

		mockUseModalContent.mockReturnValue({ content: null, loading: false, error: new Error('bad') });
		const errorTree = renderWithAct(<HelpCenterModal isOpen onClose={jest.fn()} />);
		expect(errorTree.root.findByProps({ children: 'common:error.loadingContent' })).toBeTruthy();
	});

	it('renders content, toggles FAQ answer, and opens support links', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: '2026-03-01T00:00:00.000Z',
				content: {
					introduction: { text: 'Help intro' },
					quickStart: { title: 'Quick Start', steps: [{ title: 'Step 1', description: 'Do this' }] },
					faq: {
						title: 'FAQ',
						questions: [{ question: 'How to reset password?', answer: 'Use reset flow.' }],
					},
					guides: {
						title: 'Guides',
						categories: [{ title: 'User Guide', guides: [{ title: 'Basics', description: 'Guide desc' }] }],
					},
					commonIssues: {
						title: 'Common Issues',
						issues: [{ title: 'Login issue', description: 'Cannot login', solution: 'Clear cache' }],
					},
					support: {
						title: 'Support',
						description: 'Contact support',
						channels: [{ title: 'Email Support', description: 'Mail us', email: 'help@qualitick.com', phone: '+1-555-1234', hours: '9-5' }],
					},
					resources: {
						title: 'Resources',
						items: [{ title: 'Docs', description: 'Read docs' }],
					},
				},
			},
		});

		const tree = renderWithAct(<HelpCenterModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Step 1' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'User Guide' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Login issue' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Docs' })).toBeTruthy();

		expect(tree.root.findAllByProps({ children: 'Use reset flow.' })).toHaveLength(0);
		const faqQuestion = tree.root.findByProps({ children: 'How to reset password?' });
		const faqPressable = findPressableAncestor(faqQuestion);
		ReactTestRenderer.act(() => {
			faqPressable.props.onPress();
		});
		expect(tree.root.findByProps({ children: 'Use reset flow.' })).toBeTruthy();

		const emailNode = tree.root.findByProps({ children: 'help@qualitick.com' });
		const emailPressable = findPressableAncestor(emailNode);
		ReactTestRenderer.act(() => {
			emailPressable.props.onPress();
		});

		const phoneNode = tree.root.findByProps({ children: '+1-555-1234' });
		const phonePressable = findPressableAncestor(phoneNode);
		ReactTestRenderer.act(() => {
			phonePressable.props.onPress();
		});

		expect(Linking.openURL).toHaveBeenCalledWith('mailto:help@qualitick.com');
		expect(Linking.openURL).toHaveBeenCalledWith('tel:+1-555-1234');
	});

	it('passes expected props into BaseModal', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const tree = renderWithAct(<HelpCenterModal isOpen={false} onClose={jest.fn()} />);
		const wrapper = tree.root.findByProps({ testID: 'base-modal' });

		expect(wrapper.props['data-open']).toBe(false);
		expect(wrapper.props['data-size']).toBe('large');
	});
});
