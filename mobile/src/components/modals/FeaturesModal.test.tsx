import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import FeaturesModal from './FeaturesModal';

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

describe('FeaturesModal', () => {
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
				accent: '#a0f',
			},
		});
	});

	it('renders loading state', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const tree = renderWithAct(<FeaturesModal isOpen onClose={jest.fn()} />);
		expect(tree.root.findByProps({ children: 'common:loading' })).toBeTruthy();
	});

	it('renders error state', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: false, error: new Error('bad') });
		const tree = renderWithAct(<FeaturesModal isOpen onClose={jest.fn()} />);
		expect(tree.root.findByProps({ children: 'common:error.loadingContent' })).toBeTruthy();
	});

	it('renders rich feature sections', () => {
		mockUseModalContent.mockReturnValue({
			loading: false,
			error: null,
			content: {
				lastUpdated: '2026-03-01T00:00:00.000Z',
				content: {
					introduction: { text: 'Features intro' },
					core: {
						title: 'Core',
						features: [{ title: 'Audit Engine', description: 'Core desc', benefits: ['Fast', 'Reliable'] }],
					},
					patient: { title: 'Patient', features: [{ title: 'Patient Portal', description: 'Portal desc' }] },
					provider: { title: 'Provider', features: [{ title: 'Provider Dashboard', description: 'Dash desc' }] },
					administrative: { title: 'Admin', features: [{ title: 'Admin Console', description: 'Admin desc' }] },
					technology: {
						title: 'Technology',
						features: [{ title: 'API', description: 'API desc', specifications: ['REST', 'JSON'] }],
					},
					security: { title: 'Security', description: 'Sec desc', features: ['Encryption'] },
					comingSoon: {
						title: 'Coming soon',
						description: 'Soon desc',
						features: [{ title: 'AI Insights', description: 'AI desc', timeline: 'Q3 2026' }],
					},
				},
			},
		});

		const tree = renderWithAct(<FeaturesModal isOpen onClose={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Audit Engine' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('Fast'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Patient Portal' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Provider Dashboard' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Admin Console' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('REST'))).toBe(true);
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('Encryption'))).toBe(true);
		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('features:expectedBy'))).toBe(true);
	});

	it('passes expected props into BaseModal', () => {
		mockUseModalContent.mockReturnValue({ content: null, loading: true, error: null });
		const tree = renderWithAct(<FeaturesModal isOpen={false} onClose={jest.fn()} />);
		const wrapper = tree.root.findByProps({ testID: 'base-modal' });

		expect(wrapper.props['data-open']).toBe(false);
		expect(wrapper.props['data-size']).toBe('large');
	});
});
