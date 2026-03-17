import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BackHandler, Modal, Platform, ScrollView, Text, View } from 'react-native';

import BaseModal from './BaseModal';

const mockUseTheme = jest.fn();
const mockT = jest.fn((key: string, options?: any) => options?.defaultValue || key);

let backPressHandler: (() => boolean) | null = null;
const mockBackRemove = jest.fn();
const mockBackAddEventListener = jest.fn((_eventName: string, handler: () => boolean) => {
	backPressHandler = handler;
	return { remove: mockBackRemove };
});

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({
		t: mockT,
		i18n: { language: 'en' },
	}),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

describe('BaseModal', () => {
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

	const findPressableAncestor = (node: ReactTestRenderer.ReactTestInstance | null | undefined) => {
		let current: any = node;
		while (current && typeof current.props?.onPress !== 'function') {
			current = current.parent;
		}
		return current;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		backPressHandler = null;

		mockUseTheme.mockReturnValue({
			colors: {
				background: '#FFFFFF',
				border: '#E5E7EB',
				text: '#111111',
				surface: '#F8F9FA',
				primary: '#3B82F6',
			},
		});

		mockT.mockImplementation((key: string, options?: any) => options?.defaultValue || key);
		mockBackAddEventListener.mockClear();
		mockBackRemove.mockClear();

		(BackHandler.addEventListener as any) = mockBackAddEventListener;
	});

	afterAll(() => {
		Object.defineProperty(Platform, 'OS', {
			configurable: true,
			value: originalPlatformOS,
		});
	});

	it('renders modal title and children when open', () => {
		const tree = renderWithAct(
			<BaseModal isOpen onClose={jest.fn()} title="My Modal">
				<Text testID="body">Body content</Text>
			</BaseModal>
		);

		expect(tree.root.findByType(Modal).props.visible).toBe(true);
		expect(tree.root.findByProps({ children: 'My Modal' })).toBeTruthy();
		expect(tree.root.findByProps({ testID: 'body' })).toBeTruthy();
	});

	it('calls onClose when close icon is pressed', () => {
		const onClose = jest.fn();
		const tree = renderWithAct(
			<BaseModal isOpen onClose={onClose} title="My Modal">
				<Text>Body</Text>
			</BaseModal>
		);

		const closeIcon = tree.root.findByProps({ children: '✕' });
		const closeButton = findPressableAncestor(closeIcon);
		expect(closeButton).toBeTruthy();

		ReactTestRenderer.act(() => {
			closeButton.props.onPress();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when footer close button is pressed', () => {
		const onClose = jest.fn();
		const tree = renderWithAct(
			<BaseModal isOpen onClose={onClose} title="My Modal">
				<Text>Body</Text>
			</BaseModal>
		);

		const closeText = tree.root.findByProps({ children: 'Close' });
		const footerButton = findPressableAncestor(closeText);
		expect(footerButton).toBeTruthy();

		ReactTestRenderer.act(() => {
			footerButton.props.onPress();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('hides close icon when showCloseButton is false', () => {
		const tree = renderWithAct(
			<BaseModal isOpen onClose={jest.fn()} title="My Modal" showCloseButton={false}>
				<Text>Body</Text>
			</BaseModal>
		);

		expect(tree.root.findAllByProps({ children: '✕' })).toHaveLength(0);
	});

	it('renders static content container when scrollable is false', () => {
		const tree = renderWithAct(
			<BaseModal isOpen onClose={jest.fn()} title="My Modal" scrollable={false}>
				<Text>Body</Text>
			</BaseModal>
		);

		expect(tree.root.findAllByType(ScrollView)).toHaveLength(0);
		expect(tree.root.findAllByType(View).length).toBeGreaterThan(0);
	});

	it('registers Android hardware back handler and triggers onClose', () => {
		setPlatformOS('android');
		const onClose = jest.fn();

		renderWithAct(
			<BaseModal isOpen onClose={onClose} title="My Modal">
				<Text>Body</Text>
			</BaseModal>
		);

		expect(mockBackAddEventListener).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
		expect(backPressHandler).toBeTruthy();

		const consumed = backPressHandler!();
		expect(consumed).toBe(true);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not register hardware back handler on iOS', () => {
		setPlatformOS('ios');

		renderWithAct(
			<BaseModal isOpen onClose={jest.fn()} title="My Modal">
				<Text>Body</Text>
			</BaseModal>
		);

		expect(mockBackAddEventListener).not.toHaveBeenCalled();
	});

	it('uses onRequestClose callback from Modal', () => {
		const onClose = jest.fn();
		const tree = renderWithAct(
			<BaseModal isOpen onClose={onClose} title="My Modal">
				<Text>Body</Text>
			</BaseModal>
		);

		const modal = tree.root.findByType(Modal);
		ReactTestRenderer.act(() => {
			modal.props.onRequestClose();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
