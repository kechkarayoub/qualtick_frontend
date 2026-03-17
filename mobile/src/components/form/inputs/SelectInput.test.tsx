import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Modal, Text, TouchableOpacity } from 'react-native';

import SelectInput from './SelectInput';

const mockUseTheme = jest.fn();

jest.mock('../../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

describe('SelectInput', () => {
	const options = [
		{ label: 'First', value: 'first' },
		{ label: 'Second', value: 'second' },
		{ label: 'Third', value: 'third' },
	];

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
			},
		});
	});

	it('renders placeholder when value is null', () => {
		const tree = renderWithAct(
			<SelectInput
				label="Status"
				placeholder="Choose status"
				value={null}
				options={options}
				onChange={jest.fn()}
			/>
		);

		expect(tree.root.findByProps({ children: 'Choose status' })).toBeTruthy();
	});

	it('renders selected option label when value exists', () => {
		const tree = renderWithAct(
			<SelectInput
				label="Status"
				value="second"
				options={options}
				onChange={jest.fn()}
			/>
		);

		expect(tree.root.findByProps({ children: 'Second' })).toBeTruthy();
	});

	it('opens modal when selector is pressed', () => {
		const tree = renderWithAct(
			<SelectInput label="Status" value={null} options={options} onChange={jest.fn()} />
		);

		const selector = tree.root.findAllByType(TouchableOpacity)[0];
		ReactTestRenderer.act(() => {
			selector.props.onPress();
		});

		const modal = tree.root.findByType(Modal);
		expect(modal.props.visible).toBe(true);
	});

	it('closes modal when backdrop is pressed', () => {
		const tree = renderWithAct(
			<SelectInput label="Status" value={null} options={options} onChange={jest.fn()} />
		);

		const selector = tree.root.findAllByType(TouchableOpacity)[0];
		ReactTestRenderer.act(() => {
			selector.props.onPress();
		});

		const touchables = tree.root.findAllByType(TouchableOpacity);
		const backdrop = touchables.find((node) => node.props.activeOpacity === 1);

		ReactTestRenderer.act(() => {
			backdrop!.props.onPress();
		});

		const modal = tree.root.findByType(Modal);
		expect(modal.props.visible).toBe(false);
	});

	it('calls onChange and closes modal when an option is selected', () => {
		const onChange = jest.fn();
		const tree = renderWithAct(
			<SelectInput label="Status" value={null} options={options} onChange={onChange} />
		);

		const selector = tree.root.findAllByType(TouchableOpacity)[0];
		ReactTestRenderer.act(() => {
			selector.props.onPress();
		});

		const optionText = tree.root.findByProps({ children: 'Second' });
		let optionPressable: any = optionText.parent;
		while (optionPressable && typeof optionPressable.props?.onPress !== 'function') {
			optionPressable = optionPressable.parent;
		}

		expect(optionPressable).toBeTruthy();

		ReactTestRenderer.act(() => {
			optionPressable!.props.onPress();
		});

		expect(onChange).toHaveBeenCalledWith('second');
		expect(tree.root.findByType(Modal).props.visible).toBe(false);
	});

	it('does not open when disabled', () => {
		const tree = renderWithAct(
			<SelectInput
				label="Status"
				value={null}
				options={options}
				onChange={jest.fn()}
				disabled
			/>
		);

		const selector = tree.root.findAllByType(TouchableOpacity)[0];
		expect(selector.props.disabled).toBe(true);
		expect(tree.root.findByType(Modal).props.visible).toBe(false);
	});

	it('renders required marker and error text', () => {
		const tree = renderWithAct(
			<SelectInput
				label="Status"
				value={null}
				options={options}
				onChange={jest.fn()}
				required
				error="Status is required"
			/>
		);

		const allText = tree.root.findAllByType(Text).map((node) => String(node.props.children));
		expect(allText.some((text) => text.includes('Status'))).toBe(true);
		expect(allText.some((text) => text.includes('*'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Status is required' })).toBeTruthy();
	});
});
