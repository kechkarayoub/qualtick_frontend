import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

import SocialLoginButton from './SocialLoginButton';

const mockUseTheme = jest.fn();
const mockT = jest.fn((key: string, options?: any) => options?.defaultValue || key);

const mockIsGoogleSignInAvailable = jest.fn();
const mockIsFacebookSignInAvailable = jest.fn();
const mockIsAppleSignInAvailable = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithFacebook = jest.fn();
const mockSignInWithApple = jest.fn();

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('react-native-vector-icons/FontAwesome', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return ({ name }: any) => <Text>{`fa-${name}`}</Text>;
});

jest.mock('react-native-vector-icons/AntDesign', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return ({ name }: any) => <Text>{`ant-${name}`}</Text>;
});

jest.mock('../services/SocialAuthService', () => ({
	__esModule: true,
	default: {
		getInstance: () => ({
			isGoogleSignInAvailable: (...args: any[]) => mockIsGoogleSignInAvailable(...args),
			isFacebookSignInAvailable: (...args: any[]) => mockIsFacebookSignInAvailable(...args),
			isAppleSignInAvailable: (...args: any[]) => mockIsAppleSignInAvailable(...args),
			signInWithGoogle: (...args: any[]) => mockSignInWithGoogle(...args),
			signInWithFacebook: (...args: any[]) => mockSignInWithFacebook(...args),
			signInWithApple: (...args: any[]) => mockSignInWithApple(...args),
		}),
	},
}));

describe('SocialLoginButton', () => {
	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockUseTheme.mockReturnValue({
			colors: {
				surface: '#f8f8f8',
				text: '#111',
				border: '#ddd',
			},
		});

		mockIsGoogleSignInAvailable.mockReturnValue(true);
		mockIsFacebookSignInAvailable.mockReturnValue(true);
		mockIsAppleSignInAvailable.mockReturnValue(true);
	});

	it('returns null when provider is unavailable', () => {
		mockIsGoogleSignInAvailable.mockReturnValue(false);

		const tree = renderWithAct(
			<SocialLoginButton provider="google" onSuccess={jest.fn()} onError={jest.fn()} />
		);

		expect(tree.toJSON()).toBeNull();
	});

	it('calls onSuccess with google auth result', async () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const result = { token: 'token-1', provider: 'google' } as any;
		mockSignInWithGoogle.mockResolvedValue(result);

		const tree = renderWithAct(
			<SocialLoginButton provider="google" onSuccess={onSuccess} onError={onError} />
		);

		const button = tree.root.findByType(TouchableOpacity);
		await ReactTestRenderer.act(async () => {
			await button.props.onPress();
		});

		expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
		expect(onSuccess).toHaveBeenCalledWith(result);
		expect(onError).not.toHaveBeenCalled();
	});

	it('calls onError when auth throws', async () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const authError = new Error('Google failed');
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockSignInWithGoogle.mockRejectedValue(authError);

		const tree = renderWithAct(
			<SocialLoginButton provider="google" onSuccess={onSuccess} onError={onError} />
		);

		const button = tree.root.findByType(TouchableOpacity);
		await ReactTestRenderer.act(async () => {
			await button.props.onPress();
		});

		expect(onSuccess).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledWith(authError);

		consoleSpy.mockRestore();
	});

	it('shows loading indicator text while request is in progress', async () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();

		let resolvePromise: (value: any) => void = () => {};
		const pending = new Promise((resolve) => {
			resolvePromise = resolve;
		});
		mockSignInWithGoogle.mockReturnValue(pending);

		const tree = renderWithAct(
			<SocialLoginButton provider="google" onSuccess={onSuccess} onError={onError} />
		);

		const button = tree.root.findByType(TouchableOpacity);
		let pressPromise: Promise<void>;
		ReactTestRenderer.act(() => {
			pressPromise = button.props.onPress();
		});

		expect(tree.root.findByProps({ children: 'common:app.progress...' })).toBeTruthy();
		expect(tree.root.findByType(ActivityIndicator)).toBeTruthy();

		await ReactTestRenderer.act(async () => {
			resolvePromise({ token: 'token-2', provider: 'google' });
			await pressPromise!;
		});
	});

	it('does not trigger when disabled', async () => {
		const tree = renderWithAct(
			<SocialLoginButton provider="google" onSuccess={jest.fn()} onError={jest.fn()} disabled />
		);

		const button = tree.root.findByType(TouchableOpacity);
		expect(button.props.disabled).toBe(true);

		await ReactTestRenderer.act(async () => {
			await button.props.onPress();
		});

		expect(mockSignInWithGoogle).not.toHaveBeenCalled();
	});
});
