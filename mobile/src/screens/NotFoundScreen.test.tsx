import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import NotFoundScreen from './NotFoundScreen';

const mockNavigate = jest.fn();
const mockT = jest.fn((key: string, opts?: any) => {
	if (key === 'home:welcome.greeting') {
		return `hello:${opts?.name}`;
	}
	return key;
});

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => ({ navigate: (...args: any[]) => mockNavigate(...args) }),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string, opts?: any) => mockT(key, opts) }),
}));

jest.mock('../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			text: '#222',
			textSecondary: '#333',
		},
	}),
}));

jest.mock('../components/AppHeader', () => ({
	__esModule: true,
	default: ({ title }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, title);
	},
}));

jest.mock('../components/form/CustomButton', () => ({
	__esModule: true,
	default: ({ title, onPress }: any) => {
		const ReactLocal = require('react');
		const { TouchableOpacity, Text } = require('react-native');
		return ReactLocal.createElement(
			TouchableOpacity,
			{ onPress, testID: `btn:${title}` },
			ReactLocal.createElement(Text, null, title)
		);
	},
}));

describe('NotFoundScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(NotFoundScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders not-found title, subtitle, and action buttons', () => {
		const tree = renderWithAct();
		expect(tree.root.findAllByProps({ children: 'common:navigation.pageNotFound' }).length).toBeGreaterThan(0);
		expect(tree.root.findByProps({ children: 'common:errors.somethingWentWrong' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'btn:navigation:home' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'btn:auth:login.signIn' })).toBeTruthy();
	});

	it('navigates to MainStack and AuthStack from action buttons', () => {
		const tree = renderWithAct();

		const homeButton = tree.root.findByProps({ testID: 'btn:navigation:home' });
		const authButton = tree.root.findByProps({ testID: 'btn:auth:login.signIn' });

		ReactTestRenderer.act(() => {
			homeButton.props.onPress();
			authButton.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('MainStack');
		expect(mockNavigate).toHaveBeenCalledWith('AuthStack');
	});
});
