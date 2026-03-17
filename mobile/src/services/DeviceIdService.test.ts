import DeviceInfo from 'react-native-device-info';
import DeviceIdService from './DeviceIdService';

jest.mock('react-native-device-info', () => ({
	getUniqueId: jest.fn(),
	getSystemName: jest.fn(() => 'iOS'),
	getSystemVersion: jest.fn(() => '17.0'),
	getVersion: jest.fn(() => '1.2.3'),
	getModel: jest.fn(() => 'iPhone'),
	getBrand: jest.fn(() => 'Apple'),
}));

const mockSecureStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
};

jest.mock('./SecureStorageService', () => ({
	__esModule: true,
	default: {
		getInstance: jest.fn(() => mockSecureStorage),
	},
}));

jest.mock('../config/config', () => ({
	__esModule: true,
	default: {
		storageKeys: {
			deviceId: 'device_id',
		},
	},
}));

describe('DeviceIdService', () => {
	const deviceInfoMock = DeviceInfo as jest.Mocked<typeof DeviceInfo>;

	beforeEach(async () => {
		jest.clearAllMocks();
		mockSecureStorage.getItem.mockResolvedValue(null);
		mockSecureStorage.setItem.mockResolvedValue(undefined);
		mockSecureStorage.removeItem.mockResolvedValue(undefined);
		deviceInfoMock.getUniqueId.mockResolvedValue('unique-id-123');

		const service = DeviceIdService.getInstance();
		await service.resetDeviceId();
	});

	it('returns singleton instance', () => {
		expect(DeviceIdService.getInstance()).toBe(DeviceIdService.getInstance());
	});

	it('returns stored device id when present', async () => {
		mockSecureStorage.getItem.mockResolvedValueOnce('stored-id');

		const service = DeviceIdService.getInstance();
		await expect(service.getDeviceId()).resolves.toBe('stored-id');
		expect(deviceInfoMock.getUniqueId).not.toHaveBeenCalled();
	});

	it('generates and stores a new id when no stored id exists', async () => {
		const service = DeviceIdService.getInstance();

		await expect(service.getDeviceId()).resolves.toBe('unique-id-123');
		expect(mockSecureStorage.setItem).toHaveBeenCalledWith('device_id', 'unique-id-123');

		await expect(service.getDeviceId()).resolves.toBe('unique-id-123');
		expect(deviceInfoMock.getUniqueId).toHaveBeenCalledTimes(1);
	});

	it('falls back to generated id when native unique id retrieval fails', async () => {
		deviceInfoMock.getUniqueId.mockRejectedValueOnce(new Error('native fail'));

		const service = DeviceIdService.getInstance();
		const id = await service.getDeviceId();

		expect(id.startsWith('fallback_')).toBe(true);
		expect(mockSecureStorage.setItem).toHaveBeenCalledWith('device_id', id);
	});

	it('returns composed device info payload', async () => {
		mockSecureStorage.getItem.mockResolvedValueOnce('stored-id');
		const service = DeviceIdService.getInstance();

		await expect(service.getDeviceInfo()).resolves.toEqual({
			deviceId: 'stored-id',
			platform: 'iOS',
			osVersion: '17.0',
			appVersion: '1.2.3',
			model: 'iPhone',
			brand: 'Apple',
		});
	});

	it('resets cached id and removes persisted key', async () => {
		const service = DeviceIdService.getInstance();
		await service.getDeviceId();

		await service.resetDeviceId();
		expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('device_id');

		deviceInfoMock.getUniqueId.mockResolvedValueOnce('new-id-after-reset');
		await expect(service.getDeviceId()).resolves.toBe('new-id-after-reset');
	});
});

