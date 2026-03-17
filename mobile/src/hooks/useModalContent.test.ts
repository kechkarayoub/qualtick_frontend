import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';

import {
	useCompanyInfo,
	useContentChangeDetection,
	useContentVersions,
	useModalContent,
} from './useModalContent';

const mockGetModalContent = jest.fn();
const mockGetCompanyInfo = jest.fn();
const mockGetAllVersions = jest.fn();
const mockHasContentChanged = jest.fn();
const mockGetLatestVersion = jest.fn();

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

jest.mock('../shared/content', () => ({
	__esModule: true,
	modalContentProvider: {
		getModalContent: (...args: any[]) => mockGetModalContent(...args),
		getCompanyInfo: (...args: any[]) => mockGetCompanyInfo(...args),
		getAllVersions: (...args: any[]) => mockGetAllVersions(...args),
		hasContentChanged: (...args: any[]) => mockHasContentChanged(...args),
		getLatestVersion: (...args: any[]) => mockGetLatestVersion(...args),
	},
}));

describe('useModalContent hooks', () => {
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
		mockGetModalContent.mockReturnValue({ id: 'about-us', version: '1.0.0', content: { text: 'hello' } });
		mockGetCompanyInfo.mockReturnValue({ supportEmail: 'support@qualitick.com' });
		mockGetAllVersions.mockReturnValue([{ version: '1.0.0', lastUpdated: new Date(), title: 'V1' }]);
		mockHasContentChanged.mockReturnValue(true);
		mockGetLatestVersion.mockReturnValue('1.0.0');
	});

	it('loads modal content and exposes hasContent/refresh', async () => {
		const Probe = () => {
			const state = useModalContent('about-us');
			return React.createElement(
				TouchableOpacity,
				{ onPress: state.refresh },
				React.createElement(Text, null, `${state.loading}:${String(state.hasContent)}:${state.error ?? 'none'}`)
			);
		};

		const tree = renderWithAct(React.createElement(Probe));
		await flush();

		expect(tree.root.findByProps({ children: 'false:true:none' })).toBeTruthy();
		expect(mockGetModalContent).toHaveBeenCalledWith('about-us', undefined, expect.any(Function));

		const button = tree.root.findByType(TouchableOpacity);
		const callsBeforeRefresh = mockGetModalContent.mock.calls.length;
		ReactTestRenderer.act(() => {
			button.props.onPress();
		});
		expect(mockGetModalContent.mock.calls.length).toBe(callsBeforeRefresh + 1);
	});

	it('sets error when modal content is missing', async () => {
		mockGetModalContent.mockReturnValue(null);

		const Probe = () => {
			const state = useModalContent('missing-modal');
			return React.createElement(Text, null, state.error ?? 'none');
		};

		const tree = renderWithAct(React.createElement(Probe));
		await flush();

		expect(tree.root.findAllByType(Text).some((n) => String(n.props.children).includes('Content not found for modal: missing-modal'))).toBe(true);
	});

	it('returns company info, versions and change detection values', async () => {
		const Probe = () => {
			const company = useCompanyInfo();
			const versions = useContentVersions('about-us');
			const change = useContentChangeDetection('about-us', '0.9.0');
			return React.createElement(
				Text,
				null,
				`${company.supportEmail}:${versions.length}:${change.hasChanged}:${change.latestVersion}`
			);
		};

		const tree = renderWithAct(React.createElement(Probe));
		await flush();

		expect(tree.root.findByProps({ children: 'support@qualitick.com:1:true:1.0.0' })).toBeTruthy();
	});
});
