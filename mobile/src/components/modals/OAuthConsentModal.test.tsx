import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import OAuthConsentModal from './OAuthConsentModal';

const mockUseTheme = jest.fn();
const mockT = jest.fn((key: string, options?: any) => options?.defaultValue || key);

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return ({ name }: any) => <Text>{`icon-${name}`}</Text>;
});

jest.mock('../form/CustomButton', () => {
	const React = require('react');
	const { TouchableOpacity, Text } = require('react-native');
	return ({ title, onPress, disabled, loadingTitle, loading }: any) => (
		<TouchableOpacity onPress={onPress} disabled={disabled}>
			<Text>{loading ? loadingTitle : title}</Text>
		</TouchableOpacity>
	);
});

describe('OAuthConsentModal', () => {
	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	const findPressableAncestor = (node: ReactTestRenderer.ReactTestInstance | null | undefined) => {
		let current: any = node;
		while (current && typeof current.props?.onPress !== 'function') {
			current = current.parent;
		}
		return current;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseTheme.mockReturnValue({
			colors: {
				background: '#fff',
				border: '#ddd',
				text: '#111',
				textSecondary: '#666',
				primary: '#00f',
				warning: '#fa0',
				surface: '#f8f8f8',
			},
		});
	});

	it('renders provider and email details', () => {
		const tree = renderWithAct(
			<OAuthConsentModal
				visible
				provider="google"
				email="user@example.com"
				onAccept={jest.fn()}
				onDecline={jest.fn()}
				onViewPolicy={jest.fn()}
			/>
		);

		expect(tree.root.findByProps({ children: 'Welcome to Qualitick' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Signing in with Google' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'user@example.com' })).toBeTruthy();
	});

	it('calls onViewPolicy for each policy card', () => {
		const onViewPolicy = jest.fn();
		const tree = renderWithAct(
			<OAuthConsentModal
				visible
				provider="google"
				onAccept={jest.fn()}
				onDecline={jest.fn()}
				onViewPolicy={onViewPolicy}
			/>
		);

		const termsCard = findPressableAncestor(tree.root.findByProps({ children: 'Terms of Service' }));
		const privacyCard = findPressableAncestor(tree.root.findByProps({ children: 'Privacy Policy' }));
		const cookiesCard = findPressableAncestor(tree.root.findByProps({ children: 'Cookies Policy' }));

		ReactTestRenderer.act(() => {
			termsCard.props.onPress();
			privacyCard.props.onPress();
			cookiesCard.props.onPress();
		});

		expect(onViewPolicy).toHaveBeenCalledWith('terms');
		expect(onViewPolicy).toHaveBeenCalledWith('privacy');
		expect(onViewPolicy).toHaveBeenCalledWith('cookies');
	});

	it('calls onAccept with consent payload', async () => {
		const onAccept = jest.fn().mockResolvedValue(undefined);
		const tree = renderWithAct(
			<OAuthConsentModal
				visible
				provider="google"
				onAccept={onAccept}
				onDecline={jest.fn()}
				onViewPolicy={jest.fn()}
			/>
		);

		const acceptButton = findPressableAncestor(tree.root.findByProps({ children: 'Accept & Continue' }));
		await ReactTestRenderer.act(async () => {
			await acceptButton.props.onPress();
		});

		expect(onAccept).toHaveBeenCalledTimes(1);
		expect(onAccept.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				acceptTerms: true,
				acceptPrivacy: true,
				acceptCookies: true,
				consentMethod: 'oauth',
			})
		);
		expect(onAccept.mock.calls[0][0].consentTimestamp).toBeTruthy();
	});

	it('calls onDecline from cancel button and close icon', () => {
		const onDecline = jest.fn();
		const tree = renderWithAct(
			<OAuthConsentModal
				visible
				provider="google"
				onAccept={jest.fn()}
				onDecline={onDecline}
				onViewPolicy={jest.fn()}
			/>
		);

		const cancelButton = findPressableAncestor(tree.root.findByProps({ children: 'Cancel' }));
		const closeIcon = tree.root.findByProps({ children: 'icon-close' });
		const closeButton = findPressableAncestor(closeIcon);

		ReactTestRenderer.act(() => {
			cancelButton.props.onPress();
			closeButton.props.onPress();
		});

		expect(onDecline).toHaveBeenCalledTimes(2);
	});
});
