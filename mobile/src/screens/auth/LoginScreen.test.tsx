import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import LoginScreen from './LoginScreen';
import config from '../../config/config';

const mockNavigate = jest.fn();
const mockHandleSubmit = jest.fn();
const mockSetError = jest.fn();

const mockLogin = jest.fn();
const mockSocialLogin = jest.fn();
const mockResendVerification = jest.fn();

const mockToastShow = jest.fn();

const mockFormValues = {
	email_or_username: 'alice',
	password: 'Pass1234',
	rememberMe: false,
};

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => ({ navigate: (...args: any[]) => mockNavigate(...args) }),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

jest.mock('react-hook-form', () => ({
	useForm: () => ({
		control: {},
		handleSubmit: (...args: any[]) => mockHandleSubmit(...args),
		formState: { errors: {} },
		setError: (...args: any[]) => mockSetError(...args),
	}),
	Controller: ({ name, render }: any) =>
		render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: mockFormValues[name as keyof typeof mockFormValues] || '' } }),
}));

jest.mock('../../hooks/useAuth', () => ({
	__esModule: true,
	default: () => ({
		login: (...args: any[]) => mockLogin(...args),
		socialLogin: (...args: any[]) => mockSocialLogin(...args),
		resendEmailVerification: (...args: any[]) => mockResendVerification(...args),
		isLoggingIn: false,
	}),
}));

jest.mock('../../contexts/LanguageContext', () => ({
	useLanguage: () => ({ language: 'fr' }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			text: '#222',
			textSecondary: '#333',
			surface: '#444',
			warning: '#ffa500',
			border: '#888',
			primary: '#00f',
		},
	}),
}));

jest.mock('../../config/config', () => ({
	__esModule: true,
	default: {
		features: {
			enableSignup: true,
			enableSocialLogin: true,
			enableGoogleLogin: true,
			enableFacebookLogin: false,
			enableAppleLogin: false,
		},
	},
}));

jest.mock('react-native-toast-message', () => ({
	__esModule: true,
	default: { show: (...args: any[]) => mockToastShow(...args) },
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

jest.mock('../../components/form/CustomTextInput', () => ({
	__esModule: true,
	default: ({ label, rightIcon }: any) => {
		const ReactLocal = require('react');
		const { View, Text } = require('react-native');
		return ReactLocal.createElement(View, null, ReactLocal.createElement(Text, null, label), rightIcon);
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

jest.mock('../../components/SocialLoginButton', () => ({
	__esModule: true,
	default: ({ provider, onSuccess }: any) => {
		const ReactLocal = require('react');
		const { TouchableOpacity, Text } = require('react-native');
		return ReactLocal.createElement(
			TouchableOpacity,
			{
				testID: `social:${provider}`,
				onPress: () => onSuccess({ user: { email: 'social@example.com' }, idToken: 'token-1', provider }),
			},
			ReactLocal.createElement(Text, null, `social:${provider}`)
		);
	},
}));

describe('LoginScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(LoginScreen));
		});
		return tree;
	};

	const flush = async () => {
		await ReactTestRenderer.act(async () => {
			await Promise.resolve();
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(config as any).features.enableSignup = true;
		(config as any).features.enableSocialLogin = true;
		(config as any).features.enableGoogleLogin = true;
		(config as any).features.enableFacebookLogin = false;
		(config as any).features.enableAppleLogin = false;
		mockHandleSubmit.mockImplementation((cb: any) => () => cb(mockFormValues));
		mockLogin.mockResolvedValue(undefined);
		mockSocialLogin.mockResolvedValue(undefined);
		mockResendVerification.mockResolvedValue({ message: 'resent', already_verified: false });
	});

	it('submits login credentials using mapped fields', async () => {
		const tree = renderWithAct();
		const signIn = tree.root.findByProps({ testID: 'btn:auth:login.signInButton' });

		await ReactTestRenderer.act(async () => {
			await signIn.props.onPress();
		});

		expect(mockLogin).toHaveBeenCalledWith({
			email_or_username: 'alice',
			password: 'Pass1234',
			rememberMe: false,
		});
	});

	it('shows verification-required message and resends verification email', async () => {
		mockLogin.mockRejectedValue({
			response: {
				status: 403,
				data: {
					email_verification_required: true,
					user_id: 'u-11',
					email: 'alice@example.com',
					message: 'verify first',
				},
			},
		});

		const tree = renderWithAct();
		const signIn = tree.root.findByProps({ testID: 'btn:auth:login.signInButton' });

		await ReactTestRenderer.act(async () => {
			await signIn.props.onPress();
		});
		await flush();

		expect(mockToastShow).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'info', text1: 'auth:emailVerification.title' })
		);

		const resend = tree.root.findByProps({ testID: 'btn:auth:emailVerification.resendButton' });
		await ReactTestRenderer.act(async () => {
			await resend.props.onPress();
		});

		expect(mockResendVerification).toHaveBeenCalledWith({
			user_id: 'u-11',
			selected_language: 'fr',
		});
	});

	it('handles social login callback using selected language', async () => {
		const tree = renderWithAct();
		const google = tree.root.findByProps({ testID: 'social:google' });

		await ReactTestRenderer.act(async () => {
			await google.props.onPress();
		});

		expect(mockSocialLogin).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'social@example.com',
				id_token: 'token-1',
				type_third_party: 'google',
				selected_language: 'fr',
			})
		);
	});

	it('navigates to forgot-password and conditionally shows signup link', () => {
		let tree = renderWithAct();

		const forgotTextNode = tree.root.findAllByProps({ children: 'auth:login.forgotPassword' })[0] as ReactTestRenderer.ReactTestInstance;
		let forgot: ReactTestRenderer.ReactTestInstance | null = forgotTextNode;
		while (forgot && typeof forgot.props.onPress !== 'function') {
			forgot = forgot.parent;
		}
		expect(forgot).toBeTruthy();

		ReactTestRenderer.act(() => {
			forgot!.props.onPress();
		});
		expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');

		const signUpTextNode = tree.root.findAllByProps({ children: 'auth:login.signUpLink' })[0] as ReactTestRenderer.ReactTestInstance;
		let signUpLink: ReactTestRenderer.ReactTestInstance | null = signUpTextNode;
		while (signUpLink && typeof signUpLink.props.onPress !== 'function') {
			signUpLink = signUpLink.parent;
		}
		expect(signUpLink).toBeTruthy();

		ReactTestRenderer.act(() => {
			signUpLink!.props.onPress();
		});
		expect(mockNavigate).toHaveBeenCalledWith('Register');

		(config as any).features.enableSignup = false;
		tree = renderWithAct();
		expect(tree.root.findAllByProps({ children: 'auth:login.signUpLink' })).toHaveLength(0);
	});
});
