import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, View } from 'react-native';

import Styled, {
	StyledButton,
	StyledContainer,
	StyledDivider,
	StyledSpacer,
	StyledText,
} from './StyledComponents';

const mockUseTheme = jest.fn();

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('./form/CustomButton', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return (props: any) => <Text testID="custom-button">{props.title}</Text>;
});

describe('StyledComponents', () => {
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
				background: '#fff',
				surface: '#f8f8f8',
				shadow: '#000',
				primary: '#00f',
				secondary: '#0af',
				text: '#111',
				textSecondary: '#666',
				error: '#f00',
				success: '#0a0',
				border: '#ddd',
			},
		});
	});

	it('renders StyledContainer variants', () => {
		const cardTree = renderWithAct(
			<StyledContainer variant="card"><Text>Card</Text></StyledContainer>
		);
		const cardView = cardTree.root.findByType(View);
		expect(cardView.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: '#f8f8f8' })]));

		const surfaceTree = renderWithAct(
			<StyledContainer variant="surface"><Text>Surface</Text></StyledContainer>
		);
		const surfaceView = surfaceTree.root.findByType(View);
		expect(surfaceView.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: '#f8f8f8' })]));
	});

	it('renders StyledText with variant and color', () => {
		const tree = renderWithAct(
			<StyledText variant="h2" color="primary">Heading</StyledText>
		);
		const text = tree.root.findByType(Text);
		expect(text.props.children).toBe('Heading');
	});

	it('renders StyledButton through CustomButton wrapper', () => {
		const tree = renderWithAct(
			<StyledButton title="Save" onPress={jest.fn()} loadingTitle="Loading" />
		);
		expect(tree.root.findByProps({ testID: 'custom-button' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Save' })).toBeTruthy();
	});

	it('renders StyledSpacer vertical and horizontal', () => {
		const vertical = renderWithAct(<StyledSpacer size="lg" />);
		expect(vertical.root.findByType(View).props.style.height).toBeDefined();

		const horizontal = renderWithAct(<StyledSpacer size="sm" horizontal />);
		expect(horizontal.root.findByType(View).props.style.width).toBeDefined();
	});

	it('renders StyledDivider with theme border color', () => {
		const tree = renderWithAct(<StyledDivider margin="sm" />);
		const divider = tree.root.findByType(View);
		expect(divider.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: '#ddd' })]));
	});

	it('exports default styled object helpers', () => {
		expect(Styled.Container).toBeDefined();
		expect(Styled.Text).toBeDefined();
		expect(Styled.Button).toBeDefined();
		expect(Styled.Spacer).toBeDefined();
		expect(Styled.Divider).toBeDefined();
	});
});
