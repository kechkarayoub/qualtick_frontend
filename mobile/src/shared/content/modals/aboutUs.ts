/**
 * About Us Content
 * 
 * Versioned content for about us modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getAboutUsContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'about-us',
    title: translate('aboutUs:title', { defaultValue: 'About Us' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      hero: {
        title: translate('aboutUs:hero.title', { defaultValue: 'Welcome to Qualitick' }),
        subtitle: translate('aboutUs:hero.subtitle', { defaultValue: 'Your Digital Healthcare Platform' })
      },
      mission: {
        title: translate('aboutUs:mission.title', { defaultValue: 'Our Mission' }),
        text: translate('aboutUs:mission.text', { 
          defaultValue: 'At Qualitick, we believe in revolutionizing healthcare through digital innovation. Our platform connects patients, doctors, clinics, laboratories, and pharmacies, providing seamless tools to manage medical records, streamline healthcare processes, and improve patient care through technology.' 
        })
      },
      features: {
        title: translate('aboutUs:features.title', { defaultValue: 'What We Offer' }),
        items: [
          {
            title: translate('aboutUs:features.items.patientManagement.title', { defaultValue: 'Patient Management' }),
            description: translate('aboutUs:features.items.patientManagement.description', { 
              defaultValue: 'Comprehensive digital health records, appointment scheduling, and seamless patient identification through QR codes and unique patient codes.' 
            }),
            icon: 'user-management'
          },
          {
            title: translate('aboutUs:features.items.healthcareWorkflow.title', { defaultValue: 'Healthcare Workflow' }),
            description: translate('aboutUs:features.items.healthcareWorkflow.description', { 
              defaultValue: 'Streamline medical appointments, lab orders, radiology requests, and prescription management between doctors, patients, and healthcare providers.' 
            }),
            icon: 'workflow'
          },
          {
            title: translate('aboutUs:features.items.digitalIntegration.title', { defaultValue: 'Digital Integration' }),
            description: translate('aboutUs:features.items.digitalIntegration.description', { 
              defaultValue: 'Paperless healthcare processes with QR code identification, digital prescriptions, and seamless integration between clinics, laboratories, radiology centers, and pharmacies.' 
            }),
            icon: 'integration'
          }
        ]
      },
      values: {
        title: translate('aboutUs:values.title', { defaultValue: 'Our Values' }),
        items: [
          {
            title: translate('aboutUs:values.items.excellence.title', { defaultValue: 'Excellence' }),
            description: translate('aboutUs:values.items.excellence.description', { 
              defaultValue: 'Striving for the highest standards in healthcare delivery' 
            })
          },
          {
            title: translate('aboutUs:values.items.care.title', { defaultValue: 'Care' }),
            description: translate('aboutUs:values.items.care.description', { 
              defaultValue: 'Putting patient well-being at the center of everything we do' 
            })
          },
          {
            title: translate('aboutUs:values.items.innovation.title', { defaultValue: 'Innovation' }),
            description: translate('aboutUs:values.items.innovation.description', { 
              defaultValue: 'Using technology to enhance healthcare delivery and patient experience' 
            })
          },
          {
            title: translate('aboutUs:values.items.accessibility.title', { defaultValue: 'Accessibility' }),
            description: translate('aboutUs:values.items.accessibility.description', { 
              defaultValue: 'Making healthcare services accessible to everyone, everywhere' 
            })
          }
        ]
      },
      contact: {
        title: translate('aboutUs:contact.title', { defaultValue: 'Get in Touch' }),
        text: translate('aboutUs:contact.text', { 
          defaultValue: 'Have questions about our healthcare platform or want to learn more? We\'d love to hear from you! Contact our team for support, partnerships, or general inquiries about digital healthcare solutions.' 
        }),
        email: translate('aboutUs:contact.email', { defaultValue: '{supportEmail}' })
      }
    }
  };
};

// For backward compatibility
export const aboutUsContent: Record<string, ModalContent> = {
  'v1.0.0': getAboutUsContent('v1.0.0')
};