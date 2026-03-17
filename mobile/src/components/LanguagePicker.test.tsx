import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Modal, Text } from 'react-native';

import LanguagePicker from './LanguagePicker';

const mockUseTheme = jest.fn();
const mockUseLanguage = jest.fn();
const mockT = jest.fn((key: string) => key);

jest.mock('../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('../contexts/LanguageContext', () => ({
	__esModule: true,
	useLanguage: () => mockUseLanguage(),
}));

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

describe('LanguagePicker', () => {
	const setLanguage = jest.fn().mockResolvedValue(undefined);

	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	const findPressableAncestor = (node: ReactTestRenderer.ReactTestInstance | null | undefined) => {
		let current: any = node;
		while (current && typeof current.props?.onPress !== 'function') {
			current = current.parent;
		}
		return current;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockUseTheme.mockReturnValue({
			colors: {
				background: '#fff',
				surface: '#f8f8f8',
				border: '#ddd',
				text: '#111',
				textSecondary: '#666',
				primary: '#00f',
			},
		});

		mockUseLanguage.mockReturnValue({
			language: 'en',
			setLanguage,
		});
	});

	it('renders modal and language title when visible', () => {
		const tree = renderWithAct(
			<LanguagePicker visible onClose={jest.fn()} />
		);

		expect(tree.root.findByType(Modal).props.visible).toBe(true);
		expect(tree.root.findByProps({ children: 'settings:language.selectLanguage' })).toBeTruthy();
		const allText = tree.root.findAllByType(Text).map((n) => String(n.props.children));
		expect(allText.some((text) => text.includes('English'))).toBe(true);
		expect(allText.some((text) => text.includes('French'))).toBe(true);
		expect(allText.some((text) => text.includes('Arabic'))).toBe(true);
	});

	it('calls onClose from close button', () => {
		const onClose = jest.fn();
		const tree = renderWithAct(<LanguagePicker visible onClose={onClose} />);

		const closeIcon = tree.root.findByProps({ children: '✕' });
		const closeButton = findPressableAncestor(closeIcon);
		expect(closeButton).toBeTruthy();

		ReactTestRenderer.act(() => {
			closeButton.props.onPress();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not call setLanguage when selecting current language and closes', async () => {
		const onClose = jest.fn();
		const tree = renderWithAct(<LanguagePicker visible onClose={onClose} />);

		const englishNode = tree.root.findAllByType(Text).find((n) => String(n.props.children) === 'English');
		expect(englishNode).toBeTruthy();
		const englishButton = findPressableAncestor(englishNode);
		expect(englishButton).toBeTruthy();

		await ReactTestRenderer.act(async () => {
			await englishButton.props.onPress();
		});

		expect(setLanguage).not.toHaveBeenCalled();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls setLanguage for a different selected language then closes', async () => {
		const onClose = jest.fn();
		const tree = renderWithAct(<LanguagePicker visible onClose={onClose} />);

		const frenchNode = tree.root.findByProps({ children: 'French' });
		const frenchButton = findPressableAncestor(frenchNode);

		await ReactTestRenderer.act(async () => {
			await frenchButton.props.onPress();
		});

		expect(setLanguage).toHaveBeenCalledWith('fr');
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('hides title and footer when showTitle is false', () => {
		const tree = renderWithAct(
			<LanguagePicker visible onClose={jest.fn()} showTitle={false} />
		);

		expect(tree.root.findAllByProps({ children: 'settings:language.selectLanguage' })).toHaveLength(0);
		expect(tree.root.findAllByProps({ children: 'settings:language.restartNote' })).toHaveLength(0);
		expect(tree.root.findAllByProps({ children: '✕' })).toHaveLength(0);
	});
});
