import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import CustomTextInput from './CustomTextInput';

const mockUseTheme = jest.fn();
const mockUseLanguage = jest.fn();

jest.mock('../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('../../contexts/LanguageContext', () => ({
	__esModule: true,
	useLanguage: () => mockUseLanguage(),
}));

describe('CustomTextInput', () => {
	const toTextString = (value: any): string => {
		if (Array.isArray(value)) {
			return value.map((item) => toTextString(item)).join('');
		}
		if (typeof value === 'string' || typeof value === 'number') {
			return String(value);
		}
		if (value && typeof value === 'object' && 'props' in value) {
			return toTextString((value as any).props?.children);
		}
		return '';
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

		mockUseTheme.mockReturnValue({
			colors: {
				text: '#111111',
				error: '#EF4444',
				primary: '#3B82F6',
				border: '#E5E7EB',
				surface: '#FFFFFF',
				textDisabled: '#9CA3AF',
			},
		});

		mockUseLanguage.mockReturnValue({ language: 'en' });
	});

	const findInputContainer = (tree: ReactTestRenderer.ReactTestRenderer) => {
		const inputContainers = tree.root.findAllByType(View).filter((viewNode) => {
			const flat = StyleSheet.flatten(viewNode.props.style);
			return flat?.alignItems === 'center' && (flat?.minHeight === 36 || flat?.minHeight === 44 || flat?.minHeight === 52);
		});

		return inputContainers[0];
	};

	it('renders label, required indicator and error message', () => {
		const tree = renderWithAct(
			<CustomTextInput
				label="Email"
				required
				error="Invalid email"
				placeholder="Enter email"
			/>
		);

		const allText = tree.root.findAllByType(Text).map((node) => toTextString(node.props.children));
		expect(allText.some((text) => text.includes('Email'))).toBe(true);
		expect(allText.some((text) => text.includes('*'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Invalid email' })).toBeTruthy();
	});

	it('updates border color on focus and blur', () => {
		const tree = renderWithAct(
			<CustomTextInput label="Name" placeholder="Type name" />
		);

		const input = tree.root.findByType(TextInput);

		expect(StyleSheet.flatten(findInputContainer(tree).props.style).borderColor).toBe('#E5E7EB');

		ReactTestRenderer.act(() => {
			input.props.onFocus();
		});

		expect(StyleSheet.flatten(findInputContainer(tree).props.style).borderColor).toBe('#3B82F6');

		ReactTestRenderer.act(() => {
			input.props.onBlur();
		});

		expect(StyleSheet.flatten(findInputContainer(tree).props.style).borderColor).toBe('#E5E7EB');
	});

	it('calls onRightIconPress when right icon is pressed in LTR', () => {
		const onRightIconPress = jest.fn();

		const tree = renderWithAct(
			<CustomTextInput
				placeholder="Search"
				rightIcon={<Text testID="search-icon">🔍</Text>}
				onRightIconPress={onRightIconPress}
			/>
		);

		const iconTouchables = tree.root.findAllByType(TouchableOpacity);
		expect(iconTouchables).toHaveLength(1);

		ReactTestRenderer.act(() => {
			iconTouchables[0].props.onPress();
		});
		expect(onRightIconPress).toHaveBeenCalledTimes(1);
	});

	it('applies RTL text alignment and reversed container direction', () => {
		mockUseLanguage.mockReturnValue({ language: 'ar' });

		const tree = renderWithAct(
			<CustomTextInput placeholder="اكتب هنا" rightIcon={<Text>🔍</Text>} />
		);

		const input = tree.root.findByType(TextInput);
		expect(input.props.textAlign).toBe('right');

		const inputContainer = findInputContainer(tree);
		expect(StyleSheet.flatten(inputContainer.props.style).flexDirection).toBe('row-reverse');
	});

	it('uses lg size container dimensions', () => {
		const tree = renderWithAct(
			<CustomTextInput size="lg" placeholder="Large input" />
		);

		const inputContainer = findInputContainer(tree);
		const style = StyleSheet.flatten(inputContainer.props.style);

		expect(style.minHeight).toBe(52);
		expect(style.paddingHorizontal).toBe(20);
	});
});
