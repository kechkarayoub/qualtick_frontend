import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import * as ReactNative from 'react-native';

import { ThemeProvider, useTheme } from './ThemeContext';

const mockUseAuth = jest.fn();
const mockUseColorScheme = jest.fn();

jest.mock('../hooks/useAuth', () => ({
	__esModule: true,
	default: () => mockUseAuth(),
}));

describe('ThemeContext', () => {
	const useColorSchemeSpy = jest.spyOn(ReactNative, 'useColorScheme');

	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseAuth.mockReturnValue({ user: null });
		mockUseColorScheme.mockReturnValue('light');
		useColorSchemeSpy.mockImplementation(() => mockUseColorScheme());
	});

	afterAll(() => {
		useColorSchemeSpy.mockRestore();
	});

	it('throws when useTheme is used outside provider', () => {
		const Bad = () => {
			useTheme();
			return null;
		};
		expect(() => renderWithAct(<Bad />)).toThrow('useTheme must be used within a ThemeProvider');
	});

	it('resolves default theme from system scheme', () => {
		mockUseColorScheme.mockReturnValue('dark');

		const Probe = () => {
			const { theme, resolvedTheme } = useTheme();
			return <Text>{`${theme}:${resolvedTheme}`}</Text>;
		};

		const tree = renderWithAct(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>
		);

		expect(tree.root.findByProps({ children: 'default:dark' })).toBeTruthy();
	});

	it('applies user preferred theme from auth profile', () => {
		mockUseAuth.mockReturnValue({ user: { user_theme: 'dark' } });

		const Probe = () => {
			const { theme, resolvedTheme } = useTheme();
			return <Text>{`${theme}:${resolvedTheme}`}</Text>;
		};

		const tree = renderWithAct(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>
		);

		expect(tree.root.findByProps({ children: 'dark:dark' })).toBeTruthy();
	});

	it('setTheme updates theme state', () => {
		const Probe = () => {
			const { theme, resolvedTheme, setTheme } = useTheme();
			return (
				<TouchableOpacity onPress={() => setTheme('light')}>
					<Text>{`${theme}:${resolvedTheme}`}</Text>
				</TouchableOpacity>
			);
		};

		const tree = renderWithAct(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>
		);

		const button = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			button.props.onPress();
		});

		expect(tree.root.findByProps({ children: 'light:light' })).toBeTruthy();
	});
});
