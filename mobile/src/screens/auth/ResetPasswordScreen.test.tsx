import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import ResetPasswordScreen from './ResetPasswordScreen';

const mockNavigate = jest.fn();
const mockUseRoute = jest.fn();
const mockPost = jest.fn();
const mockToastShow = jest.fn();
const mockHandleSubmit = jest.fn();

const mockFormValues = {
	password: 'Pass12345',
	confirmPassword: 'Pass12345',
};

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => ({ navigate: (...args: any[]) => mockNavigate(...args) }),
	useRoute: () => mockUseRoute(),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

jest.mock('react-hook-form', () => ({
	useForm: () => ({
		control: {},
		handleSubmit: (...args: any[]) => mockHandleSubmit(...args),
		formState: { errors: {} },
	}),
	Controller: ({ name, render }: any) =>
		render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: mockFormValues[name as keyof typeof mockFormValues] || '' } }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			text: '#222',
			textSecondary: '#333',
			error: '#f00',
			success: '#0f0',
			primary: '#00f',
		},
	}),
}));

jest.mock('../../services/UnauthenticatedApiService', () => ({
	__esModule: true,
	default: {
		getInstance: () => ({
			post: (...args: any[]) => mockPost(...args),
		}),
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

describe('ResetPasswordScreen', () => {
	const flush = async () => {
		await ReactTestRenderer.act(async () => {
			await Promise.resolve();
		});
	};

	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(ResetPasswordScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseRoute.mockReturnValue({ params: { uid: 'uid-1', token: 'token-1' } });
		mockHandleSubmit.mockImplementation((cb: any) => () => cb(mockFormValues));
		mockPost.mockResolvedValue({});
	});

	it('shows invalid-token state when uid/token are missing and handles navigation', async () => {
		mockUseRoute.mockReturnValue({ params: {} });

		const tree = renderWithAct();
		await flush();

		expect(tree.root.findAllByProps({ children: 'auth:resetPassword.invalidTokenTitle' }).length).toBeGreaterThan(0);

		const requestNewToken = tree.root.findByProps({ testID: 'btn:auth:resetPassword.requestNewToken' });
		const backToLogin = tree.root.findByProps({ testID: 'btn:auth:resetPassword.backToLogin' });

		ReactTestRenderer.act(() => {
			requestNewToken.props.onPress();
			backToLogin.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});

	it('submits reset-password request and renders success state', async () => {
		const tree = renderWithAct();
		await flush();

		const resetBtn = tree.root.findByProps({ testID: 'btn:auth:resetPassword.button' });
		await ReactTestRenderer.act(async () => {
			await resetBtn.props.onPress();
		});

		expect(mockPost).toHaveBeenCalledWith('/accounts/reset-password/', {
			uid: 'uid-1',
			token: 'token-1',
			new_password: 'Pass12345',
			selected_language: 'en',
		});
		expect(tree.root.findAllByProps({ children: 'auth:resetPassword.successTitle' }).length).toBeGreaterThan(0);

		const loginNow = tree.root.findByProps({ testID: 'btn:auth:resetPassword.loginNow' });
		ReactTestRenderer.act(() => {
			loginNow.props.onPress();
		});
		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});

	it('shows server message and error toast when reset fails', async () => {
		mockPost.mockRejectedValue({ response: { status: 400, data: { message: 'Token invalid' } } });

		const tree = renderWithAct();
		await flush();

		const resetBtn = tree.root.findByProps({ testID: 'btn:auth:resetPassword.button' });
		await ReactTestRenderer.act(async () => {
			await resetBtn.props.onPress();
		});

		expect(mockToastShow).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'error', text1: 'auth:resetPassword.errorTitle', text2: 'Token invalid' })
		);
		expect(tree.root.findByProps({ children: 'Token invalid' })).toBeTruthy();
	});
});
