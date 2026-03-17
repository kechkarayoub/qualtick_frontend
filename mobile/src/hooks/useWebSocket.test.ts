import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import useWebSocket, { useProfileWebSocket } from './useWebSocket';

const mockToastShow = jest.fn();
const mockLogout = jest.fn().mockResolvedValue(undefined);

const mockSetLogoutHandler = jest.fn();
const mockOnConnectionStateChange = jest.fn();
const mockOnMessage = jest.fn();
const mockSend = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockGetConnectionState = jest.fn();
let connectionStateHandler: ((state: any) => void) | undefined;

const messageHandlers: Record<string, (message: any) => void> = {};

jest.mock('react-native-toast-message', () => ({
	__esModule: true,
	default: {
		show: (...args: any[]) => mockToastShow(...args),
	},
}));

jest.mock('react-i18next', () => ({
	__esModule: true,
	useTranslation: () => ({ t: (k: string, opts?: any) => opts?.defaultValue || k, i18n: { language: 'en' } }),
}));

const mockAuthValue = {
	logout: (...args: any[]) => mockLogout(...args),
};

const webSocketServiceMock = {
	setLogoutHandler: (...args: any[]) => mockSetLogoutHandler(...args),
	onConnectionStateChange: (...args: any[]) => mockOnConnectionStateChange(...args),
	onMessage: (...args: any[]) => mockOnMessage(...args),
	send: (...args: any[]) => mockSend(...args),
	connect: (...args: any[]) => mockConnect(...args),
	disconnect: (...args: any[]) => mockDisconnect(...args),
	getConnectionState: (...args: any[]) => mockGetConnectionState(...args),
};

jest.mock('./useAuth', () => ({
	__esModule: true,
	default: () => mockAuthValue,
}));

jest.mock('../services/WebSocketService', () => ({
	__esModule: true,
	default: {
		getInstance: () => webSocketServiceMock,
	},
}));

describe('useWebSocket hooks', () => {
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
		Object.keys(messageHandlers).forEach((k) => delete messageHandlers[k]);
		connectionStateHandler = undefined;

		mockGetConnectionState.mockReturnValue({
			isConnected: false,
			isConnecting: false,
			error: null,
			reconnectAttempts: 0,
		});

		mockOnConnectionStateChange.mockImplementation((handler: any) => {
			connectionStateHandler = handler;
			return jest.fn();
		});

		mockOnMessage.mockImplementation((eventName: string, handler: any) => {
			messageHandlers[eventName] = handler;
			return jest.fn();
		});

		mockSend.mockResolvedValue(undefined);
		mockConnect.mockResolvedValue(undefined);
	});

	it('exposes websocket state and delegates connect/disconnect/send', async () => {
		let hookState: any;
		const Probe = () => {
			hookState = useWebSocket();
			return React.createElement(Text, null, String(hookState.isConnected));
		};

		const tree = renderWithAct(React.createElement(Probe));
		await flush();

		ReactTestRenderer.act(() => {
			connectionStateHandler?.({ isConnected: true, isConnecting: false, error: null, reconnectAttempts: 0 });
		});

		expect(tree.root.findByProps({ children: 'true' })).toBeTruthy();
		expect(mockSetLogoutHandler).toHaveBeenCalled();

		await ReactTestRenderer.act(async () => {
			await hookState.connect();
			await hookState.send('ping', { ok: true });
		});
		hookState.disconnect();

		expect(mockConnect).toHaveBeenCalled();
		expect(mockSend).toHaveBeenCalledWith('ping', { ok: true });
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it('shows toast when connect or send fails', async () => {
		let hookState: any;
		mockConnect.mockRejectedValue(new Error('connect fail'));
		mockSend.mockRejectedValue(new Error('send fail'));

		const Probe = () => {
			hookState = useWebSocket();
			return React.createElement(Text, null, 'probe');
		};

		renderWithAct(React.createElement(Probe));
		await flush();

		await ReactTestRenderer.act(async () => {
			await hookState.connect();
			await hookState.send('event', {});
		});

		expect(mockToastShow).toHaveBeenCalled();
	});

	it('subscribes profile events and shows toasts in useProfileWebSocket', async () => {
		const Probe = () => {
			useProfileWebSocket();
			return React.createElement(Text, null, 'profile');
		};

		renderWithAct(React.createElement(Probe));
		await flush();

		messageHandlers.profile_update?.({ data: { action: 'profile_updated' } });
		messageHandlers.profile_password_update?.({ data: { action: 'password_changed' } });
		messageHandlers.profile_password_reset?.({ data: { action: 'logout_required' } });

		expect(mockToastShow).toHaveBeenCalledTimes(3);
	});
});
