import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import HomeScreen from './HomeScreen';

const mockNavigate = jest.fn();
const mockLogout = jest.fn();
const mockUseAuth = jest.fn();
const mockT = jest.fn((key: string, opts?: any) => {
	if (key === 'home:welcome.greeting') {
		return `hello:${opts?.name}`;
	}
	return key;
});

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => ({ navigate: (...args: any[]) => mockNavigate(...args) }),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string, opts?: any) => mockT(key, opts) }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			surface: '#222',
			text: '#333',
			textSecondary: '#444',
			primary: '#555',
			secondary: '#666',
		},
	}),
}));

jest.mock('../../hooks/useAuth', () => ({
	__esModule: true,
	default: () => mockUseAuth(),
}));

jest.mock('../../components/AppHeader', () => ({
	__esModule: true,
	default: ({ title }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, title);
	},
}));

jest.mock('../../components/form/CustomButton', () => ({
	__esModule: true,
	default: ({ title, onPress }: any) => {
		const ReactLocal = require('react');
		const { TouchableOpacity, Text } = require('react-native');
		return ReactLocal.createElement(
			TouchableOpacity,
			{ onPress, testID: `btn:${title}` },
			ReactLocal.createElement(Text, null, title)
		);
	},
}));

const findPressableAncestor = (node: ReactTestRenderer.ReactTestInstance | null | undefined) => {
	let current = node;
	while (current && typeof current.props?.onPress !== 'function') {
		current = current.parent;
	}
	return current;
};

describe('HomeScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(HomeScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseAuth.mockReturnValue({
			user: { first_name: 'Alice', username: 'alice', email: 'alice@example.com' },
			logout: (...args: any[]) => mockLogout(...args),
		});
		mockLogout.mockResolvedValue(undefined);
	});

	it('renders header, greeting, quick actions, and account info', () => {
		const tree = renderWithAct();

		expect(tree.root.findByProps({ children: 'home:title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'home:welcome.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'hello:Alice' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'home:quickActions.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'home:accountInfo.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'alice@example.com' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'alice' })).toBeTruthy();
	});

	it('falls back to default welcome and not-available values when user fields are missing', () => {
		mockUseAuth.mockReturnValueOnce({
			user: {},
			logout: (...args: any[]) => mockLogout(...args),
		});

		const tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'home:welcome.default' })).toBeTruthy();
		expect(tree.root.findAllByProps({ children: 'common:notAvailable' }).length).toBeGreaterThan(0);
	});

	it('navigates to Dashboard when primary quick action is pressed', () => {
		const tree = renderWithAct();
		const actionText = tree.root.findByProps({ children: 'home:quickActions.action1' });
		const action = findPressableAncestor(actionText);
		expect(action).toBeTruthy();

		ReactTestRenderer.act(() => {
			action!.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
	});

	it('calls logout and handles logout errors', async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const tree = renderWithAct();
		const logoutButton = tree.root.findByProps({ testID: 'btn:auth:logout.button' });

		await ReactTestRenderer.act(async () => {
			await logoutButton.props.onPress();
		});
		expect(mockLogout).toHaveBeenCalled();

		mockLogout.mockRejectedValueOnce(new Error('logout-failed'));
		await ReactTestRenderer.act(async () => {
			await logoutButton.props.onPress();
		});
		expect(errorSpy).toHaveBeenCalled();

		errorSpy.mockRestore();
	});
});
