import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CustomCheckbox from './CustomCheckbox';

const mockUseTheme = jest.fn();

jest.mock('../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

describe('CustomCheckbox', () => {
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
				primary: '#3B82F6',
				error: '#EF4444',
				border: '#E5E7EB',
				text: '#111111',
				textSecondary: '#6B7280',
			},
		});
	});

	it('toggles value when pressed', () => {
		const onValueChange = jest.fn();
		const tree = renderWithAct(
			<CustomCheckbox
				value={false}
				onValueChange={onValueChange}
				label="Accept terms"
				testID="checkbox"
			/>
		);

		const checkbox = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			checkbox.props.onPress();
		});

		expect(onValueChange).toHaveBeenCalledWith(true);
	});

	it('does not toggle when disabled', () => {
		const onValueChange = jest.fn();
		const tree = renderWithAct(
			<CustomCheckbox
				value={false}
				onValueChange={onValueChange}
				label="Disabled"
				disabled
				testID="checkbox"
			/>
		);

		const touchable = tree.root.findByType(TouchableOpacity);
		expect(touchable.props.disabled).toBe(true);

		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('renders checkmark when checked', () => {
		const tree = renderWithAct(
			<CustomCheckbox value onValueChange={jest.fn()} label="Checked" />
		);

		expect(tree.root.findByProps({ children: '✓' })).toBeTruthy();
	});

	it('renders string label and error text', () => {
		const tree = renderWithAct(
			<CustomCheckbox
				value={false}
				onValueChange={jest.fn()}
				label="Email opt-in"
				error="This field is required"
			/>
		);

		expect(tree.root.findByProps({ children: 'Email opt-in' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'This field is required' })).toBeTruthy();
	});

	it('renders ReactNode label', () => {
		const tree = renderWithAct(
			<CustomCheckbox
				value={false}
				onValueChange={jest.fn()}
				label={<Text testID="node-label">Node label</Text>}
			/>
		);

		expect(tree.root.findByProps({ testID: 'node-label' })).toBeTruthy();
	});

	it('applies error border color to checkbox', () => {
		const tree = renderWithAct(
			<CustomCheckbox
				value={false}
				onValueChange={jest.fn()}
				label="With error"
				error="Error"
			/>
		);

		const checkboxView = tree.root
			.findAllByType(View)
			.find((viewNode) => {
				const flat = StyleSheet.flatten(viewNode.props.style);
				return flat?.borderWidth === 2 && flat?.borderRadius === 4;
			});

		expect(checkboxView).toBeTruthy();
		expect(StyleSheet.flatten(checkboxView!.props.style).borderColor).toBe('#EF4444');
	});
});
