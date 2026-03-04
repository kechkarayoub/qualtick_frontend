/**
 * Features Content
 * 
 * Versioned content for features modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getFeaturesContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'features',
    title: translate('features:title', { defaultValue: 'Features' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      hero: {
        title: translate('features:hero.title', { defaultValue: 'Powerful Features for Healthcare Platforms' }),
        subtitle: translate('features:hero.subtitle', { 
          defaultValue: 'Everything you need to manage, organize, and deliver healthcare services' 
        })
      },
      coreFeatures: {
        title: translate('features:coreFeatures.title', { defaultValue: 'Core Features' }),
        items: [
          {
            title: translate('features:coreFeatures.items.patientManagement.title', { defaultValue: 'Patient Management' }),
            description: translate('features:coreFeatures.items.patientManagement.description', { 
              defaultValue: 'Manage patient records, track medical histories, monitor health statistics, and organize healthcare activities with ease.' 
            }),
            icon: 'team-management'
          },
          {
            title: translate('features:coreFeatures.items.appointmentScheduling.title', { defaultValue: 'Appointment Scheduling' }),
            description: translate('features:coreFeatures.items.appointmentScheduling.description', { 
              defaultValue: 'Schedule patient appointments, medical consultations, and follow-up sessions. Send automated reminders and manage healthcare logistics seamlessly.' 
            }),
            icon: 'calendar'
          },
          {
            title: translate('features:coreFeatures.items.realtimeCommunication.title', { defaultValue: 'Real-time Communication' }),
            description: translate('features:coreFeatures.items.realtimeCommunication.description', { 
              defaultValue: 'Stay connected with secure messaging, patient notifications, and healthcare team communication. Never miss important medical updates.' 
            }),
            icon: 'chat'
          },
          {
            title: translate('features:coreFeatures.items.performanceAnalytics.title', { defaultValue: 'Performance Analytics' }),
            description: translate('features:coreFeatures.items.performanceAnalytics.description', { 
              defaultValue: 'Track detailed health statistics, analyze patient trends, and generate comprehensive reports for healthcare providers and patients.' 
            }),
            icon: 'analytics'
          },
          {
            title: translate('features:coreFeatures.items.treatmentManagement.title', { defaultValue: 'Treatment Management' }),
            description: translate('features:coreFeatures.items.treatmentManagement.description', { 
              defaultValue: 'Create and manage treatment plans with progress tracking, medication monitoring, and automated scheduling.' 
            }),
            icon: 'documents'
          },
          {
            title: translate('features:coreFeatures.items.mobileApplication.title', { defaultValue: 'Mobile Application' }),
            description: translate('features:coreFeatures.items.mobileApplication.description', { 
              defaultValue: 'Access all features on the go with our native mobile apps for iOS and Android devices.' 
            }),
            icon: 'mobile'
          }
        ]
      },
      advancedFeatures: {
        title: translate('features:advancedFeatures.title', { defaultValue: 'Advanced Features' }),
        items: [
          {
            title: translate('features:advancedFeatures.items.realtimeMonitoring.title', { defaultValue: 'Real-time Health Monitoring' }),
            description: translate('features:advancedFeatures.items.realtimeMonitoring.description', { 
              defaultValue: 'Real-time vital signs monitoring, live health updates, and instant medical alert notifications.' 
            }),
            icon: 'clock'
          },
          {
            title: translate('features:advancedFeatures.items.thirdPartyIntegrations.title', { defaultValue: 'Third-party Integrations' }),
            description: translate('features:advancedFeatures.items.thirdPartyIntegrations.description', { 
              defaultValue: 'Connect with popular health devices, medical systems, and healthcare platforms for seamless data integration.' 
            }),
            icon: 'integration'
          },
          {
            title: translate('features:advancedFeatures.items.advancedSecurity.title', { defaultValue: 'Advanced Security' }),
            description: translate('features:advancedFeatures.items.advancedSecurity.description', { 
              defaultValue: 'Enterprise-grade security with data encryption, secure authentication, and privacy controls.' 
            }),
            icon: 'security'
          }
        ]
      },
      callToAction: {
        title: translate('features:callToAction.title', { defaultValue: 'Ready to Get Started?' }),
        description: translate('features:callToAction.description', { 
          defaultValue: 'Join thousands of healthcare facilities already using Qualitick to manage their patients and medical services.' 
        })
      }
    }
  };
};

// For backward compatibility
export const featuresContent: Record<string, ModalContent> = {
  'v1.0.0': getFeaturesContent('v1.0.0')
};