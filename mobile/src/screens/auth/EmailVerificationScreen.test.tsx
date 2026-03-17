import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import EmailVerificationScreen from './EmailVerificationScreen';

const mockNavigate = jest.fn();
const mockUseRoute = jest.fn();
const mockGet = jest.fn();
const mockToastShow = jest.fn();
const mockT = jest.fn((k: string) => k);
const mockI18n = { language: 'en' };

const mockTheme = {
	colors: {
		background: '#111',
		text: '#222',
		textSecondary: '#333',
		error: '#f00',
		success: '#0f0',
		primary: '#00f',
	},
};

const mockApiService = {
	get: (...args: any[]) => mockGet(...args),
};

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => ({ navigate: (...args: any[]) => mockNavigate(...args) }),
	useRoute: () => mockUseRoute(),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockT,
		i18n: mockI18n,
	}),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => mockTheme,
}));

jest.mock('../../services/UnauthenticatedApiService', () => ({
	__esModule: true,
	default: {
		getInstance: () => mockApiService,
	},
}));

jest.mock('react-native-toast-message', () => ({
	__esModule: true,
	default: {
		show: (...args: any[]) => mockToastShow(...args),
	},
}));

jest.mock('../../components/AppHeader', () => ({
	__esModule: true,
	default: ({ title }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, title);
	},
}));

jest.mock('../../components/LoadingSpinner', () => ({
	__esModule: true,
	default: ({ visible }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, `Loading:${String(visible)}`);
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

describe('EmailVerificationScreen', () => {
	const flush = async () => {
		await ReactTestRenderer.act(async () => {
			await Promise.resolve();
		});
	};

	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(EmailVerificationScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockI18n.language = 'en';
		mockUseRoute.mockReturnValue({ params: { uid: 'uid-1', token: 'token-1' } });
		mockGet.mockResolvedValue({
			status: 200,
			data: { message: 'verified', already_verified: false },
		});
	});

	it('shows invalid link state when uid/token are missing and allows navigation actions', async () => {
		mockUseRoute.mockReturnValue({ params: { uid: '', token: '' } });

		const tree = renderWithAct();
		await flush();

		expect(tree.root.findAllByProps({ children: 'auth:emailVerification.invalidLinkTitle' }).length).toBeGreaterThan(0);

		const goToRegister = tree.root.findByProps({ testID: 'btn:auth:emailVerification.goToRegister' });
		const backToLogin = tree.root.findByProps({ testID: 'btn:auth:emailVerification.backToLogin' });

		ReactTestRenderer.act(() => {
			goToRegister.props.onPress();
			backToLogin.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Register');
		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});

	it('verifies token on mount, shows success state, and navigates to login', async () => {
		const tree = renderWithAct();
		await flush();

		expect(mockGet).toHaveBeenCalledWith(
			'/accounts/verify-email/?uid=uid-1&token=token-1&selected_language=en'
		);
		expect(mockToastShow).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'success', text1: 'auth:emailVerification.successTitle' })
		);

		const loginNow = tree.root.findByProps({ testID: 'btn:auth:emailVerification.loginNow' });
		ReactTestRenderer.act(() => {
			loginNow.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});

	it('shows resend flow and switches to resent state when resend marks email as sent', async () => {
		mockGet
			.mockRejectedValueOnce({
				response: {
					status: 400,
					data: { message: 'expired', expired: true, new_verification_email_sent: false },
				},
			})
			.mockRejectedValueOnce({
				response: {
					data: { message: 'resent', new_verification_email_sent: true },
				},
			});

		const tree = renderWithAct();
		await flush();

		const resend = tree.root.findByProps({ testID: 'btn:auth:emailVerification.resendButton' });
		await ReactTestRenderer.act(async () => {
			await resend.props.onPress();
		});

		expect(mockGet).toHaveBeenLastCalledWith(
			'/accounts/verify-email/?uid=uid-1&token=token-1&resend_verification_email=true&selected_language=en'
		);
		expect(tree.root.findAllByProps({ children: 'auth:emailVerification.emailResentTitle' }).length).toBeGreaterThan(0);
	});
});
