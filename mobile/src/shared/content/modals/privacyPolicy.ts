/**
 * Privacy Policy Content
 * 
 * Versioned content for privacy policy modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getPrivacyPolicyContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'privacy-policy',
    title: translate('privacyPolicy:title', { defaultValue: 'Privacy Policy' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      introduction: {
        title: translate('privacyPolicy:sections.introduction.title', { defaultValue: 'Introduction' }),
        text: translate('privacyPolicy:sections.introduction.content', { 
          defaultValue: 'We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and protect your information when you use our services.' 
        })
      },
      informationWeCollect: {
        title: translate('privacyPolicy:sections.dataCollection.title', { defaultValue: 'Information We Collect' }),
        personalInfo: {
          title: translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.title', { defaultValue: 'Personal Information' }),
          text: translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.content', { 
            defaultValue: 'We collect information that you provide to us directly, including:' 
          }),
          items: [
            translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.items.0', { 
              defaultValue: 'Name, email address, and contact information' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.items.1', { 
              defaultValue: 'Medical professional information' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.items.2', { 
              defaultValue: 'Account authentication data' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.items.3', { 
              defaultValue: 'User preferences and settings' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.personalInfo.items.4', { 
              defaultValue: 'Communications you send to us' 
            })
          ]
        },
        automaticInfo: {
          title: translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.title', { defaultValue: 'Technical Information' }),
          text: translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.content', { 
            defaultValue: 'We automatically collect certain technical information:' 
          }),
          items: [
            translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.items.0', { 
              defaultValue: 'IP addresses and geolocation data' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.items.1', { 
              defaultValue: 'Browser type and version' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.items.2', { 
              defaultValue: 'Device information' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.items.3', { 
              defaultValue: 'Usage and activity data' 
            }),
            translate('privacyPolicy:sections.dataCollection.subsections.technicalInfo.items.4', { 
              defaultValue: 'Logs and performance metrics' 
            })
          ]
        }
      },
      howWeUse: {
        title: translate('privacyPolicy:sections.dataUsage.title', { defaultValue: 'Data Usage' }),
        text: translate('privacyPolicy:sections.dataUsage.content', { defaultValue: 'We use your information to:' }),
        items: [
          translate('privacyPolicy:sections.dataUsage.items.0', { 
            defaultValue: 'Provide and maintain our healthcare services' 
          }),
          translate('privacyPolicy:sections.dataUsage.items.1', { 
            defaultValue: 'Process transactions and manage accounts' 
          }),
          translate('privacyPolicy:sections.dataUsage.items.2', { 
            defaultValue: 'Improve and personalize user experience' 
          }),
          translate('privacyPolicy:sections.dataUsage.items.3', { 
            defaultValue: 'Communicate with you about our services' 
          }),
          translate('privacyPolicy:sections.dataUsage.items.4', { 
            defaultValue: 'Ensure security and prevent fraud' 
          }),
          translate('privacyPolicy:sections.dataUsage.items.5', { 
            defaultValue: 'Comply with legal and regulatory requirements' 
          }),
          translate('privacyPolicy:sections.dataUsage.items.6', { 
            defaultValue: 'Conduct analytics and research for service improvement' 
          })
        ]
      },
      informationSharing: {
        title: translate('privacyPolicy:sections.dataSharing.title', { defaultValue: 'Information Sharing' }),
        text: translate('privacyPolicy:sections.dataSharing.content', { 
          defaultValue: 'We never sell your personal data. We may share your information in limited circumstances:' 
        }),
        items: [
          translate('privacyPolicy:sections.dataSharing.subsections.healthcare.content', { 
            defaultValue: 'With your explicit consent, we may share your medical information with authorized healthcare professionals to facilitate your care.' 
          }),
          translate('privacyPolicy:sections.dataSharing.subsections.service.content', { 
            defaultValue: 'We share data with trusted third-party service providers who help us operate our services, under strict confidentiality obligations.' 
          }),
          translate('privacyPolicy:sections.dataSharing.subsections.legal.content', { 
            defaultValue: 'We may disclose information when required by law, court order, or to protect our rights and safety.' 
          })
        ]
      },
      dataSecurity: {
        title: translate('privacyPolicy:sections.dataSecurity.title', { defaultValue: 'Data Security' }),
        text: translate('privacyPolicy:sections.dataSecurity.content', { 
          defaultValue: 'We implement robust security measures:' 
        }),
        items: [
          translate('privacyPolicy:sections.dataSecurity.items.0', { 
            defaultValue: 'Data encryption in transit and at rest' 
          }),
          translate('privacyPolicy:sections.dataSecurity.items.1', { 
            defaultValue: 'Strict access controls and authentication' 
          }),
          translate('privacyPolicy:sections.dataSecurity.items.2', { 
            defaultValue: 'Regular security monitoring and auditing' 
          }),
          translate('privacyPolicy:sections.dataSecurity.items.3', { 
            defaultValue: 'HIPAA compliance and other regulations' 
          }),
          translate('privacyPolicy:sections.dataSecurity.items.4', { 
            defaultValue: 'Regular staff security training' 
          }),
          translate('privacyPolicy:sections.dataSecurity.items.5', { 
            defaultValue: 'Incident response and recovery plans' 
          })
        ]
      },
      yourRights: {
        title: translate('privacyPolicy:sections.userRights.title', { defaultValue: 'Your Rights' }),
        text: translate('privacyPolicy:sections.userRights.content', { 
          defaultValue: 'You have the following rights regarding your personal data:' 
        }),
        items: [
          translate('privacyPolicy:sections.userRights.items.0', { 
            defaultValue: 'Access: Request copies of your personal data' 
          }),
          translate('privacyPolicy:sections.userRights.items.1', { 
            defaultValue: 'Rectification: Correct inaccurate or incomplete data' 
          }),
          translate('privacyPolicy:sections.userRights.items.2', { 
            defaultValue: 'Erasure: Request deletion of your personal data' 
          }),
          translate('privacyPolicy:sections.userRights.items.3', { 
            defaultValue: 'Restriction: Restrict processing of your data' 
          }),
          translate('privacyPolicy:sections.userRights.items.4', { 
            defaultValue: 'Portability: Receive your data in a structured format' 
          }),
          translate('privacyPolicy:sections.userRights.items.5', { 
            defaultValue: 'Objection: Object to processing of your data' 
          }),
          translate('privacyPolicy:sections.userRights.items.6', { 
            defaultValue: 'Withdraw consent: Withdraw your consent at any time' 
          })
        ]
      },
      cookies: {
        title: translate('privacyPolicy:sections.cookies.title', { 
          defaultValue: 'Cookies and Tracking Technologies' 
        }),
        text: translate('privacyPolicy:sections.cookies.content', { 
          defaultValue: 'We use cookies and similar technologies to:' 
        }),
        items: [
          translate('privacyPolicy:sections.cookies.items.0', { 
            defaultValue: 'Remember your preferences and settings' 
          }),
          translate('privacyPolicy:sections.cookies.items.1', { 
            defaultValue: 'Analyze website usage trends' 
          }),
          translate('privacyPolicy:sections.cookies.items.2', { 
            defaultValue: 'Administer the site and analyze interactions' 
          }),
          translate('privacyPolicy:sections.cookies.items.3', { 
            defaultValue: 'Gather demographic information' 
          }),
          translate('privacyPolicy:sections.cookies.items.4', { 
            defaultValue: 'Improve our services and user experience' 
          })
        ],
        note: translate('privacyPolicy:sections.cookies.note', { 
          defaultValue: 'You can control cookies through your browser settings.' 
        })
      },
      international: {
        title: translate('privacyPolicy:sections.international.title', { defaultValue: 'International Transfers' }),
        text: translate('privacyPolicy:sections.international.content', { 
          defaultValue: 'Your data may be transferred and stored in countries other than your own. We ensure such transfers comply with applicable data protection laws and include appropriate safeguards.' 
        })
      },
      changes: {
        title: translate('privacyPolicy:sections.updates.title', { defaultValue: 'Policy Updates' }),
        text: translate('privacyPolicy:sections.updates.content', { 
          defaultValue: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the \'last updated\' date.' 
        })
      },
      contact: {
        title: translate('privacyPolicy:sections.contact.title', { defaultValue: 'Contact Us' }),
        text: translate('privacyPolicy:sections.contact.content', { 
          defaultValue: 'If you have questions about this privacy policy or our data practices, please contact us:' 
        }),
        email: translate('privacyPolicy:sections.contact.contactInfo.email', { 
          defaultValue: 'privacy@qualitick.com' 
        }),
        address: translate('privacyPolicy:sections.contact.contactInfo.address', { 
          defaultValue: '123 Healthcare Street, Suite 456, City, Country 12345' 
        })
      },
      footer: {
        effectiveDate: translate('privacyPolicy:effectiveDate', { 
          defaultValue: 'Effective Date: January 1, 2024' 
        }),
        lastUpdated: translate('privacyPolicy:lastUpdated', { 
          defaultValue: 'Last Updated: January 1, 2024' 
        })
      }
    }
  };
};

// For backward compatibility
export const privacyPolicyContent: Record<string, ModalContent> = {
  'v1.0.0': getPrivacyPolicyContent('v1.0.0')
};