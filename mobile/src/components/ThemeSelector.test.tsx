import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import ThemeSelector from './ThemeSelector';

const mockUseTheme = jest.fn();
const mockT = jest.fn((key: string) => key);
const mockSetTheme = jest.fn();

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

describe('ThemeSelector', () => {
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
			theme: 'default',
			setTheme: mockSetTheme,
			colors: {
				text: '#111',
				textSecondary: '#666',
				surface: '#f8f8f8',
				border: '#ddd',
				primary: '#00f',
				background: '#fff',
			},
		});
	});

	it('renders title and all theme options', () => {
		const tree = renderWithAct(<ThemeSelector />);

		expect(tree.root.findByProps({ children: 'settings:theme.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:theme.light' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:theme.dark' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:theme.default' })).toBeTruthy();
	});

	it('calls setTheme with selected option when pressed', () => {
		const tree = renderWithAct(<ThemeSelector />);

		const darkOptionText = tree.root.findByProps({ children: 'settings:theme.dark' });
		const darkOptionButton = findPressableAncestor(darkOptionText);

		ReactTestRenderer.act(() => {
			darkOptionButton.props.onPress();
		});

		expect(mockSetTheme).toHaveBeenCalledWith('dark');
	});

	it('shows checkmark for currently selected theme', () => {
		mockUseTheme.mockReturnValue({
			theme: 'light',
			setTheme: mockSetTheme,
			colors: {
				text: '#111',
				textSecondary: '#666',
				surface: '#f8f8f8',
				border: '#ddd',
				primary: '#00f',
				background: '#fff',
			},
		});

		const tree = renderWithAct(<ThemeSelector />);
		expect(tree.root.findAllByProps({ children: '✓' }).length).toBeGreaterThan(0);
	});

	it('renders all theme icons', () => {
		const tree = renderWithAct(<ThemeSelector />);
		expect(tree.root.findByProps({ children: '☀️' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '🌙' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '📱' })).toBeTruthy();
	});
});
