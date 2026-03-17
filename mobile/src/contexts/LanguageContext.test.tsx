import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, Alert, I18nManager } from 'react-native';

import { LanguageProvider, useLanguage } from './LanguageContext';

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockChangeLanguage = jest.fn();
const mockRestart = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: {
		getItem: (...args: any[]) => mockGetItem(...args),
		setItem: (...args: any[]) => mockSetItem(...args),
	},
}));

jest.mock('react-native-restart', () => ({
	__esModule: true,
	default: {
		restart: () => mockRestart(),
	},
}));

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({
		i18n: {
			language: 'en',
			changeLanguage: (...args: any[]) => mockChangeLanguage(...args),
			t: (k: string) => k,
		},
	}),
}));

describe('LanguageContext', () => {
	const forceRTLSpy = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});
	const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	const flush = async () => {
		await ReactTestRenderer.act(async () => {
			await Promise.resolve();
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();
		Object.defineProperty(I18nManager, 'isRTL', { configurable: true, value: false });

		mockGetItem.mockResolvedValue(null);
		mockSetItem.mockResolvedValue(undefined);
		mockChangeLanguage.mockResolvedValue(undefined);
	});

	afterAll(() => {
		forceRTLSpy.mockRestore();
		alertSpy.mockRestore();
	});

	it('throws when useLanguage is used outside provider', () => {
		const Bad = () => {
			useLanguage();
			return null;
		};
		expect(() => renderWithAct(<Bad />)).toThrow('useLanguage must be used within a LanguageProvider');
	});

	it('initializes language from storage', async () => {
		mockGetItem.mockResolvedValue('fr');

		const Probe = () => {
			const { language, isRTL } = useLanguage();
			return <Text>{`${language}:${String(isRTL)}`}</Text>;
		};

		const tree = renderWithAct(
			<LanguageProvider>
				<Probe />
			</LanguageProvider>
		);

		await flush();
		expect(tree.root.findByProps({ children: 'fr:false' })).toBeTruthy();
		expect(mockGetItem).toHaveBeenCalledWith('i18nextLng');
	});

	it('changes language and saves to storage', async () => {
		const Probe = () => {
			const { setLanguage } = useLanguage();
			return (
				<TouchableOpacity onPress={() => setLanguage('fr')}>
					<Text>set-fr</Text>
				</TouchableOpacity>
			);
		};

		const tree = renderWithAct(
			<LanguageProvider>
				<Probe />
			</LanguageProvider>
		);
		await flush();

		const btn = tree.root.findByType(TouchableOpacity);
		await ReactTestRenderer.act(async () => {
			await btn.props.onPress();
		});

		expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
		expect(mockSetItem).toHaveBeenCalledWith('i18nextLng', 'fr');
	});

	it('triggers RTL flow and restart prompt when switching to arabic', async () => {
		const Probe = () => {
			const { setLanguage } = useLanguage();
			return (
				<TouchableOpacity onPress={() => setLanguage('ar')}>
					<Text>set-ar</Text>
				</TouchableOpacity>
			);
		};

		const tree = renderWithAct(
			<LanguageProvider>
				<Probe />
			</LanguageProvider>
		);
		await flush();

		const btn = tree.root.findByType(TouchableOpacity);
		await ReactTestRenderer.act(async () => {
			await btn.props.onPress();
		});

		expect(forceRTLSpy).toHaveBeenCalledWith(true);
		expect(alertSpy).toHaveBeenCalled();

		const alertButtons = (alertSpy.mock.calls[0] as any[])[2];
		alertButtons[0].onPress();
		expect(mockRestart).toHaveBeenCalledTimes(1);
	});
});
