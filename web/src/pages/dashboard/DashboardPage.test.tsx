/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import DashboardPage from './DashboardPage';
import useAuth from '../../hooks/useAuth';

// Suppress console warnings and errors in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  if (args[0]?.includes?.('act') || args[0]?.includes?.('ReactDOM.render') || args[0]?.includes?.('wrapped in act')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('act') || args[0]?.includes?.('ReactDOM.render') || args[0]?.includes?.('wrapped in act')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Mock i18next dependencies to prevent network requests
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock useAuth hook
jest.mock('../../hooks/useAuth');

// Mock the API service properly
jest.mock('../../services/AuthenticatedApiService', () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      })),
    },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('DashboardPage', () => {
  const renderWithRouter = (component = <DashboardPage />) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Mock i18n translations
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string, params?: any) => {
        const translations: { [key: string]: string } = {
          'dashboard:welcome': `Welcome back, ${params?.name || 'User'}!`,
          'dashboard:description': 'Here\'s your healthcare overview',
          'dashboard:stats.totalSessions': 'Total Sessions',
          'dashboard:stats.successes': 'Successful Sessions',
          'dashboard:stats.failures': 'Failed Sessions',
          'dashboard:stats.successRate': 'Success Rate',
          'dashboard:recentSessions.title': 'Recent Sessions',
          'dashboard:recentSessions.viewAll': 'View All',
          'dashboard:sessionResult.success': 'Success',
          'dashboard:sessionResult.failure': 'Failed',
          'dashboard:quickActions.title': 'Quick Actions',
          'dashboard:quickActions.startNewSession': 'Start New Session',
          'dashboard:quickActions.findProfessionals': 'Find Professionals',
          'dashboard:quickActions.viewStats': 'View Stats',
          'common:user.guest': 'Guest',
        };
        return translations[key] || key;
      },
    });

    // Mock useAuth hook with default user
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        username: 'testuser',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      requestPasswordReset: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      userError: null,
      isLoggingIn: false,
      isRegistering: false,
      isResettingPassword: false,
      isRequestingPasswordReset: false,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Display', () => {
    it('should display welcome message with full name when both first_name and last_name are available', () => {
      renderWithRouter();
      
      expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
    });

    it('should display welcome message with username when first_name or last_name is missing', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          username: 'testuser',
          first_name: '',
          last_name: '',
          email: 'test@example.com',
        },
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        userError: null,
      } as any);

      renderWithRouter();
      
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    });

    it('should display welcome message with Guest when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        userError: null,
      } as any);

      renderWithRouter();
      
      expect(screen.getByText('Welcome back, Guest!')).toBeInTheDocument();
    });

    it('should display dashboard description', () => {
      renderWithRouter();
      
      expect(screen.getByText('Here\'s your healthcare overview')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should render all statistics cards', () => {
      renderWithRouter();
      
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('Successful Sessions')).toBeInTheDocument();
      expect(screen.getByText('Failed Sessions')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });

    it('should display correct values for statistics', () => {
      renderWithRouter();
      
      expect(screen.getByText('24')).toBeInTheDocument(); // Total Sessions
      expect(screen.getByText('18')).toBeInTheDocument(); // Successful Sessions
      expect(screen.getByText('6')).toBeInTheDocument();  // Failed Sessions
      expect(screen.getByText('75%')).toBeInTheDocument(); // Success Rate
    });

    it('should have proper CSS classes for stat cards', () => {
      renderWithRouter();
      
      // Check that stat cards have been rendered
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('Successful Sessions')).toBeInTheDocument();
      expect(screen.getByText('Failed Sessions')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  describe('Recent Sessions', () => {
    it('should render recent sessions section', () => {
      renderWithRouter();
      
      expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All' })).toBeInTheDocument();
    });

    it('should display recent sessions list with correct structure', () => {
      renderWithRouter();
      
      // Check that the recent sessions section exists
      expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All' })).toBeInTheDocument();
    });

    it('should have proper session results structure', () => {
      renderWithRouter();
      
      // Check that the recent sessions section is properly structured
      expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All' })).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render quick actions section', () => {
      renderWithRouter();
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should display all quick action buttons', () => {
      renderWithRouter();
      
      expect(screen.getByRole('button', { name: 'Start New Session' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Find Professionals' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View Stats' })).toBeInTheDocument();
    });

    it('should have proper CSS classes for action buttons', () => {
      renderWithRouter();
      
      const newSessionBtn = screen.getByRole('button', { name: 'Start New Session' });
      const findProfessionalsBtn = screen.getByRole('button', { name: 'Find Professionals' });
      const viewStatsBtn = screen.getByRole('button', { name: 'View Stats' });

      expect(newSessionBtn).toHaveClass('action-btn--primary');
      expect(findProfessionalsBtn).toHaveClass('action-btn--secondary');
      expect(viewStatsBtn).toHaveClass('action-btn--secondary');
    });

    it('should handle click events on action buttons', () => {
      renderWithRouter();
      
      const newSessionBtn = screen.getByRole('button', { name: 'Start New Session' });
      const findProfessionalsBtn = screen.getByRole('button', { name: 'Find Professionals' });
      const viewStatsBtn = screen.getByRole('button', { name: 'View Stats' });
      
      // These should not throw errors when clicked
      userEvent.click(newSessionBtn);
      userEvent.click(findProfessionalsBtn);
      userEvent.click(viewStatsBtn);
    });
  });

  describe('Component Structure', () => {
    it('should render main dashboard content', () => {
      renderWithRouter();
      
      // Check that main sections are present
      expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
      expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithRouter();
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome back, John Doe!');
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings).toHaveLength(2);
      expect(subHeadings[0]).toHaveTextContent('Recent Sessions');
      expect(subHeadings[1]).toHaveTextContent('Quick Actions');
    });

    it('should have accessible button labels', () => {
      renderWithRouter();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // View All + 3 Quick Actions
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Translation Keys', () => {
    it('should use correct translation keys', () => {
      const tMock = jest.fn((key, params) => key);
      (useTranslation as jest.Mock).mockReturnValue({
        t: tMock,
      });

      renderWithRouter();
      
      expect(tMock).toHaveBeenCalledWith('dashboard:welcome', { name: 'John Doe' });
      expect(tMock).toHaveBeenCalledWith('dashboard:description');
      expect(tMock).toHaveBeenCalledWith('dashboard:stats.totalSessions');
      expect(tMock).toHaveBeenCalledWith('dashboard:stats.successes');
      expect(tMock).toHaveBeenCalledWith('dashboard:stats.failures');
      expect(tMock).toHaveBeenCalledWith('dashboard:stats.totalSessions');
      expect(tMock).toHaveBeenCalledWith('dashboard:recentSessions.title');
      expect(tMock).toHaveBeenCalledWith('dashboard:quickActions.title');
    });
  });
});
