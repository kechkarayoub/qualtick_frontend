import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import RNBootSplash from 'react-native-bootsplash';

import App from './App';
import useAuth from './src/hooks/useAuth';
import useAuthenticatedWebSocket from './src/hooks/useAuthenticatedWebSocket';
import { useTheme } from './src/contexts/ThemeContext';

jest.mock('./src/i18n', () => ({}));

jest.mock('./src/navigation/AppNavigation', () => {
	const { Text: TextLocal } = require('react-native');
	return () => <TextLocal testID="app-navigation">AppNavigation</TextLocal>;
});

jest.mock('./src/components/SplashScreen', () => {
	const { Text: TextLocal } = require('react-native');
	return (props: { isVisible?: boolean }) =>
		props.isVisible ? <TextLocal testID="splash-screen">SplashScreen</TextLocal> : null;
});

jest.mock('react-native-toast-message', () => {
	const { Text: TextLocal } = require('react-native');
	return {
		__esModule: true,
		default: () => <TextLocal testID="toast-component">Toast</TextLocal>,
	};
});

jest.mock('react-native-gesture-handler', () => {
	const { View: ViewLocal } = require('react-native');
	return {
		GestureHandlerRootView: ({ children, style }: { children: React.ReactNode; style?: any }) => (
			<ViewLocal testID="gesture-root" style={style}>
				{children}
			</ViewLocal>
		),
	};
});

jest.mock('react-native-bootsplash', () => ({
	__esModule: true,
	default: {
		hide: jest.fn().mockResolvedValue(undefined),
	},
}));

jest.mock('./src/contexts/ThemeContext', () => ({
	__esModule: true,
	ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useTheme: jest.fn(),
}));

jest.mock('./src/contexts/LanguageContext', () => ({
	__esModule: true,
	LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./src/components/modals/ModalManager', () => ({
	__esModule: true,
	ModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./src/hooks/useAuth', () => ({
	__esModule: true,
	default: jest.fn(),
	AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./src/hooks/useAuthenticatedWebSocket', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('App', () => {
	const mockUseAuth = useAuth as jest.Mock;
	const mockUseTheme = useTheme as jest.Mock;
	const mockUseAuthenticatedWebSocket = useAuthenticatedWebSocket as jest.Mock;
	const mockBootSplashHide = RNBootSplash.hide as jest.Mock;

	const renderApp = async () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		await ReactTestRenderer.act(async () => {
			tree = ReactTestRenderer.create(<App />);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });
		mockUseAuth.mockReturnValue({ isLoading: false, isInitialized: true });
		mockUseAuthenticatedWebSocket.mockImplementation(() => undefined);
		mockBootSplashHide.mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('renders core app layout and runs websocket hook', async () => {
		const tree = await renderApp();

		expect(tree.root.findByProps({ testID: 'gesture-root' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'app-navigation' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'toast-component' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'splash-screen' })).toBeTruthy();
		expect(mockUseAuthenticatedWebSocket).toHaveBeenCalled();

		await ReactTestRenderer.act(async () => {
			jest.runOnlyPendingTimers();
		});
		await ReactTestRenderer.act(async () => {
			tree.unmount();
		});
	});

	it('uses dark status bar style when theme is dark', async () => {
		mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' });
		const tree = await renderApp();

		const statusBar = tree.root.findByType(require('react-native').StatusBar);
		expect(statusBar.props.barStyle).toBe('light-content');

		await ReactTestRenderer.act(async () => {
			jest.runOnlyPendingTimers();
		});
		await ReactTestRenderer.act(async () => {
			tree.unmount();
		});
	});

	it('runs initialization timers and calls native bootsplash hide', async () => {
		const tree = await renderApp();

		await ReactTestRenderer.act(async () => {
			jest.advanceTimersByTime(2200);
		});

		expect(mockBootSplashHide).toHaveBeenCalledWith({ fade: true });
		await ReactTestRenderer.act(async () => {
			tree.unmount();
		});
	});
});

