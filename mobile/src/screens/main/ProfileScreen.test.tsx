import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import ProfileScreen from './ProfileScreen';

const mockUseAuth = jest.fn();
const mockT = jest.fn((key: string, opts?: any) => {
	if (key === 'home:welcome.greeting') {
		return `hello:${opts?.name}`;
	}
	return key;
});

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string, opts?: any) => mockT(key, opts) }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
	useTheme: () => ({
		colors: {
			background: '#111',
			surface: '#222',
			text: '#333',
			textSecondary: '#444',
			success: '#555',
			warning: '#666',
		},
	}),
}));

jest.mock('../../hooks/useAuth', () => ({
	__esModule: true,
	default: () => mockUseAuth(),
}));

jest.mock('../../components/AppHeader', () => ({
	__esModule: true,
	default: ({ title }: any) => {
		const ReactLocal = require('react');
		const { Text } = require('react-native');
		return ReactLocal.createElement(Text, null, title);
	},
}));

describe('ProfileScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(ProfileScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseAuth.mockReturnValue({
			user: {
				first_name: 'Alice',
				last_name: 'Doe',
				username: 'alice',
				email: 'alice@example.com',
				user_phone_number: '+123',
				isEmailVerified: true,
				createdAt: '2025-01-01T00:00:00.000Z',
			},
		});
	});

	it('renders profile information and verified account status', () => {
		const tree = renderWithAct();

		expect(tree.root.findByProps({ children: 'profile:title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'profile:information.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Alice' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'Doe' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'alice' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'alice@example.com' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '+123' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'profile:accountStatus.verified' })).toBeTruthy();
		expect(tree.root.findByProps({ children: new Date('2025-01-01T00:00:00.000Z').toLocaleDateString() })).toBeTruthy();
	});

	it('renders fallback values when user data is missing', () => {
		mockUseAuth.mockReturnValueOnce({ user: { isEmailVerified: false } });
		const tree = renderWithAct();

		expect(tree.root.findAllByProps({ children: 'common:notProvided' }).length).toBeGreaterThan(0);
		expect(tree.root.findByProps({ children: 'profile:accountStatus.notVerified' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'common:unknown' })).toBeTruthy();
	});

	it('renders account status section labels', () => {
		const tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'profile:accountStatus.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'profile:accountStatus.emailVerified' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'profile:accountStatus.memberSince' })).toBeTruthy();
	});
});
