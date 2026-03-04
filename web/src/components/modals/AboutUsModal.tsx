/**
 * AboutUsModal Component
 * 
 * Modal displaying information about the Qualitick platform
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseModal from './BaseModal';
import qualitickLogo from '../../logo.png';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  // Get support email from environment variables
  const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('common:footer.about', { defaultValue: 'About Us' })}
      size="large"
    >
      <div className="about-us-modal-content" data-testid="about-us-modal-content">
        {/* Hero Section */}
        <div className="modal-section" data-testid="about-us-hero-section">
          <div className="modal-hero">
            <div className="modal-hero-logo">
              <img 
                src={qualitickLogo} 
                alt="Qualitick Logo" 
                className="modal-hero-logo-img"
                data-testid="about-us-logo"
              />
            </div>
            <h3 className="modal-hero-title">
              {t('common:app.welcome', { defaultValue: 'Welcome to Qualitick' })}
            </h3>
            <p className="modal-hero-subtitle">
              {t('common:app.tagline', { defaultValue: 'Your Digital Healthcare Platform' })}
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="modal-section" data-testid="about-us-mission-section">
          <h4 className="modal-section-title">
            {t('common:about.ourMission', { defaultValue: 'Our Mission' })}
          </h4>
          <p className="modal-text">
            {t('common:about.missionText', { 
              defaultValue: 'At Qualitick, we believe in revolutionizing healthcare through digital innovation. Our platform connects patients, doctors, clinics, laboratories, and pharmacies, providing seamless tools to manage medical records, streamline healthcare processes, and improve patient care through technology.' 
            })}
          </p>
        </div>

        {/* Features Section */}
        <div className="modal-section" data-testid="about-us-features-section">
          <h4 className="modal-section-title">
            {t('common:about.whatWeOffer', { defaultValue: 'What We Offer' })}
          </h4>
          <div className="modal-feature-grid" data-testid="about-us-feature-grid">
            <div className="modal-feature-item">
              <div className="modal-feature-icon">
                <svg viewBox="0 0 24 24" className="modal-feature-svg">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h5 className="modal-feature-title">
                  {t('common:about.patientManagement', { defaultValue: 'Patient Management' })}
                </h5>
                <p className="modal-feature-text">
                  {t('common:about.patientManagementDesc', { 
                    defaultValue: 'Comprehensive digital health records, appointment scheduling, and seamless patient identification through QR codes and unique patient codes.' 
                  })}
                </p>
              </div>
            </div>

            <div className="modal-feature-item">
              <div className="modal-feature-icon">
                <svg viewBox="0 0 24 24" className="modal-feature-svg">
                  <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M7,10V12H9V10H7M15,10V12H17V10H15M11,14V16H13V14H11M15,14V16H17V14H15" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h5 className="modal-feature-title">
                  {t('common:about.healthcareWorkflow', { defaultValue: 'Healthcare Workflow' })}
                </h5>
                <p className="modal-feature-text">
                  {t('common:about.healthcareWorkflowDesc', { 
                    defaultValue: 'Streamline medical appointments, lab orders, radiology requests, and prescription management between doctors, patients, and healthcare providers.' 
                  })}
                </p>
              </div>
            </div>

            <div className="modal-feature-item">
              <div className="modal-feature-icon">
                <svg viewBox="0 0 24 24" className="modal-feature-svg">
                  <path d="M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6M20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H8V4H20V16M12,5.5V9.5L16,7.5L12,5.5Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h5 className="modal-feature-title">
                  {t('common:about.digitalIntegration', { defaultValue: 'Digital Integration' })}
                </h5>
                <p className="modal-feature-text">
                  {t('common:about.digitalIntegrationDesc', { 
                    defaultValue: 'Paperless healthcare processes with QR code identification, digital prescriptions, and seamless integration between clinics, laboratories, radiology centers, and pharmacies.' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="modal-section" data-testid="about-us-values-section">
          <h4 className="modal-section-title">
            {t('common:about.ourValues', { defaultValue: 'Our Values' })}
          </h4>
          <div className="modal-values-grid" data-testid="about-us-values-grid">
            <div className="modal-value-item" data-testid="about-us-value-excellence">
              <strong>{t('common:about.excellence', { defaultValue: 'Excellence' })}</strong>
              <span>{t('common:about.excellenceDesc', { defaultValue: 'Striving for the highest standards in healthcare delivery' })}</span>
            </div>
            <div className="modal-value-item" data-testid="about-us-value-care">
              <strong>{t('common:about.care', { defaultValue: 'Care' })}</strong>
              <span>{t('common:about.careDesc', { defaultValue: 'Putting patient well-being at the center of everything we do' })}</span>
            </div>
            <div className="modal-value-item" data-testid="about-us-value-innovation">
              <strong>{t('common:about.innovation', { defaultValue: 'Innovation' })}</strong>
              <span>{t('common:about.innovationDesc', { defaultValue: 'Using technology to enhance healthcare delivery and patient experience' })}</span>
            </div>
            <div className="modal-value-item" data-testid="about-us-value-accessibility">
              <strong>{t('common:about.accessibility', { defaultValue: 'Accessibility' })}</strong>
              <span>{t('common:about.accessibilityDesc', { defaultValue: 'Making healthcare services accessible to everyone, everywhere' })}</span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="modal-section modal-section--final" data-testid="about-us-contact-section">
          <h4 className="modal-section-title">
            {t('common:about.getInTouch', { defaultValue: 'Get in Touch' })}
          </h4>
          <p className="modal-text">
            {t('common:about.contactText', { 
              defaultValue: 'Have questions about our healthcare platform or want to learn more? We\'d love to hear from you! Contact our team for support, partnerships, or general inquiries about digital healthcare solutions.' 
            })}
          </p>
          {supportEmail && supportEmail.trim() !== '' && (
            <div className="modal-contact-info" data-testid="about-us-contact-info">
              <div className="modal-contact-item">
                <svg viewBox="0 0 24 24" className="modal-contact-icon" data-testid="about-us-contact-icon">
                  <path d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,8L12,13L4,8V6L12,11L20,6V8Z" fill="currentColor"/>
                </svg>
                <a 
                  href={`mailto:${supportEmail}`}
                  className="modal-contact-link"
                  data-testid="about-us-support-email"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default AboutUsModal;
