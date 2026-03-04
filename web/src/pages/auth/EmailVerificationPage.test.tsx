/**
 * EmailVerificationPage Component Tests
 * 
 * The tests verify that mocks are properly working by checking translation keys
 * since i18n is not fully loaded in the test environment.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { toast } from 'react-toastify';
import i18n from '../../i18n';
import EmailVerificationPage from './EmailVerificationPage';

// Mock the toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the AuthenticatedApiService completely
jest.mock('../../services/AuthenticatedApiService', () => {
  // Create the mock function inside the factory
  const mockFn = jest.fn();
  return {
    __esModule: true,
    default: {
      getInstance: () => ({
        get: mockFn,
      }),
    },
    // Export the mock function so we can access it in tests
    __mockGetFn: mockFn,
  };
});

// Create a mock that provides uid and token for email verification
let mockEmailSearchParams = new URLSearchParams('uid=123&token=abc123');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [mockEmailSearchParams, jest.fn()],
}));

// Helper function to set mock parameters for email verification tests
const setMockEmailSearchParams = (params: string) => {
  mockEmailSearchParams = new URLSearchParams(params);
};

// Helper function to reset to default valid parameters for email verification
const resetMockEmailSearchParams = () => {
  mockEmailSearchParams = new URLSearchParams('uid=123&token=abc123');
};

// Import the mocked service to access the mock function
const { __mockGetFn: mockGetFn } = require('../../services/AuthenticatedApiService');

const mockToast = toast as jest.Mocked<typeof toast>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement, initialEntries?: string[]) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries || ['/accounts/verify-email']}>
          {component}
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

// Helper to create mock AxiosResponse
const createMockResponse = (status: number, data: any) => ({
  status,
  data,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFn.mockClear();
    // Reset to default valid parameters for email verification
    resetMockEmailSearchParams();
  });

  describe('Invalid Link Cases', () => {
    it('shows invalid link message when no uid or token provided', () => {
      // Set empty parameters to simulate missing uid/token
      setMockEmailSearchParams('');
      
      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email']);
      
      // Look for the translation key since i18n might not be fully loaded
      expect(screen.getByText('emailVerification.invalidLinkTitle')).toBeInTheDocument();
      expect(screen.getByText('emailVerification.backToLogin')).toBeInTheDocument();
    });

    it('shows invalid link message when only uid is provided', () => {
      // Set parameters with only uid to simulate missing token
      setMockEmailSearchParams('uid=123');
      
      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123']);
      
      expect(screen.getByText('emailVerification.invalidLinkTitle')).toBeInTheDocument();
    });

    it('shows invalid link message when only token is provided', () => {
      // Set parameters with only token to simulate missing uid
      setMockEmailSearchParams('token=abc123');
      
      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?token=abc123']);
      
      expect(screen.getByText('emailVerification.invalidLinkTitle')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state during verification', async () => {
      // Mock a delayed API response
      mockGetFn.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(createMockResponse(200, { message: 'Success' })), 100)
        )
      );

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=abc123']);
      
      // Should show loading initially
      expect(screen.getByText('emailVerification.verifying')).toBeInTheDocument();
    });
  });

  describe('Successful Verification Cases', () => {
    it('shows success message for valid email verification', async () => {
      mockGetFn.mockResolvedValue(createMockResponse(200, {
        message: 'Email verified successfully'
      }));

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=abc123']);
      
      await waitFor(() => {
        expect(screen.getByText('Email verified successfully')).toBeInTheDocument();
      });
      
      expect(mockToast.success).toHaveBeenCalledWith('Email verified successfully');
    });

    it('shows already verified message when email was previously verified', async () => {
      mockGetFn.mockResolvedValue(createMockResponse(200, { 
        message: 'Email is already verified',
        already_verified: true 
      }));

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=abc123']);
      
      await waitFor(() => {
        // Component shows the message as title when already verified
        expect(screen.getByText('emailVerification.alreadyVerifiedTitle')).toBeInTheDocument();
      });
      
      expect(mockToast.success).toHaveBeenCalledWith('Email is already verified');
    });
  });

  describe('Error Cases', () => {
    it('handles 400 error with expired token', async () => {
      mockGetFn.mockRejectedValue({
        response: {
          status: 400,
          data: { 
            message: 'Token has expired',
            expired: true 
          }
        }
      });

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=expired123']);
      
      await waitFor(() => {
        // Component shows expired title for expired tokens
        expect(screen.getByText('emailVerification.expiredTitle')).toBeInTheDocument();
      });
      
      expect(mockToast.error).toHaveBeenCalledWith('Token has expired');
    });

    it('handles 400 error with invalid token', async () => {
      mockGetFn.mockRejectedValue({
        response: {
          status: 400,
          data: { 
            message: 'Invalid token' 
          }
        }
      });

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=invalid']);
      
      await waitFor(() => {
        // Component shows error title for invalid tokens
        expect(screen.getByText('emailVerification.errorTitle')).toBeInTheDocument();
      });
      
      expect(mockToast.error).toHaveBeenCalledWith('Invalid token');
    });

    it('handles generic server errors', async () => {
      mockGetFn.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      });

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=abc123']);
      
      await waitFor(() => {
        // Component shows error title for server errors
        expect(screen.getByText('emailVerification.errorTitle')).toBeInTheDocument();
      });
      
      expect(mockToast.error).toHaveBeenCalledWith('Internal server error');
    });
  });

  describe('Resend Verification', () => {
    it('successfully resends verification email', async () => {
      // Setup initial error state with expired token
      mockGetFn.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { 
            message: 'Token has expired',
            expired: true 
          }
        }
      });

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=expired']);
      
      // Wait for the error state to render and find resend button
      await waitFor(() => {
        expect(screen.getByText('emailVerification.resendButton')).toBeInTheDocument();
      });

      // Mock successful resend
      mockGetFn.mockResolvedValue(createMockResponse(200, { 
        message: 'Verification email sent successfully' 
      }));

      const resendButton = screen.getByText('emailVerification.resendButton');
      fireEvent.click(resendButton);
      
      await waitFor(() => {
        // Component shows the resent title when email is successfully resent
        expect(screen.getByText('emailVerification.emailResentTitle')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Toast should show the translated resend success message
      expect(mockToast.success).toHaveBeenCalledWith('emailVerification.resendSuccess');
    });

    it('handles resend verification error', async () => {
      // Setup initial error state
      mockGetFn.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { 
            message: 'Token has expired',
            expired: true 
          }
        }
      });

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=expired']);
      
      // Wait for the error state to render
      await waitFor(() => {
        expect(screen.getByText('emailVerification.resendButton')).toBeInTheDocument();
      });

      // Mock failed resend
      mockGetFn.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Failed to resend email' }
        }
      });

      const resendButton = screen.getByText('emailVerification.resendButton');
      fireEvent.click(resendButton);
      
      await waitFor(() => {
        // Component shows the actual error message from the server
        expect(mockToast.error).toHaveBeenCalledWith('Failed to resend email');
      }, { timeout: 3000 });
    });
  });

  describe('Navigation Links', () => {
    it('shows register link when signup is enabled', () => {
      process.env.REACT_APP_ENABLE_SIGNUP = 'true';
      
      // Set empty parameters to show invalid link state with register button
      setMockEmailSearchParams('');
      
      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email']);
      
      // Should find the register link
      expect(screen.getByText('emailVerification.goToRegister')).toBeInTheDocument();
    });

    it('hides register link when signup is disabled', () => {
      process.env.REACT_APP_ENABLE_SIGNUP = 'false';
      
      // Set empty parameters to show invalid link state
      setMockEmailSearchParams('');
      
      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email']);
      
      // Should not find the register link
      expect(screen.queryByText('emailVerification.goToRegister')).not.toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('includes language parameter in API calls', async () => {
      mockGetFn.mockResolvedValue(createMockResponse(200, { message: 'Success' }));

      renderWithProviders(<EmailVerificationPage />, ['/accounts/verify-email?uid=123&token=abc123']);
      
      // The API should be called
      await waitFor(() => {
        expect(mockGetFn).toHaveBeenCalled();
      });
      
      // Check if call includes language parameter
      expect(mockGetFn).toHaveBeenCalledWith(
        expect.stringContaining('selected_language=')
      );
    });
  });
});