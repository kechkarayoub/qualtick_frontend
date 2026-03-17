import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, View } from 'react-native';

import {
	ModalProvider,
	useModals,
	usePrivacyPolicyModal,
	useTermsOfServiceModal,
} from './ModalManager';

jest.mock('./index', () => {
	const React = require('react');
	const { Text } = require('react-native');
	const makeModal = (name: string) => ({ isOpen }: any) => (
		<Text testID={`modal-${name}`}>{String(isOpen)}</Text>
	);
	return {
		__esModule: true,
		PrivacyPolicyModal: makeModal('privacy-policy'),
		TermsOfServiceModal: makeModal('terms-of-service'),
		CookiesPolicyModal: makeModal('cookies-policy'),
		AboutUsModal: makeModal('about-us'),
		FeaturesModal: makeModal('features'),
		ContactModal: makeModal('contact'),
		HelpCenterModal: makeModal('help-center'),
	};
});

describe('ModalManager', () => {
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

	it('throws when useModals is used outside provider', () => {
		const BadComponent = () => {
			useModals();
			return null;
		};

		expect(() => renderWithAct(<BadComponent />)).toThrow('useModals must be used within a ModalProvider');
	});

	it('opens and closes modal through useModals context API', () => {
		const Harness = () => {
			const { openModal, closeModal, isModalOpen } = useModals();
			return (
				<View>
					<Text testID="status-privacy">{String(isModalOpen('privacy-policy'))}</Text>
					<TouchableOpacity onPress={() => openModal('privacy-policy')}>
						<Text>open-privacy</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => closeModal()}>
						<Text>close-all</Text>
					</TouchableOpacity>
				</View>
			);
		};

		const tree = renderWithAct(
			<ModalProvider>
				<Harness />
			</ModalProvider>
		);

		expect(tree.root.findByProps({ testID: 'modal-privacy-policy' }).props.children).toBe('false');

		const openButton = findPressableAncestor(tree.root.findByProps({ children: 'open-privacy' }));
		ReactTestRenderer.act(() => {
			openButton.props.onPress();
		});

		expect(tree.root.findByProps({ testID: 'modal-privacy-policy' }).props.children).toBe('true');

		const closeButton = findPressableAncestor(tree.root.findByProps({ children: 'close-all' }));
		ReactTestRenderer.act(() => {
			closeButton.props.onPress();
		});

		expect(tree.root.findByProps({ testID: 'modal-privacy-policy' }).props.children).toBe('false');
	});

	it('opens terms modal using convenience hook', () => {
		const HookHarness = () => {
			const terms = useTermsOfServiceModal();
			return (
				<View>
					<Text testID="terms-open">{String(terms.isOpen)}</Text>
					<TouchableOpacity onPress={terms.open}>
						<Text>open-terms</Text>
					</TouchableOpacity>
				</View>
			);
		};

		const tree = renderWithAct(
			<ModalProvider>
				<HookHarness />
			</ModalProvider>
		);

		expect(tree.root.findByProps({ testID: 'modal-terms-of-service' }).props.children).toBe('false');

		const openButton = findPressableAncestor(tree.root.findByProps({ children: 'open-terms' }));
		ReactTestRenderer.act(() => {
			openButton.props.onPress();
		});

		expect(tree.root.findByProps({ testID: 'modal-terms-of-service' }).props.children).toBe('true');
	});

	it('opens privacy modal using convenience hook', () => {
		const HookHarness = () => {
			const privacy = usePrivacyPolicyModal();
			return (
				<View>
					<Text testID="privacy-open">{String(privacy.isOpen)}</Text>
					<TouchableOpacity onPress={privacy.open}>
						<Text>open-privacy-hook</Text>
					</TouchableOpacity>
				</View>
			);
		};

		const tree = renderWithAct(
			<ModalProvider>
				<HookHarness />
			</ModalProvider>
		);

		const openButton = findPressableAncestor(tree.root.findByProps({ children: 'open-privacy-hook' }));
		ReactTestRenderer.act(() => {
			openButton.props.onPress();
		});

		expect(tree.root.findByProps({ testID: 'modal-privacy-policy' }).props.children).toBe('true');
	});
});
