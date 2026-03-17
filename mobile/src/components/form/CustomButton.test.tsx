import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

import CustomButton from './CustomButton';

const mockUseTheme = jest.fn();

jest.mock('../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

describe('CustomButton', () => {
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
				secondary: '#64748B',
				error: '#EF4444',
				text: '#111111',
				textDisabled: '#9CA3AF',
			},
		});
	});

	it('renders title text', () => {
		const tree = renderWithAct(
			<CustomButton title="Submit" loadingTitle="Loading" />
		);

		expect(tree.root.findByProps({ children: 'Submit' })).toBeTruthy();
	});

	it('calls onPress when pressed', () => {
		const onPress = jest.fn();
		const tree = renderWithAct(
			<CustomButton title="Save" loadingTitle="Saving" onPress={onPress} />
		);

		const button = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			button.props.onPress();
		});

		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('renders loading state and disables button', () => {
		const tree = renderWithAct(
			<CustomButton title="Save" loadingTitle="Saving..." loading />
		);

		const button = tree.root.findByType(TouchableOpacity);

		expect(button.props.disabled).toBe(true);
		expect(tree.root.findByProps({ children: 'Saving...' })).toBeTruthy();
		expect(tree.root.findByType(ActivityIndicator)).toBeTruthy();
		expect(tree.root.findAllByProps({ children: 'Save' })).toHaveLength(0);
	});

	it('renders icon on the right when iconPosition is right', () => {
		const tree = renderWithAct(
			<CustomButton
				title="Continue"
				loadingTitle="Loading"
				iconPosition="right"
				icon={<Text testID="button-icon">→</Text>}
			/>
		);

		const icon = tree.root.findByProps({ testID: 'button-icon' });
		expect(icon).toBeTruthy();
	});

	it('applies fullWidth style', () => {
		const tree = renderWithAct(
			<CustomButton title="Continue" loadingTitle="Loading" fullWidth />
		);

		const button = tree.root.findByType(TouchableOpacity);
		expect(button.props.style.width).toBe('100%');
	});

	it('uses disabled border color for outline variant when disabled', () => {
		const tree = renderWithAct(
			<CustomButton
				title="Outline"
				loadingTitle="Loading"
				variant="outline"
				disabled
			/>
		);

		const button = tree.root.findByType(TouchableOpacity);
		expect(button.props.style.borderColor).toBe('#9CA3AF');
	});
});
