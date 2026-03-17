import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Modal, Platform, Text, TouchableOpacity } from 'react-native';

import DatePickerInput from './DatePickerInput';

const mockUseTheme = jest.fn();
const mockDateTimePicker = jest.fn();

jest.mock('../../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
	const React = require('react');
	return {
		__esModule: true,
		default: (props: any) => {
			mockDateTimePicker(props);
			return React.createElement('DateTimePicker', props, null);
		},
	};
});

describe('DatePickerInput', () => {
	const originalPlatformOS = Platform.OS;

	const setPlatformOS = (os: 'ios' | 'android') => {
		Object.defineProperty(Platform, 'OS', {
			configurable: true,
			value: os,
		});
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
				border: '#E5E7EB',
				surface: '#FFFFFF',
				textSecondary: '#6B7280',
				primary: '#3B82F6',
			},
		});

		setPlatformOS('android');
	});

	afterAll(() => {
		Object.defineProperty(Platform, 'OS', {
			configurable: true,
			value: originalPlatformOS,
		});
	});

	it('renders label, required indicator and error message', () => {
		const tree = renderWithAct(
			<DatePickerInput
				label="Birth date"
				value={null}
				onChange={jest.fn()}
				required
				error="Date is required"
			/>
		);

		const allText = tree.root.findAllByType(Text).map((node) => String(node.props.children));
		expect(allText.some((text) => text.includes('Birth date'))).toBe(true);
		expect(allText.some((text) => text.includes('*'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Date is required' })).toBeTruthy();
	});

	it('shows placeholder text when value is null', () => {
		const tree = renderWithAct(
			<DatePickerInput
				label="Start date"
				placeholder="Select date"
				value={null}
				onChange={jest.fn()}
			/>
		);

		expect(tree.root.findByProps({ children: 'Select date' })).toBeTruthy();
	});

	it('shows formatted date when value exists', () => {
		const tree = renderWithAct(
			<DatePickerInput
				label="Start date"
				value={new Date('2025-02-03T10:00:00.000Z')}
				onChange={jest.fn()}
			/>
		);

		expect(tree.root.findByProps({ children: '2025-02-03' })).toBeTruthy();
	});

	it('opens iOS modal picker when pressed', () => {
		setPlatformOS('ios');

		const tree = renderWithAct(
			<DatePickerInput label="Date" value={null} onChange={jest.fn()} />
		);

		const openBtn = tree.root.findAllByType(TouchableOpacity)[0];
		ReactTestRenderer.act(() => {
			openBtn.props.onPress();
		});

		expect(tree.root.findByType(Modal)).toBeTruthy();
		// Use the mocked DateTimePicker component reference
		const DateTimePicker = require('@react-native-community/datetimepicker').default;
		expect(tree.root.findByType(DateTimePicker)).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Done' })).toBeTruthy();
		expect(mockDateTimePicker).toHaveBeenCalledTimes(1);
	});

	it('calls onChange when picker returns selected date', () => {
		setPlatformOS('android');

		const onChange = jest.fn();
		const tree = renderWithAct(
			<DatePickerInput label="Date" value={null} onChange={onChange} />
		);

		const openBtn = tree.root.findAllByType(TouchableOpacity)[0];
		ReactTestRenderer.act(() => {
			openBtn.props.onPress();
		});

		const DateTimePicker = require('@react-native-community/datetimepicker').default;
		const picker = tree.root.findByType(DateTimePicker);
		const selectedDate = new Date('2026-03-01T00:00:00.000Z');

		ReactTestRenderer.act(() => {
			picker.props.onChange({ type: 'set' }, selectedDate);
		});

		expect(onChange).toHaveBeenCalledWith(selectedDate);
	});

	it('does not call onChange when event is dismissed', () => {
		setPlatformOS('android');

		const onChange = jest.fn();
		const tree = renderWithAct(
			<DatePickerInput label="Date" value={null} onChange={onChange} />
		);

		const openBtn = tree.root.findAllByType(TouchableOpacity)[0];
		ReactTestRenderer.act(() => {
			openBtn.props.onPress();
		});

		const DateTimePicker = require('@react-native-community/datetimepicker').default;
		const picker = tree.root.findByType(DateTimePicker);

		ReactTestRenderer.act(() => {
			picker.props.onChange({ type: 'dismissed' }, undefined);
		});

		expect(onChange).not.toHaveBeenCalled();
	});
});
