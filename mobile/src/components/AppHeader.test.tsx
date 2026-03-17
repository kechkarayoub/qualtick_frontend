import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import AppHeader from './AppHeader';

const mockUseTheme = jest.fn();
const mockUseLanguage = jest.fn();
const mockUseSafeAreaInsets = jest.fn();
const mockT = jest.fn((key: string) => key);

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('../contexts/LanguageContext', () => ({
	__esModule: true,
	useLanguage: () => mockUseLanguage(),
}));

jest.mock('react-native-safe-area-context', () => ({
	__esModule: true,
	useSafeAreaInsets: () => mockUseSafeAreaInsets(),
}));

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

jest.mock('./LanguagePicker', () => {
	const React = require('react');
	const { View, Text } = require('react-native');
	return ({ visible }: any) => (
		<View testID="language-picker" data-visible={visible}>
			<Text>language-picker</Text>
		</View>
	);
});

jest.mock('./LoadingSpinner', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return ({ visible, text }: any) => (visible ? <Text>{text || 'loading'}</Text> : null);
});

describe('AppHeader', () => {
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
				surface: '#f8f8f8',
				text: '#111',
			},
		});

		mockUseLanguage.mockReturnValue({
			language: 'en',
			isChangingLanguage: false,
		});

		mockUseSafeAreaInsets.mockReturnValue({ top: 10, left: 0, right: 0, bottom: 0 });
	});

	it('renders title and right component', () => {
		const tree = renderWithAct(
			<AppHeader title="Dashboard" rightComponent={<Text testID="right-node">R</Text>} />
		);

		expect(tree.root.findByProps({ children: 'Dashboard' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'right-node' })).toBeTruthy();
	});

	it('renders back button and calls onBackPress', () => {
		const onBackPress = jest.fn();

		const tree = renderWithAct(
			<AppHeader title="Details" showBackButton onBackPress={onBackPress} />
		);

		const backArrow = tree.root.findByProps({ children: '←' });
		const backButton = findPressableAncestor(backArrow);
		expect(backButton).toBeTruthy();

		ReactTestRenderer.act(() => {
			backButton.props.onPress();
		});

		expect(onBackPress).toHaveBeenCalledTimes(1);
	});

	it('renders Arabic back arrow when language is ar', () => {
		mockUseLanguage.mockReturnValue({
			language: 'ar',
			isChangingLanguage: false,
		});

		const tree = renderWithAct(
			<AppHeader showBackButton onBackPress={jest.fn()} />
		);

		expect(tree.root.findByProps({ children: '→' })).toBeTruthy();
	});

	it('opens language picker modal when language button is pressed', () => {
		const tree = renderWithAct(<AppHeader showLanguagePicker />);

		const pickerBefore = tree.root.findByProps({ testID: 'language-picker' });
		expect(pickerBefore.props['data-visible']).toBe(false);

		const languageCode = tree.root.findByProps({ children: 'EN' });
		const languageButton = findPressableAncestor(languageCode);
		expect(languageButton).toBeTruthy();

		ReactTestRenderer.act(() => {
			languageButton.props.onPress();
		});

		const pickerAfter = tree.root.findByProps({ testID: 'language-picker' });
		expect(pickerAfter.props['data-visible']).toBe(true);
	});

	it('disables language button and shows loading spinner when changing language', () => {
		mockUseLanguage.mockReturnValue({
			language: 'fr',
			isChangingLanguage: true,
		});

		const tree = renderWithAct(<AppHeader showLanguagePicker />);

		const languageCode = tree.root.findByProps({ children: 'FR' });
		const languageButton = findPressableAncestor(languageCode);
		expect(languageButton).toBeTruthy();

		expect(languageButton.props.disabled).toBe(true);
		expect(tree.root.findByProps({ children: 'common:progress...' })).toBeTruthy();
	});

	it('hides language picker button when showLanguagePicker is false', () => {
		const tree = renderWithAct(<AppHeader showLanguagePicker={false} />);

		expect(tree.root.findAllByProps({ children: 'EN' })).toHaveLength(0);
	});
});
