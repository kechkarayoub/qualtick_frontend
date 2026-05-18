import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import AppNavigation from './AppNavigation';
import config from '../config/config';

const mockUseAuth = jest.fn();
const mockUseTheme = jest.fn();

const mockSetNavigationRef = jest.fn();
const mockSetAuthState = jest.fn();
const mockOnNavigationReady = jest.fn();
const mockInit = jest.fn();
const mockDeepLinkCleanup = jest.fn();

jest.mock('@react-navigation/stack', () => ({
	createStackNavigator: () => {
		const ReactLocal = require('react');
		const { View, Text } = require('react-native');
		const mockCreateNavigator = (prefix: string) => ({
			Navigator: ({ children, ...props }: any) =>
				ReactLocal.createElement(View, { ...props, testID: `${prefix}.Navigator` }, children),
			Screen: ({ name, component: Component }: any) =>
				ReactLocal.createElement(
					View,
					{ testID: `${prefix}.Screen.${name}` },
					ReactLocal.createElement(Text, null, `${prefix}:${name}`),
					Component ? ReactLocal.createElement(Component) : null
				),
		});
		return mockCreateNavigator('Stack');
	},
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
	createBottomTabNavigator: () => {
		const ReactLocal = require('react');
		const { View, Text } = require('react-native');
		const mockCreateNavigator = (prefix: string) => ({
			Navigator: ({ children, ...props }: any) =>
				ReactLocal.createElement(View, { ...props, testID: `${prefix}.Navigator` }, children),
			Screen: ({ name, component: Component }: any) =>
				ReactLocal.createElement(
					View,
					{ testID: `${prefix}.Screen.${name}` },
					ReactLocal.createElement(Text, null, `${prefix}:${name}`),
					Component ? ReactLocal.createElement(Component) : null
				),
		});
		return mockCreateNavigator('Tabs');
	},
}));

jest.mock('@react-navigation/native', () => ({
	NavigationContainer: ({ children, onReady, ...props }: any) => {
		const ReactLocal = require('react');
		const { TouchableOpacity } = require('react-native');
		return ReactLocal.createElement(
			TouchableOpacity,
			{ testID: 'NavigationContainer', onPress: onReady, ...props },
			children
		);
	},
}));

jest.mock('../hooks/useAuth', () => ({
	__esModule: true,
	default: () => mockUseAuth(),
}));

// Mock usePermissions to break the import chain:
// AppNavigation → usePermissions → AuthenticatedApiService → react-native-toast-message (ESM)
jest.mock('../hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		hasPermission: jest.fn(() => false),
		hasAnyPermission: jest.fn(() => false),
		hasAllPermissions: jest.fn(() => false),
		isSuperuser: false,
		permissions: [],
		refreshPermissions: jest.fn(),
		isRefreshing: false,
	}),
}));

jest.mock('../contexts/ThemeContext', () => ({
	useTheme: () => mockUseTheme(),
}));

jest.mock('../services/DeepLinkingService', () => ({
	__esModule: true,
	default: {
		setNavigationRef: (...args: any[]) => mockSetNavigationRef(...args),
		setAuthState: (...args: any[]) => mockSetAuthState(...args),
		onNavigationReady: (...args: any[]) => mockOnNavigationReady(...args),
		init: (...args: any[]) => mockInit(...args),
	},
}));

jest.mock('../config/config', () => ({
	__esModule: true,
	default: {
		features: {
			enableSignup: true,
		},
	},
}));

jest.mock('../components/LoadingSpinner', () => ({
	__esModule: true,
	default: ({ visible }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, `LoadingSpinner:${String(visible)}`);
	},
}));

jest.mock('../screens/auth/LoginScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'LoginScreen');
	},
}));

jest.mock('../screens/auth/RegisterScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'RegisterScreen');
	},
}));

jest.mock('../screens/auth/ForgotPasswordScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'ForgotPasswordScreen');
	},
}));

jest.mock('../screens/auth/ResetPasswordScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'ResetPasswordScreen');
	},
}));

jest.mock('../screens/auth/EmailVerificationScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'EmailVerificationScreen');
	},
}));

jest.mock('../screens/main/HomeScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'HomeScreen');
	},
}));

jest.mock('../screens/main/DashboardScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'DashboardScreen');
	},
}));

jest.mock('../screens/main/ProfileScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'ProfileScreen');
	},
}));

jest.mock('../screens/main/SettingsScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'SettingsScreen');
	},
}));

jest.mock('../screens/NotFoundScreen', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'NotFoundScreen');
	},
}));

describe('AppNavigation', () => {
	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(config as any).features.enableSignup = true;

		mockUseTheme.mockReturnValue({
			colors: {
				primary: '#1',
				background: '#2',
				surface: '#3',
				text: '#4',
				border: '#5',
				error: '#6',
				textSecondary: '#7',
			},
		});

		mockUseAuth.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
			logout: jest.fn(),
		});

		mockInit.mockReturnValue(mockDeepLinkCleanup);
	});

	it('renders auth stack when user is unauthenticated', () => {
		const tree = renderWithAct(React.createElement(AppNavigation));

		expect(tree.root.findByProps({ children: 'LoginScreen' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'ForgotPasswordScreen' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'RegisterScreen' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'NotFoundScreen' })).toBeTruthy();
	});

	it('hides register route when signup feature is disabled', () => {
		(config as any).features.enableSignup = false;
		const tree = renderWithAct(React.createElement(AppNavigation));

		expect(tree.root.findByProps({ children: 'LoginScreen' })).toBeTruthy();
		expect(tree.root.findAllByProps({ children: 'RegisterScreen' })).toHaveLength(0);
	});

	it('renders main stack when user is authenticated', () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			logout: jest.fn(),
		});

		const tree = renderWithAct(React.createElement(AppNavigation));

		expect(tree.root.findByProps({ children: 'HomeScreen' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'DashboardScreen' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'ProfileScreen' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'SettingsScreen' })).toBeTruthy();
		expect(tree.root.findAllByProps({ children: 'LoginScreen' })).toHaveLength(0);
	});

	it('renders loading spinner while auth state is loading', () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: false,
			isLoading: true,
			logout: jest.fn(),
		});

		const tree = renderWithAct(React.createElement(AppNavigation));
		expect(tree.root.findByProps({ children: 'LoadingSpinner:true' })).toBeTruthy();
	});

	it('wires DeepLinkingService and starts it on navigation ready', () => {
		const logout = jest.fn();
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			logout,
		});

		const tree = renderWithAct(React.createElement(AppNavigation));

		expect(mockSetNavigationRef).toHaveBeenCalled();
		expect(mockSetAuthState).toHaveBeenCalledWith(true, logout);
		expect(mockOnNavigationReady).not.toHaveBeenCalled();

		const nav = tree.root.findByProps({ testID: 'NavigationContainer' });
		ReactTestRenderer.act(() => {
			nav.props.onPress();
		});

		expect(mockOnNavigationReady).toHaveBeenCalled();
		expect(mockInit).toHaveBeenCalled();

		ReactTestRenderer.act(() => {
			tree.unmount();
		});
		expect(mockDeepLinkCleanup).toHaveBeenCalled();
	});
});
