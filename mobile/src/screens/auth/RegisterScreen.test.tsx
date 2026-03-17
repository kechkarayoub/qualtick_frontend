import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import RegisterScreen from './RegisterScreen';
import config from '../../config/config';

const mockNavigate = jest.fn();
const mockHandleSubmit = jest.fn();
const mockSetError = jest.fn();
const mockWatch = jest.fn();

const mockRegister = jest.fn();
const mockSocialLogin = jest.fn();

const mockOpenPrivacy = jest.fn();
const mockOpenTerms = jest.fn();
const mockOpenCookies = jest.fn();
const mockRecordConsent = jest.fn();

const mockFormValues = {
	firstName: ' John ',
	lastName: ' Doe ',
	username: ' johndoe ',
	email: ' john@example.com ',
	password: 'Pass1234',
	confirmPassword: 'Pass1234',
	acceptTerms: true,
	acceptPrivacy: true,
	acceptCookies: true,
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
		watch: (...args: any[]) => mockWatch(...args),
	}),
	Controller: ({ name, render }: any) =>
		render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: (mockFormValues as any)[name] } }),
}));

jest.mock('../../hooks/useAuth', () => ({
	__esModule: true,
	default: () => ({
		register: (...args: any[]) => mockRegister(...args),
		socialLogin: (...args: any[]) => mockSocialLogin(...args),
		isRegistering: false,
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
			primary: '#00f',
			border: '#555',
			warning: '#f90',
			error: '#f00',
			success: '#0f0',
		},
	}),
}));

jest.mock('../../config/config', () => ({
	__esModule: true,
	default: {
		features: {
			enableSocialLogin: true,
			enableGoogleLogin: true,
			enableFacebookLogin: false,
			enableAppleLogin: false,
		},
	},
}));

jest.mock('../../components/modals/ModalManager', () => ({
	usePrivacyPolicyModal: () => ({ open: (...args: any[]) => mockOpenPrivacy(...args) }),
	useTermsOfServiceModal: () => ({ open: (...args: any[]) => mockOpenTerms(...args) }),
	useCookiesPolicyModal: () => ({ open: (...args: any[]) => mockOpenCookies(...args) }),
}));

jest.mock('../../utils/ConsentManager', () => ({
	__esModule: true,
	default: {
		recordConsent: (...args: any[]) => mockRecordConsent(...args),
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

jest.mock('../../components/form/CustomTextInput', () => ({
	__esModule: true,
	default: ({ label, rightIcon }: any) => {
		const ReactLocal = require('react');
		const { View, Text } = require('react-native');
		return ReactLocal.createElement(View, null, ReactLocal.createElement(Text, null, label), rightIcon);
	},
}));

jest.mock('../../components/form/CustomCheckbox', () => ({
	__esModule: true,
	default: ({ label }: any) => {
		const ReactLocal = require('react');
		const { View } = require('react-native');
		return ReactLocal.createElement(View, null, label);
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
				onPress: () => onSuccess({ user: { email: 'social@example.com' }, idToken: 'social-token', provider }),
			},
			ReactLocal.createElement(Text, null, `social:${provider}`)
		);
	},
}));

jest.mock('../../components/modals/OAuthConsentModal', () => ({
	__esModule: true,
	default: ({ visible, onAccept, onDecline }: any) => {
		const ReactLocal = require('react');
		const { View, TouchableOpacity, Text } = require('react-native');
		if (!visible) {
			return null;
		}
		return ReactLocal.createElement(
			View,
			null,
			ReactLocal.createElement(
				TouchableOpacity,
				{ testID: 'oauth-accept', onPress: () => onAccept({ acceptTerms: true, acceptPrivacy: true, acceptCookies: true, consentTimestamp: 'ts', consentMethod: 'oauth' }) },
				ReactLocal.createElement(Text, null, 'accept')
			),
			ReactLocal.createElement(
				TouchableOpacity,
				{ testID: 'oauth-decline', onPress: onDecline },
				ReactLocal.createElement(Text, null, 'decline')
			)
		);
	},
}));

describe('RegisterScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(RegisterScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(config as any).features.enableSocialLogin = true;
		(config as any).features.enableGoogleLogin = true;
		(config as any).features.enableFacebookLogin = false;
		(config as any).features.enableAppleLogin = false;
		mockWatch.mockImplementation((field: string) => (field === 'password' ? 'Pass1234' : undefined));
		mockHandleSubmit.mockImplementation((cb: any) => () => cb(mockFormValues));
		mockRegister.mockResolvedValue(undefined);
		mockSocialLogin.mockResolvedValue(undefined);
	});

	it('submits registration with trimmed values and consent data', async () => {
		const tree = renderWithAct();
		const submit = tree.root.findByProps({ testID: 'btn:auth:register.createAccountButton' });

		await ReactTestRenderer.act(async () => {
			await submit.props.onPress();
		});

		expect(mockRegister).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'john@example.com',
				firstName: 'John',
				lastName: 'Doe',
				username: 'johndoe',
				password: 'Pass1234',
				confirmPassword: 'Pass1234',
				consentData: expect.objectContaining({
					acceptTerms: true,
					acceptPrivacy: true,
					acceptCookies: true,
					consentMethod: 'traditional',
				}),
			})
		);
		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});

	it('guards against duplicate submit while first request is pending', async () => {
		let resolveRegister: () => void = () => undefined;
		mockRegister.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					resolveRegister = resolve;
				})
		);

		const tree = renderWithAct();
		const submit = tree.root.findByProps({ testID: 'btn:auth:register.createAccountButton' });

		await ReactTestRenderer.act(async () => {
			submit.props.onPress();
			submit.props.onPress();
			await Promise.resolve();
		});

		expect(mockRegister).toHaveBeenCalledTimes(1);

		await ReactTestRenderer.act(async () => {
			resolveRegister();
			await Promise.resolve();
		});
	});

	it('runs social registration after oauth consent acceptance', async () => {
		const tree = renderWithAct();
		const google = tree.root.findByProps({ testID: 'social:google' });

		ReactTestRenderer.act(() => {
			google.props.onPress();
		});

		const accept = tree.root.findByProps({ testID: 'oauth-accept' });
		await ReactTestRenderer.act(async () => {
			await accept.props.onPress();
		});

		expect(mockSocialLogin).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'social@example.com',
				id_token: 'social-token',
				type_third_party: 'google',
				selected_language: 'fr',
				consentData: expect.objectContaining({ consentMethod: 'oauth' }),
			})
		);
		expect(mockRecordConsent).toHaveBeenCalled();
	});

	it('navigates to login when sign-in link is pressed', () => {
		const tree = renderWithAct();

		const signInTextNode = tree.root.findAllByProps({ children: 'auth:login.signInButton' })[0] as ReactTestRenderer.ReactTestInstance;
		let signIn: ReactTestRenderer.ReactTestInstance | null = signInTextNode;
		while (signIn && typeof signIn.props.onPress !== 'function') {
			signIn = signIn.parent;
		}
		expect(signIn).toBeTruthy();

		ReactTestRenderer.act(() => {
			signIn!.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});
});
