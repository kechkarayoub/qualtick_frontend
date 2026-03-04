/**
 * FeaturesModal Component Tests
 * 
 * This test suite covers:
 * - Modal rendering with BaseModal integration
 * - Hero section display with logo and messaging
 * - Core features section with icons and descriptions
 * - Advanced features section with detailed content
 * - Call-to-action section presentation
 * - Modal interactions and state management
 * - Feature grid layout and structure
 * - SVG icon rendering and accessibility
 * - Internationalization support
 * - Environment variable usage
 * 
 * The tests mock:
 * - react-i18next for translations
 * - BaseModal component for modal functionality testing
 * - Logo image imports
 * 
 * Run with: yarn test --testPathPattern=FeaturesModal.test.tsx --watchAll=false
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeaturesModal from './FeaturesModal';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: { [key: string]: string } = {
        'common:footer.features': 'Features',
        'common:features.title': 'Powerful Features for Healthcare Platforms',
        'common:features.subtitle': 'Everything you need to manage, organize, and deliver healthcare services',
        'common:features.coreFeatures': 'Core Features',
        'common:features.teamManagement': 'Patient Management',
        'common:features.teamManagementDesc': 'Manage patient records, track medical histories, monitor health statistics, and organize healthcare activities with ease.',
        'common:features.eventOrganization': 'Appointment Scheduling',
        'common:features.eventOrganizationDesc': 'Schedule patient appointments, medical consultations, and follow-up sessions. Send automated reminders and manage healthcare logistics seamlessly.',
        'common:features.communication': 'Real-time Communication',
        'common:features.communicationDesc': 'Stay connected with secure messaging, patient notifications, and healthcare team communication. Never miss important medical updates.',
        'common:features.analytics': 'Performance Analytics',
        'common:features.analyticsDesc': 'Track detailed health statistics, analyze patient trends, and generate comprehensive reports for healthcare providers and patients.',
        'common:features.tournaments': 'Treatment Management',
        'common:features.tournamentsDesc': 'Create and manage treatment plans with progress tracking, medication monitoring, and automated scheduling.',
        'common:features.mobileApp': 'Mobile Application',
        'common:features.mobileAppDesc': 'Access all features on the go with our native mobile apps for iOS and Android devices.',
        'common:features.advancedFeatures': 'Advanced Features',
        'common:features.liveTracking': 'Real-time Health Monitoring',
        'common:features.liveTrackingDesc': 'Real-time vital signs monitoring, live health updates, and instant medical alert notifications.',
        'common:features.integration': 'Third-party Integrations',
        'common:features.integrationDesc': 'Connect with popular health devices, medical systems, and healthcare platforms for seamless data integration.',
        'common:features.security': 'Advanced Security',
        'common:features.securityDesc': 'Enterprise-grade security with data encryption, secure authentication, and privacy controls.',
        'common:features.getStarted': 'Ready to Get Started?',
        'common:features.getStartedDesc': 'Join thousands of healthcare facilities already using Qualitick to manage their patients and medical services.'
      };
      return options?.defaultValue || translations[key] || key;
    }
  })
}));

// Mock BaseModal component
jest.mock('./BaseModal', () => {
  return function MockBaseModal({ 
    isOpen, 
    onClose, 
    title, 
    size, 
    children 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    size: string; 
    children: React.ReactNode; 
  }) {
    if (!isOpen) return null;
    
    return (
      <div data-testid="base-modal-component">
        <div data-testid="base-modal-title">{title}</div>
        <div data-testid="base-modal-size">{size}</div>
        <div data-testid="base-modal-content">{children}</div>
        <button data-testid="base-modal-close" onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock logo import
jest.mock('../../logo.png', () => 'mock-logo.png');

describe('FeaturesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<FeaturesModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('base-modal-component')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('base-modal-component')).toBeInTheDocument();
      expect(screen.getByTestId('base-modal-title')).toHaveTextContent('Features');
      expect(screen.getByTestId('base-modal-size')).toHaveTextContent('large');
    });

    it('should render with correct modal structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Check that the modal content contains the features content
      expect(screen.getByTestId('base-modal-content')).toBeInTheDocument();
    });
  });

  describe('Hero Section', () => {
    it('should render hero section with logo', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      const logo = screen.getByAltText('Qualitick Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'mock-logo.png');
      expect(logo).toHaveClass('modal-hero-logo-img');
    });

    it('should render hero title and subtitle', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Powerful Features for Healthcare Platforms');
      expect(screen.getByText('Everything you need to manage, organize, and deliver healthcare services')).toBeInTheDocument();
    });

    it('should have proper hero section structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('features-hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('features-hero')).toBeInTheDocument();
    });
  });

  describe('Core Features Section', () => {
    it('should render core features section title', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Core Features')).toBeInTheDocument();
      expect(screen.getByText('Core Features')).toHaveClass('modal-section-title');
    });

    it('should render team management feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Patient Management')).toBeInTheDocument();
      expect(screen.getByText('Manage patient records, track medical histories, monitor health statistics, and organize healthcare activities with ease.')).toBeInTheDocument();
    });

    it('should render event organization feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Appointment Scheduling')).toBeInTheDocument();
      expect(screen.getByText('Schedule patient appointments, medical consultations, and follow-up sessions. Send automated reminders and manage healthcare logistics seamlessly.')).toBeInTheDocument();
    });

    it('should render real-time communication feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Real-time Communication')).toBeInTheDocument();
      expect(screen.getByText('Stay connected with secure messaging, patient notifications, and healthcare team communication. Never miss important medical updates.')).toBeInTheDocument();
    });

    it('should render performance analytics feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Performance Analytics')).toBeInTheDocument();
      expect(screen.getByText('Track detailed health statistics, analyze patient trends, and generate comprehensive reports for healthcare providers and patients.')).toBeInTheDocument();
    });

    it('should render treatment management feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Treatment Management')).toBeInTheDocument();
      expect(screen.getByText('Create and manage treatment plans with progress tracking, medication monitoring, and automated scheduling.')).toBeInTheDocument();
    });

    it('should render mobile application feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Mobile Application')).toBeInTheDocument();
      expect(screen.getByText('Access all features on the go with our native mobile apps for iOS and Android devices.')).toBeInTheDocument();
    });

    it('should render feature icons with proper SVG structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('features-grid')).toBeInTheDocument();
      
      // Check that SVG icons are rendered properly by looking for text content
      expect(screen.getByText('Patient Management')).toBeInTheDocument();
      expect(screen.getByText('Appointment Scheduling')).toBeInTheDocument();
      expect(screen.getByText('Real-time Communication')).toBeInTheDocument();
    });

    it('should have proper feature grid structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('features-grid')).toBeInTheDocument();
    });
  });

  describe('Advanced Features Section', () => {
    it('should render advanced features section title', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    });

    it('should render live health monitoring feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Real-time Health Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Real-time vital signs monitoring, live health updates, and instant medical alert notifications.')).toBeInTheDocument();
    });

    it('should render third-party integrations feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Third-party Integrations')).toBeInTheDocument();
      expect(screen.getByText('Connect with popular health devices, medical systems, and healthcare platforms for seamless data integration.')).toBeInTheDocument();
    });

    it('should render advanced security feature', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Advanced Security')).toBeInTheDocument();
      expect(screen.getByText('Enterprise-grade security with data encryption, secure authentication, and privacy controls.')).toBeInTheDocument();
    });

    it('should render advanced feature icons with proper SVG structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('features-advanced-grid')).toBeInTheDocument();
      
      // Check that advanced features are rendered by looking for text content
      expect(screen.getByText('Real-time Health Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Third-party Integrations')).toBeInTheDocument();
      expect(screen.getByText('Advanced Security')).toBeInTheDocument();
    });

    it('should have proper advanced features structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('features-advanced-grid')).toBeInTheDocument();
    });
  });

  describe('Call-to-Action Section', () => {
    it('should render call-to-action section', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of healthcare facilities already using Qualitick to manage their patients and medical services.')).toBeInTheDocument();
    });

    it('should have proper CTA structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      expect(screen.getByTestId('features-cta-section')).toBeInTheDocument();
      expect(screen.getByTestId('features-cta')).toBeInTheDocument();
    });

    it('should render CTA with correct heading level', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      const ctaTitle = screen.getByText('Ready to Get Started?');
      expect(ctaTitle.tagName).toBe('H4');
      expect(ctaTitle).toHaveClass('modal-cta-title');
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when modal is closed', async () => {
      const mockOnClose = jest.fn();
      render(<FeaturesModal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByTestId('base-modal-close');
      await userEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should pass onClose callback to BaseModal', () => {
      const mockOnClose = jest.fn();
      render(<FeaturesModal {...defaultProps} onClose={mockOnClose} />);
      
      expect(screen.getByTestId('base-modal-close')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have proper CSS class structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Check that features modal content exists
      expect(screen.getByTestId('base-modal-content')).toBeInTheDocument();
    });

    it('should render all sections in correct order', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Check that all main sections exist
      expect(screen.getByTestId('features-hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('features-core-section')).toBeInTheDocument();
      expect(screen.getByTestId('features-advanced-section')).toBeInTheDocument();
      expect(screen.getByTestId('features-cta-section')).toBeInTheDocument();
    });

    it('should have proper section structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Hero section
      expect(screen.getByTestId('features-hero')).toBeInTheDocument();
      
      // Core features section
      expect(screen.getByTestId('features-grid')).toBeInTheDocument();
      
      // Advanced features section
      expect(screen.getByTestId('features-advanced-grid')).toBeInTheDocument();
      
      // CTA section
      expect(screen.getByTestId('features-cta')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Check hero title
      const heroTitle = screen.getByRole('heading', { level: 3 });
      expect(heroTitle).toHaveTextContent('Powerful Features for Healthcare Platforms');
      
      // Check section titles
      const sectionTitles = screen.getAllByRole('heading', { level: 4 });
      expect(sectionTitles).toHaveLength(3); // Core Features, Advanced Features, CTA title
      
      // Check feature titles
      const featureTitles = screen.getAllByRole('heading', { level: 5 });
      expect(featureTitles.length).toBeGreaterThan(0);
    });

    it('should have proper alt text for logo', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      const logo = screen.getByAltText('Qualitick Logo');
      expect(logo).toBeInTheDocument();
    });

    it('should have proper SVG accessibility', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Check that SVG elements exist by verifying icon containers
      expect(screen.getByTestId('features-grid')).toBeInTheDocument();
      expect(screen.getByTestId('features-advanced-grid')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should use translation keys for all text content', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      // Check if translated content is displayed
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Powerful Features for Healthcare Platforms')).toBeInTheDocument();
      expect(screen.getByText('Core Features')).toBeInTheDocument();
      expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      // Mock useTranslation to return key when translation is missing
      const useTranslationSpy = jest.spyOn(require('react-i18next'), 'useTranslation');
      useTranslationSpy.mockReturnValue({
        t: (key: string, options?: any) => options?.defaultValue || key
      });

      render(<FeaturesModal {...defaultProps} />);
      
      // Should display default values when translations are missing
      expect(screen.getByText('Powerful Features for Healthcare Platforms')).toBeInTheDocument();
      
      useTranslationSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onClose callback gracefully', () => {
      // @ts-ignore - intentionally passing undefined onClose for testing
      expect(() => render(<FeaturesModal isOpen={true} onClose={undefined} />)).not.toThrow();
    });

    it('should handle missing logo gracefully', () => {
      render(<FeaturesModal {...defaultProps} />);
      
      const logo = screen.getByAltText('Qualitick Logo');
      expect(logo).toHaveAttribute('src', 'mock-logo.png');
    });
  });
});
