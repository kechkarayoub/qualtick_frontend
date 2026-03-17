import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';

import useAuth, { AuthProvider } from './useAuth';

const mockToastShow = jest.fn();
const mockHasValidToken = jest.fn();
const mockLogoutApi = jest.fn();
const mockClearTokens = jest.fn();
const mockSetTokens = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();

const mockGetSessionItem = jest.fn();
const mockGetItem = jest.fn();
const mockSetSessionItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockRemoveSessionItem = jest.fn();
const mockClearSession = jest.fn();

const mockQueryClient = {
	setQueryData: jest.fn(),
	invalidateQueries: jest.fn(),
	clear: jest.fn(),
};

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();

jest.mock('react-native-toast-message', () => ({
	__esModule: true,
	default: {
		show: (...args: any[]) => mockToastShow(...args),
	},
}));

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

jest.mock('@tanstack/react-query', () => ({
	__esModule: true,
	useQuery: (...args: any[]) => mockUseQuery(...args),
	useMutation: (...args: any[]) => mockUseMutation(...args),
	useQueryClient: () => mockQueryClient,
}));

jest.mock('../services/AuthenticatedApiService', () => ({
	__esModule: true,
	default: {
		getInstance: () => ({
			hasValidToken: (...args: any[]) => mockHasValidToken(...args),
			logout: (...args: any[]) => mockLogoutApi(...args),
			clearTokens: (...args: any[]) => mockClearTokens(...args),
			setTokens: (...args: any[]) => mockSetTokens(...args),
			post: (...args: any[]) => mockPost(...args),
			put: (...args: any[]) => mockPut(...args),
			onSessionExpired: undefined,
		}),
	},
}));

jest.mock('../services/SecureStorageService', () => ({
	__esModule: true,
	default: {
		getInstance: () => ({
			getSessionItem: (...args: any[]) => mockGetSessionItem(...args),
			getItem: (...args: any[]) => mockGetItem(...args),
			setSessionItem: (...args: any[]) => mockSetSessionItem(...args),
			setItem: (...args: any[]) => mockSetItem(...args),
			removeItem: (...args: any[]) => mockRemoveItem(...args),
			removeSessionItem: (...args: any[]) => mockRemoveSessionItem(...args),
			clearSession: (...args: any[]) => mockClearSession(...args),
		}),
	},
}));

describe('useAuth', () => {
	const flush = async () => {
		await ReactTestRenderer.act(async () => {
			await Promise.resolve();
		});
	};

	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockHasValidToken.mockResolvedValue(false);
		mockUseQuery.mockReturnValue({ data: null, isLoading: false, error: null });
		mockUseMutation.mockImplementation((options: any) => ({
			mutateAsync: async (...args: any[]) => {
				if (typeof options?.mutationFn === 'function') {
					return options.mutationFn(...args);
				}
				return undefined;
			},
			isPending: false,
		}));
		mockLogoutApi.mockResolvedValue(undefined);
		mockClearTokens.mockResolvedValue(undefined);
		mockClearSession.mockResolvedValue(undefined);
	});

	it('throws if useAuth is used outside AuthProvider', () => {
		const Bad = () => {
			useAuth();
			return null;
		};
		expect(() => renderWithAct(React.createElement(Bad))).toThrow('useAuth must be used within an AuthProvider');
	});

	it('provides initialized auth state from hasValidToken', async () => {
		mockHasValidToken.mockResolvedValue(true);

		const Probe = () => {
			const auth = useAuth();
			return React.createElement(Text, null, `${auth.isAuthenticated}:${auth.isInitialized}`);
		};

		const tree = renderWithAct(
			React.createElement(AuthProvider, null, React.createElement(Probe))
		);

		await flush();
		expect(mockHasValidToken).toHaveBeenCalled();
		expect(tree.root.findByProps({ children: 'true:true' })).toBeTruthy();
	});

	it('logout clears session and query cache', async () => {
		mockHasValidToken.mockResolvedValue(true);

		const Probe = () => {
			const auth = useAuth();
			return React.createElement(
				TouchableOpacity,
				{ onPress: () => auth.logout(false) },
				React.createElement(Text, null, 'logout')
			);
		};

		const tree = renderWithAct(
			React.createElement(AuthProvider, null, React.createElement(Probe))
		);

		await flush();
		const btn = tree.root.findByType(TouchableOpacity);
		await ReactTestRenderer.act(async () => {
			await btn.props.onPress();
		});

		expect(mockLogoutApi).toHaveBeenCalled();
		expect(mockClearSession).toHaveBeenCalled();
		expect(mockQueryClient.clear).toHaveBeenCalled();
		expect(mockToastShow).toHaveBeenCalled();
	});
});
