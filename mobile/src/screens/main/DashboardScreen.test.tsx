import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import DashboardScreen from './DashboardScreen';

const mockUseAuth = jest.fn();
const mockT = jest.fn((key: string, opts?: any) => {
	if (key === 'dashboard:welcome') {
		return `welcome:${opts?.name}`;
	}
	return opts?.defaultValue || key;
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
			primary: '#555',
			success: '#666',
			error: '#777',
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

describe('DashboardScreen', () => {
	const renderWithAct = () => {
		let tree!: ReactTestRenderer.ReactTestRenderer;
		ReactTestRenderer.act(() => {
			tree = ReactTestRenderer.create(React.createElement(DashboardScreen));
		});
		return tree;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseAuth.mockReturnValue({ user: { first_name: 'Alice', username: 'alice' } });
	});

	it('renders header, welcome card, and dashboard stats', () => {
		const tree = renderWithAct();

		expect(tree.root.findByProps({ children: 'dashboard:title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'welcome:Alice' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'dashboard:description' })).toBeTruthy();

		expect(tree.root.findByProps({ children: '24' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '18' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '6' })).toBeTruthy();
		expect(tree.root.findByProps({ children: '75%' })).toBeTruthy();

		expect(tree.root.findByProps({ children: 'dashboard:stats.totalSessions' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'dashboard:stats.successes' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'dashboard:stats.failures' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'dashboard:stats.successRate' })).toBeTruthy();
	});

	it('falls back to username then guest in welcome text', () => {
		mockUseAuth.mockReturnValueOnce({ user: { username: 'bob' } });
		let tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'welcome:bob' })).toBeTruthy();

		mockUseAuth.mockReturnValueOnce({ user: null });
		tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'welcome:Guest' })).toBeTruthy();
	});

	it('renders quick action section and labels', () => {
		const tree = renderWithAct();
		expect(tree.root.findByProps({ children: 'dashboard:quickActions.title' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'dashboard:quickActions.findProfessionals' })).toBeTruthy();
		expect(tree.root.findByProps({ children: 'dashboard:quickActions.viewStats' })).toBeTruthy();
	});
});
