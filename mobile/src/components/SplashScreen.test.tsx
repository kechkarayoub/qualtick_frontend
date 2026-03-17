import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Animated, Text } from 'react-native';

import SplashScreen from './SplashScreen';

const mockUseTheme = jest.fn();
const mockParallelStart = jest.fn();
const mockParallel = jest.fn(() => ({ start: mockParallelStart }));
const mockTiming = jest.fn(() => ({} as any));

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

describe('SplashScreen', () => {
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
				background: '#fff',
			},
		});

		jest.spyOn(Animated, 'parallel').mockImplementation(mockParallel as any);
		jest.spyOn(Animated, 'timing').mockImplementation(mockTiming as any);
	});

	afterEach(() => {
		(Animated.parallel as jest.Mock).mockRestore?.();
		(Animated.timing as jest.Mock).mockRestore?.();
	});

	it('renders splash content when visible', () => {
		const tree = renderWithAct(<SplashScreen isVisible onAnimationComplete={jest.fn()} />);

		expect(tree.root.findByProps({ children: 'Qualitick' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'v1.0.0' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'L' })).toBeTruthy();
		expect(tree.root.findAllByType(Text).length).toBeGreaterThan(2);
	});

	it('returns null when not visible', () => {
		const tree = renderWithAct(<SplashScreen isVisible={false} />);
		expect(tree.toJSON()).toBeNull();
	});

	it('triggers hide animation and calls onAnimationComplete', () => {
		const onAnimationComplete = jest.fn();
		mockParallelStart.mockImplementation((callback?: () => void) => callback?.());

		renderWithAct(<SplashScreen isVisible={false} onAnimationComplete={onAnimationComplete} />);

		expect(mockTiming).toHaveBeenCalledTimes(2);
		expect(mockParallel).toHaveBeenCalledTimes(1);
		expect(onAnimationComplete).toHaveBeenCalledTimes(1);
	});
});
