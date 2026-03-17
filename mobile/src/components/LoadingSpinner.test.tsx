import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ActivityIndicator, Modal, Text } from 'react-native';

import LoadingSpinner from './LoadingSpinner';

const mockUseTheme = jest.fn();

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

describe('LoadingSpinner', () => {
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
				primary: '#00f',
				text: '#111',
				overlay: 'rgba(0,0,0,0.5)',
				card: '#fff',
			},
		});
	});

	it('renders nothing when visible is false and overlay is false', () => {
		const tree = renderWithAct(<LoadingSpinner visible={false} overlay={false} />);
		expect(tree.toJSON()).toBeNull();
	});

	it('renders spinner and text when visible', () => {
		const tree = renderWithAct(
			<LoadingSpinner visible text="Please wait" size="small" />
		);

		const spinner = tree.root.findByType(ActivityIndicator);
		expect(spinner.props.size).toBe('small');
		expect(spinner.props.color).toBe('#00f');
		expect(tree.root.findByProps({ children: 'Please wait' })).toBeTruthy();
	});

	it('uses custom spinner color when provided', () => {
		const tree = renderWithAct(
			<LoadingSpinner visible color="#123456" />
		);

		const spinner = tree.root.findByType(ActivityIndicator);
		expect(spinner.props.color).toBe('#123456');
	});

	it('renders overlay inside modal when overlay is true', () => {
		const tree = renderWithAct(
			<LoadingSpinner visible overlay text="Overlay loading" />
		);

		const modal = tree.root.findByType(Modal);
		expect(modal.props.visible).toBe(true);
		expect(modal.props.transparent).toBe(true);
		expect(tree.root.findByProps({ children: 'Overlay loading' })).toBeTruthy();
	});

	it('hides text when text is empty string', () => {
		const tree = renderWithAct(
			<LoadingSpinner visible text="" />
		);

		expect(tree.root.findAllByType(Text)).toHaveLength(0);
	});
});
