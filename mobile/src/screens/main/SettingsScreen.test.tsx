import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import SettingsScreen from './SettingsScreen';

const mockNavigate = jest.fn();
const mockLogout = jest.fn();
const mockUseLanguage = jest.fn();
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

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			surface: '#222',
			text: '#333',
			textSecondary: '#444',
			primary: '#555',
			border: '#666',
		},
	}),
}));

jest.mock('../../contexts/LanguageContext', () => ({
	useLanguage: () => mockUseLanguage(),
}));

jest.mock('../../hooks/useAuth', () => ({
	__esModule: true,
	default: () => ({
		logout: (...args: any[]) => mockLogout(...args),
	}),
}));

jest.mock('../../components/AppHeader', () => ({
	__esModule: true,
	default: ({ title }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, title);
	},
}));

jest.mock('../../components/form/CustomButton', () => ({
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

jest.mock('../../components/ThemeSelector', () => ({
	__esModule: true,
	default: () => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, 'ThemeSelector');
	},
}));

jest.mock('../../components/LanguagePicker', () => ({
	__esModule: true,
	default: ({ visible, onClose }: any) => {
		const ReactLocal = require('react');
		const { TouchableOpacity, Text } = require('react-native');
		return ReactLocal.createElement(
			TouchableOpacity,
			{ testID: `LanguagePicker:${String(visible)}`, onPress: onClose },
			ReactLocal.createElement(Text, null, `LanguagePicker:${String(visible)}`)
		);
	},
}));

const findPressableAncestor = (node: ReactTestRenderer.ReactTestInstance | null | undefined) => {
	let current = node;
	while (current && typeof current.props?.onPress !== 'function') {
		current = current.parent;
	}
	return current;
};

describe('SettingsScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(SettingsScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseLanguage.mockReturnValue({ language: 'en' });
		mockLogout.mockResolvedValue(undefined);
	});

	it('renders settings sections and default language display', () => {
		const tree = renderWithAct();

		expect(tree.root.findByProps({ children: 'settings:title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:sections.appearance' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:sections.notifications' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:sections.privacySecurity' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'settings:sections.about' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'ThemeSelector' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'English 🇺🇸' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'LanguagePicker:false' })).toBeTruthy();
	});

	it('shows localized language names for fr and ar', () => {
		mockUseLanguage.mockReturnValueOnce({ language: 'fr' });
		let tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'Français 🇫🇷' })).toBeTruthy();

		mockUseLanguage.mockReturnValueOnce({ language: 'ar' });
		tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'العربية 🇲🇦' })).toBeTruthy();
	});

	it('opens and closes language picker when language row is pressed', () => {
		const tree = renderWithAct();
		const languageLabel = tree.root.findByProps({ children: 'settings:language.title' });
		const languageRow = findPressableAncestor(languageLabel);
		expect(languageRow).toBeTruthy();

		ReactTestRenderer.act(() => {
			languageRow!.props.onPress();
		});
		expect(tree.root.findByProps({ children: 'LanguagePicker:true' })).toBeTruthy();

		const picker = tree.root.findByProps({ testID: 'LanguagePicker:true' });
		ReactTestRenderer.act(() => {
			picker.props.onPress();
		});
		expect(tree.root.findByProps({ children: 'LanguagePicker:false' })).toBeTruthy();
	});

	it('navigates to Profile from change-password row', () => {
		const tree = renderWithAct();
		const changePassword = tree.root.findByProps({ children: 'settings:security.changePassword' });
		const pressable = findPressableAncestor(changePassword);
		expect(pressable).toBeTruthy();

		ReactTestRenderer.act(() => {
			pressable!.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Profile');
	});

	it('triggers switches callbacks and handles logout success/error', async () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const tree = renderWithAct();

		const switches = tree.root.findAllByType(require('react-native').Switch);
		expect(switches.length).toBe(2);

		ReactTestRenderer.act(() => {
			switches[0].props.onValueChange(false);
			switches[1].props.onValueChange(true);
		});
		expect(logSpy).toHaveBeenCalled();

		const signOut = tree.root.findByProps({ testID: 'btn:settings:actions.signOut' });
		await ReactTestRenderer.act(async () => {
			await signOut.props.onPress();
		});
		expect(mockLogout).toHaveBeenCalled();

		mockLogout.mockRejectedValueOnce(new Error('logout failed'));
		await ReactTestRenderer.act(async () => {
			await signOut.props.onPress();
		});
		expect(errorSpy).toHaveBeenCalled();

		logSpy.mockRestore();
		errorSpy.mockRestore();
	});
});
