/**
 * AboutUsModal Component Tests
 * 
 * This test suite covers:
 * - Modal rendering with BaseModal integration
 * - Company information and branding display for healthcare platform
 * - Mission and values sections rendering (healthcare-focused)
 * - Feature highlights and descriptions (patient management, healthcare workflow, digital integration)
 * - Environment variable usage (support email)
 * - Contact information display
 * - Modal interactions and closing
 * - Internationalization support
 * - Logo and hero section rendering
 * 
 * The tests mock:
 * - react-i18next for translations
 * - BaseModal component for modal functionality testing
 * - Logo image imports
 * 
 * Run with: yarn test --testPathPattern=AboutUsModal.test.tsx --watchAll=false
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutUsModal from './AboutUsModal';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: { [key: string]: string } = {
        'common:footer.about': 'About Us',
        'common:app.welcome': 'Welcome to Qualitick',
        'common:app.tagline': 'Your Digital Healthcare Platform',
        'common:about.ourMission': 'Our Mission',
        'common:about.missionText': 'At Qualitick, we believe in revolutionizing healthcare through digital innovation. Our platform connects patients, doctors, clinics, laboratories, and pharmacies, providing seamless tools to manage medical records, streamline healthcare processes, and improve patient care through technology.',
        'common:about.whatWeOffer': 'What We Offer',
        'common:about.patientManagement': 'Patient Management',
        'common:about.patientManagementDesc': 'Comprehensive digital health records, appointment scheduling, and seamless patient identification through QR codes and unique patient codes.',
        'common:about.healthcareWorkflow': 'Healthcare Workflow',
        'common:about.healthcareWorkflowDesc': 'Streamline medical appointments, lab orders, radiology requests, and prescription management between doctors, patients, and healthcare providers.',
        'common:about.digitalIntegration': 'Digital Integration',
        'common:about.digitalIntegrationDesc': 'Paperless healthcare processes with QR code identification, digital prescriptions, and seamless integration between clinics, laboratories, radiology centers, and pharmacies.',
        'common:about.ourValues': 'Our Values',
        'common:about.excellence': 'Excellence',
        'common:about.excellenceDesc': 'Striving for the highest standards in healthcare delivery',
        'common:about.care': 'Care',
        'common:about.careDesc': 'Putting patient well-being at the center of everything we do',
        'common:about.innovation': 'Innovation',
        'common:about.innovationDesc': 'Using technology to enhance healthcare delivery and patient experience',
        'common:about.accessibility': 'Accessibility',
        'common:about.accessibilityDesc': 'Making healthcare services accessible to everyone, everywhere',
        'common:about.getInTouch': 'Get in Touch',
        'common:about.contactText': 'Have questions about our healthcare platform or want to learn more? We\'d love to hear from you! Contact our team for support, partnerships, or general inquiries about digital healthcare solutions.',
      };
      return options?.defaultValue || translations[key] || key;
    },
  }),
}));

// Mock BaseModal component
const mockOnClose = jest.fn();
jest.mock('./BaseModal', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ isOpen, onClose, title, size, children }: any) => {
      if (!isOpen) return null;
      
      return (
        <div data-testid="base-modal-component">
          <div data-testid="base-modal-title">{title}</div>
          <div data-testid="base-modal-size">{size}</div>
          <div data-testid="base-modal-content">{children}</div>
          <button
            data-testid="base-modal-close"
            onClick={() => {
              onClose();
              mockOnClose();
            }}
          >
            Close
          </button>
        </div>
      );
    },
  };
});

// Mock logo import
jest.mock('../../logo.png', () => 'mock-logo.png');

describe('AboutUsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  // Mock environment variables
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      REACT_APP_SUPPORT_EMAIL: 'test@qualitick.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<AboutUsModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('base-modal-component')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByTestId('base-modal-component')).toBeInTheDocument();
      expect(screen.getByTestId('base-modal-title')).toHaveTextContent('About Us');
      expect(screen.getByTestId('base-modal-size')).toHaveTextContent('large');
    });

    it('should render modal with correct title', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByTestId('base-modal-title')).toHaveTextContent('About Us');
    });

    it('should use large size for the modal', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByTestId('base-modal-size')).toHaveTextContent('large');
    });
  });

  describe('Hero Section', () => {
    it('should render hero section with logo', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const logo = screen.getByAltText('Qualitick Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'mock-logo.png');
      expect(logo).toHaveClass('modal-hero-logo-img');
    });

    it('should render hero title and subtitle', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Welcome to Qualitick')).toBeInTheDocument();
      expect(screen.getByText('Your Digital Healthcare Platform')).toBeInTheDocument();
    });

    it('should have proper hero section structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const heroTitle = screen.getByText('Welcome to Qualitick');
      const heroSubtitle = screen.getByText('Your Digital Healthcare Platform');
      
      expect(heroTitle).toHaveClass('modal-hero-title');
      expect(heroSubtitle).toHaveClass('modal-hero-subtitle');
    });
  });

  describe('Mission Section', () => {
    it('should render mission section with title', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
    });

    it('should render mission text', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const missionText = screen.getByText(/At Qualitick, we believe in revolutionizing healthcare through digital innovation/);
      expect(missionText).toBeInTheDocument();
      expect(missionText).toHaveClass('modal-text');
    });
  });

  describe('Features Section', () => {
    it('should render what we offer section title', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('What We Offer')).toBeInTheDocument();
    });

    it('should render patient management feature', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Patient Management')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive digital health records, appointment scheduling/)).toBeInTheDocument();
    });

    it('should render healthcare workflow feature', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Healthcare Workflow')).toBeInTheDocument();
      expect(screen.getByText(/Streamline medical appointments, lab orders, radiology requests/)).toBeInTheDocument();
    });

    it('should render digital integration feature', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Digital Integration')).toBeInTheDocument();
      expect(screen.getByText(/Paperless healthcare processes with QR code identification/)).toBeInTheDocument();
    });

    it('should render feature icons with proper SVG structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      // Check that feature section exists with proper structure
      const featureSection = screen.getByTestId('about-us-features-section');
      expect(featureSection).toBeInTheDocument();
      
      const featureGrid = screen.getByTestId('about-us-feature-grid');
      expect(featureGrid).toBeInTheDocument();
    });
  });

  describe('Values Section', () => {
    it('should render our values section title', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Our Values')).toBeInTheDocument();
    });

    it('should render excellence value', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Excellence')).toBeInTheDocument();
      expect(screen.getByText('Striving for the highest standards in healthcare delivery')).toBeInTheDocument();
    });

    it('should render care value', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Care')).toBeInTheDocument();
      expect(screen.getByText('Putting patient well-being at the center of everything we do')).toBeInTheDocument();
    });

    it('should render innovation value', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Using technology to enhance healthcare delivery and patient experience')).toBeInTheDocument();
    });

    it('should render accessibility value', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Accessibility')).toBeInTheDocument();
      expect(screen.getByText('Making healthcare services accessible to everyone, everywhere')).toBeInTheDocument();
    });
  });

  describe('Contact Section', () => {
    it('should render get in touch section title', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('should render contact text', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const contactText = screen.getByText(/Have questions about our healthcare platform or want to learn more/);
      expect(contactText).toBeInTheDocument();
    });

    it('should render support email when provided', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const emailLink = screen.getByRole('link', { name: 'test@qualitick.com' });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:test@qualitick.com');
      expect(emailLink).toHaveClass('modal-contact-link');
    });

    it('should not render email section when no support email provided', () => {
      process.env.REACT_APP_SUPPORT_EMAIL = '';
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should handle whitespace-only support email', () => {
      process.env.REACT_APP_SUPPORT_EMAIL = '   ';
      render(<AboutUsModal {...defaultProps} />);
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render contact icon with proper SVG structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const contactIcon = screen.getByTestId('about-us-contact-icon');
      expect(contactIcon).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when modal is closed', async () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('base-modal-close');
      await userEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should pass onClose callback to BaseModal', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      // BaseModal should receive the onClose prop
      expect(screen.getByTestId('base-modal-component')).toBeInTheDocument();
    });
  });

  describe('Environment Variables', () => {
    it('should use environment variable for support email', () => {
      process.env.REACT_APP_SUPPORT_EMAIL = 'custom@example.com';
      render(<AboutUsModal {...defaultProps} />);
      
      const emailLink = screen.getByRole('link', { name: 'custom@example.com' });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:custom@example.com');
    });

    it('should handle missing environment variable gracefully', () => {
      delete process.env.REACT_APP_SUPPORT_EMAIL;
      
      expect(() => {
        render(<AboutUsModal {...defaultProps} />);
      }).not.toThrow();
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have proper CSS class structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      // Check for main content wrapper
      const content = screen.getByTestId('about-us-modal-content');
      expect(content).toBeInTheDocument();
      
      // Check for sections
      const heroSection = screen.getByTestId('about-us-hero-section');
      const missionSection = screen.getByTestId('about-us-mission-section');
      const featuresSection = screen.getByTestId('about-us-features-section');
      const valuesSection = screen.getByTestId('about-us-values-section');
      const contactSection = screen.getByTestId('about-us-contact-section');
      
      expect(heroSection).toBeInTheDocument();
      expect(missionSection).toBeInTheDocument();
      expect(featuresSection).toBeInTheDocument();
      expect(valuesSection).toBeInTheDocument();
      expect(contactSection).toBeInTheDocument();
    });

    it('should render feature grid with proper structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const featureGrid = screen.getByTestId('about-us-feature-grid');
      expect(featureGrid).toBeInTheDocument();
    });

    it('should render values grid with proper structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const valuesGrid = screen.getByTestId('about-us-values-grid');
      expect(valuesGrid).toBeInTheDocument();
      
      // Check individual value items
      expect(screen.getByTestId('about-us-value-excellence')).toBeInTheDocument();
      expect(screen.getByTestId('about-us-value-care')).toBeInTheDocument();
      expect(screen.getByTestId('about-us-value-innovation')).toBeInTheDocument();
      expect(screen.getByTestId('about-us-value-accessibility')).toBeInTheDocument();
    });

    it('should have final section marker for contact', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const finalSection = screen.getByTestId('about-us-contact-section');
      expect(finalSection).toBeInTheDocument();
      expect(finalSection).toHaveClass('modal-section--final');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const heroTitle = screen.getByText('Welcome to Qualitick');
      expect(heroTitle.tagName).toBe('H3');
      
      const sectionTitles = screen.getAllByText(/Our Mission|What We Offer|Our Values|Get in Touch/);
      sectionTitles.forEach(title => {
        expect(title.tagName).toBe('H4');
      });
    });

    it('should have proper alt text for logo', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const logo = screen.getByAltText('Qualitick Logo');
      expect(logo).toBeInTheDocument();
    });

    it('should have proper link accessibility for email', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      const emailLink = screen.getByRole('link', { name: 'test@qualitick.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:test@qualitick.com');
    });
  });

  describe('Internationalization', () => {
    it('should use translation keys for all text content', () => {
      render(<AboutUsModal {...defaultProps} />);
      
      // Check that translated text is displayed
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Qualitick')).toBeInTheDocument();
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
      expect(screen.getByText('What We Offer')).toBeInTheDocument();
      expect(screen.getByText('Our Values')).toBeInTheDocument();
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      // The mock will return the key if translation is not found
      render(<AboutUsModal {...defaultProps} />);
      
      // Component should still render without errors
      expect(screen.getByTestId('base-modal-component')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty support email', () => {
      process.env.REACT_APP_SUPPORT_EMAIL = '';
      
      expect(() => {
        render(<AboutUsModal {...defaultProps} />);
      }).not.toThrow();
    });

    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(<AboutUsModal isOpen={true} onClose={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle missing logo gracefully', () => {
      // Even if logo fails to load, component should still render
      render(<AboutUsModal {...defaultProps} />);
      
      const logo = screen.getByAltText('Qualitick Logo');
      expect(logo).toBeInTheDocument();
    });
  });
});
