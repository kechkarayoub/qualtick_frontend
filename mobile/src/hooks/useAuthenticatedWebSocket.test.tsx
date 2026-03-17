import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import useAuthenticatedWebSocket from './useAuthenticatedWebSocket';

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('./useAuth', () => ({
	__esModule: true,
	default: () => mockUseAuth(),
}));

jest.mock('./useWebSocket', () => ({
	__esModule: true,
	default: () => ({
		connect: (...args: any[]) => mockConnect(...args),
		disconnect: (...args: any[]) => mockDisconnect(...args),
		isConnected: true,
		connectionState: {
			isConnected: true,
			isConnecting: false,
			error: null,
			reconnectAttempts: 0,
		},
		subscribe: jest.fn(),
		send: jest.fn(),
	}),
}));

describe('useAuthenticatedWebSocket', () => {
	const Probe = () => {
		const state = useAuthenticatedWebSocket();
		return <Text>{String(state.isConnected)}</Text>;
	};

	const renderWithAct = async () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		await ReactTestRenderer.act(async () => {
			tree = ReactTestRenderer.create(<Probe />);
			await Promise.resolve();
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockConnect.mockResolvedValue(undefined);
	});

	it('connects when user is authenticated', async () => {
		mockUseAuth.mockReturnValue({ isAuthenticated: true });
		const tree = await renderWithAct();

		expect(mockConnect).toHaveBeenCalledTimes(1);
		expect(mockDisconnect).not.toHaveBeenCalled();
		expect(tree.root.findByProps({ children: 'true' })).toBeTruthy();
	});

	it('disconnects when user is not authenticated', async () => {
		mockUseAuth.mockReturnValue({ isAuthenticated: false });
		await renderWithAct();

		expect(mockDisconnect).toHaveBeenCalledTimes(1);
		expect(mockConnect).not.toHaveBeenCalled();
	});

	it('swallows connect rejection to avoid uncaught errors', async () => {
		mockUseAuth.mockReturnValue({ isAuthenticated: true });
		mockConnect.mockRejectedValue(new Error('ws failed'));

		await renderWithAct();
		expect(mockConnect).toHaveBeenCalledTimes(1);
	});
});
