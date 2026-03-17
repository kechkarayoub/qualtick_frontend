import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Image, Text, TouchableOpacity } from 'react-native';

import ImagePickerInput from './ImagePickerInput';

const mockUseTheme = jest.fn();
const mockLaunchImageLibrary = jest.fn();
const mockLaunchCamera = jest.fn();

jest.mock('../../../contexts/ThemeContext', () => ({
	__esModule: true,
	useTheme: () => mockUseTheme(),
}));

jest.mock('react-native-image-picker', () => ({
	__esModule: true,
	launchImageLibrary: (...args: any[]) => mockLaunchImageLibrary(...args),
	launchCamera: (...args: any[]) => mockLaunchCamera(...args),
}));

describe('ImagePickerInput', () => {
	const renderWithAct = (element: React.ReactElement) => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(element);
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockUseTheme.mockReturnValue({
			colors: {
				text: '#111111',
				error: '#EF4444',
				border: '#E5E7EB',
				surface: '#FFFFFF',
				textSecondary: '#6B7280',
			},
		});

		jest.spyOn(Alert, 'alert').mockImplementation(() => {});
	});

	afterEach(() => {
		(Alert.alert as jest.Mock).mockRestore?.();
	});

	it('renders placeholder when there is no image', () => {
		const tree = renderWithAct(
			<ImagePickerInput label="Profile" value={null} onChange={jest.fn()} />
		);

		expect(tree.root.findByProps({ children: 'Tap to select image' })).toBeTruthy();
	});

	it('renders selected image when value has uri', () => {
		const tree = renderWithAct(
			<ImagePickerInput
				label="Profile"
				value={{ uri: 'file:///profile.jpg' } as any}
				onChange={jest.fn()}
			/>
		);

		const image = tree.root.findByType(Image);
		expect(image.props.source).toEqual({ uri: 'file:///profile.jpg' });
	});

	it('shows alert with picker options when pressed', () => {
		const tree = renderWithAct(
			<ImagePickerInput label="Avatar" value={null} onChange={jest.fn()} />
		);

		const pressable = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			pressable.props.onPress();
		});

		expect(Alert.alert).toHaveBeenCalledTimes(1);
		const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];
		expect(title).toBe('Avatar');
		expect(message).toBe('Choose an option');
		expect(buttons).toHaveLength(4);
	});

	it('selects image from library and calls onChange with first asset', async () => {
		const onChange = jest.fn();
		const selectedAsset = { uri: 'file:///library.jpg', fileName: 'library.jpg' };
		mockLaunchImageLibrary.mockResolvedValue({ didCancel: false, assets: [selectedAsset] });

		const tree = renderWithAct(<ImagePickerInput label="Avatar" value={null} onChange={onChange} />);

		const pressable = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			pressable.props.onPress();
		});

		const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
		const libraryButton = buttons.find((btn: any) => btn.text === 'Library');

		await ReactTestRenderer.act(async () => {
			await libraryButton.onPress();
		});

		expect(mockLaunchImageLibrary).toHaveBeenCalledWith({ mediaType: 'photo', quality: 0.8 });
		expect(onChange).toHaveBeenCalledWith(selectedAsset);
	});

	it('takes image from camera and calls onChange with first asset', async () => {
		const onChange = jest.fn();
		const selectedAsset = { uri: 'file:///camera.jpg', fileName: 'camera.jpg' };
		mockLaunchCamera.mockResolvedValue({ didCancel: false, assets: [selectedAsset] });

		const tree = renderWithAct(<ImagePickerInput label="Avatar" value={null} onChange={onChange} />);

		const pressable = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			pressable.props.onPress();
		});

		const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
		const cameraButton = buttons.find((btn: any) => btn.text === 'Camera');

		await ReactTestRenderer.act(async () => {
			await cameraButton.onPress();
		});

		expect(mockLaunchCamera).toHaveBeenCalledWith({ mediaType: 'photo', quality: 0.8 });
		expect(onChange).toHaveBeenCalledWith(selectedAsset);
	});

	it('removes image when remove option is selected', () => {
		const onChange = jest.fn();

		const tree = renderWithAct(
			<ImagePickerInput
				label="Avatar"
				value={{ uri: 'file:///existing.jpg' } as any}
				onChange={onChange}
			/>
		);

		const pressable = tree.root.findByType(TouchableOpacity);
		ReactTestRenderer.act(() => {
			pressable.props.onPress();
		});

		const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
		const removeButton = buttons.find((btn: any) => btn.text === 'Remove');

		ReactTestRenderer.act(() => {
			removeButton.onPress();
		});

		expect(onChange).toHaveBeenCalledWith(null);
	});

	it('renders required marker and error text', () => {
		const tree = renderWithAct(
			<ImagePickerInput
				label="Avatar"
				value={null}
				onChange={jest.fn()}
				required
				error="Image is required"
			/>
		);

		const allText = tree.root.findAllByType(Text).map((node) => String(node.props.children));
		expect(allText.some((text) => text.includes('Avatar'))).toBe(true);
		expect(allText.some((text) => text.includes('*'))).toBe(true);
		expect(tree.root.findByProps({ children: 'Image is required' })).toBeTruthy();
	});
});
