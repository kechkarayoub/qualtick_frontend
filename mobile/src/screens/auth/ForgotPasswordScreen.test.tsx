import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import ForgotPasswordScreen from './ForgotPasswordScreen';

const mockNavigate = jest.fn();
const mockPost = jest.fn();
const mockToastShow = jest.fn();
const mockHandleSubmit = jest.fn();
const mockGetValues = jest.fn();

const mockFormValues = {
	email_or_username: 'user@example.com',
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
		getValues: (...args: any[]) => mockGetValues(...args),
	}),
	Controller: ({ name, render }: any) =>
		render({
			field: { onChange: jest.fn(), onBlur: jest.fn(), value: mockFormValues[name as keyof typeof mockFormValues] || '' },
		}),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			text: '#222',
			textSecondary: '#333',
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
	default: ({ label }: any) => {
		const ReactLocal = require('react');
		const { View, Text } = require('react-native');
		return ReactLocal.createElement(View, null, ReactLocal.createElement(Text, null, label));
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

describe('ForgotPasswordScreen', () => {
	const flush = async () => {
		await ReactTestRenderer.act(async () => {
			await Promise.resolve();
		});
	};

	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(ForgotPasswordScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockHandleSubmit.mockImplementation((cb: any) => () => cb(mockFormValues));
		mockGetValues.mockImplementation((key: string) => mockFormValues[key as keyof typeof mockFormValues]);
		mockPost.mockResolvedValue({ data: { message: 'auth:forgotPassword.emailSentMessage' } });
	});

	it('submits forgot-password request and renders success state', async () => {
		const tree = renderWithAct();
		const sendButton = tree.root.findByProps({ testID: 'btn:auth:forgotPassword.sendButton' });

		await ReactTestRenderer.act(async () => {
			await sendButton.props.onPress();
		});
		await flush();

		expect(mockPost).toHaveBeenCalledWith('/accounts/forgot-password/', {
			email_or_username: 'user@example.com',
			selected_language: 'en',
		});
		expect(tree.root.findAllByProps({ children: 'auth:forgotPassword.emailSentTitle' }).length).toBeGreaterThan(0);

		const backToLogin = tree.root.findByProps({ testID: 'btn:auth:forgotPassword.backToLogin' });
		ReactTestRenderer.act(() => {
			backToLogin.props.onPress();
		});
		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});

	it('shows error toast when request fails', async () => {
		mockPost.mockRejectedValue({ response: { data: { message: 'Request failed' } } });
		const tree = renderWithAct();

		const sendButton = tree.root.findByProps({ testID: 'btn:auth:forgotPassword.sendButton' });
		await ReactTestRenderer.act(async () => {
			await sendButton.props.onPress();
		});

		expect(mockToastShow).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'error', text1: 'auth:forgotPassword.errorTitle', text2: 'Request failed' })
		);
	});

	it('navigates to login from footer sign-in link', () => {
		const tree = renderWithAct();

		const signInTextNode = tree.root.findAllByProps({ children: 'auth:login.signInButton' })[0] as ReactTestRenderer.ReactTestInstance;
		let signInLink: ReactTestRenderer.ReactTestInstance | null = signInTextNode;
		while (signInLink && typeof signInLink.props.onPress !== 'function') {
			signInLink = signInLink.parent;
		}
		expect(signInLink).toBeTruthy();

		ReactTestRenderer.act(() => {
			signInLink!.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Login');
	});
});
