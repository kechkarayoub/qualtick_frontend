import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import SecureStorageService from './SecureStorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	getAllKeys: jest.fn(),
	multiRemove: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
	setInternetCredentials: jest.fn(),
	getInternetCredentials: jest.fn(),
	resetInternetCredentials: jest.fn(),
}));

describe('SecureStorageService', () => {
	const asyncStorageMock = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
	const keychainMock = Keychain as jest.Mocked<typeof Keychain>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns singleton instance', () => {
		const a = SecureStorageService.getInstance();
		const b = SecureStorageService.getInstance();
		expect(a).toBe(b);
	});

	it('stores secure item with keychain and falls back to AsyncStorage on error', async () => {
		const service = SecureStorageService.getInstance();

		await service.setSecureItem('token', 'abc');
		expect(keychainMock.setInternetCredentials).toHaveBeenCalledWith('token', 'token', 'abc');

		keychainMock.setInternetCredentials.mockRejectedValueOnce(new Error('keychain fail'));
		await service.setSecureItem('token', 'xyz');
		expect(asyncStorageMock.setItem).toHaveBeenCalledWith('token', 'xyz');
	});

	it('retrieves secure item from keychain and falls back to AsyncStorage on error', async () => {
		const service = SecureStorageService.getInstance();

		keychainMock.getInternetCredentials.mockResolvedValueOnce({ password: 'from_keychain' } as any);
		await expect(service.getSecureItem('token')).resolves.toBe('from_keychain');

		keychainMock.getInternetCredentials.mockResolvedValueOnce(false as any);
		await expect(service.getSecureItem('token')).resolves.toBeNull();

		keychainMock.getInternetCredentials.mockRejectedValueOnce(new Error('keychain fail'));
		asyncStorageMock.getItem.mockResolvedValueOnce('from_storage');
		await expect(service.getSecureItem('token')).resolves.toBe('from_storage');
	});

	it('removes secure item from keychain and falls back to AsyncStorage on error', async () => {
		const service = SecureStorageService.getInstance();

		await service.removeSecureItem('token');
		expect(keychainMock.resetInternetCredentials).toHaveBeenCalledWith({ service: 'token' });

		keychainMock.resetInternetCredentials.mockRejectedValueOnce(new Error('keychain fail'));
		await service.removeSecureItem('token');
		expect(asyncStorageMock.removeItem).toHaveBeenCalledWith('token');
	});

	it('prefixes session keys and clears only session entries', async () => {
		const service = SecureStorageService.getInstance();

		await service.setSessionItem('access_token', 'a1');
		expect(asyncStorageMock.setItem).toHaveBeenCalledWith('session_access_token', 'a1');

		asyncStorageMock.getItem.mockResolvedValueOnce('a1');
		await expect(service.getSessionItem('access_token')).resolves.toBe('a1');
		expect(asyncStorageMock.getItem).toHaveBeenCalledWith('session_access_token');

		await service.removeSessionItem('access_token');
		expect(asyncStorageMock.removeItem).toHaveBeenCalledWith('session_access_token');

		asyncStorageMock.getAllKeys.mockResolvedValueOnce([
			'session_access_token',
			'session_refresh_token',
			'theme',
		]);
		await service.clearSession();
		expect(asyncStorageMock.multiRemove).toHaveBeenCalledWith([
			'session_access_token',
			'session_refresh_token',
		]);
	});
});

