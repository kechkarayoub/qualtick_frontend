/**
 * Terms of Service Content
 * 
 * Versioned content for terms of service modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getTermsOfServiceContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'terms-of-service',
    title: translate('terms:title', { defaultValue: 'Terms of Service' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      introduction: {
        title: translate('terms:introduction.title', { defaultValue: 'Introduction' }),
        text: translate('terms:introduction.text', { 
          defaultValue: 'Welcome to {companyName}! These Terms of Service ("Terms") govern your use of our healthcare platform and services. By accessing or using our platform, you agree to be bound by these Terms.' 
        })
      },
      acceptance: {
        title: translate('terms:acceptance.title', { defaultValue: 'Acceptance of Terms' }),
        text: translate('terms:acceptance.text', { 
          defaultValue: 'By creating an account, accessing, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.' 
        })
      },
      eligibility: {
        title: translate('terms:eligibility.title', { defaultValue: 'Eligibility' }),
        text: translate('terms:eligibility.text', { defaultValue: 'To use our services, you must:' }),
        items: [
          translate('terms:eligibility.items.age', { 
            defaultValue: 'Be at least 13 years old (or the minimum age required in your jurisdiction)' 
          }),
          translate('terms:eligibility.items.capacity', { 
            defaultValue: 'Have the legal capacity to enter into this agreement' 
          }),
          translate('terms:eligibility.items.compliance', { 
            defaultValue: 'Comply with all applicable laws and regulations' 
          }),
          translate('terms:eligibility.items.accuracy', { 
            defaultValue: 'Provide accurate and complete information during registration' 
          })
        ]
      },
      accountRegistration: {
        title: translate('terms:accountRegistration.title', { defaultValue: 'Account Registration and Security' }),
        text: translate('terms:accountRegistration.text', { 
          defaultValue: 'When you create an account with us, you must provide information that is accurate, complete, and current. You are responsible for:' 
        }),
        items: [
          translate('terms:accountRegistration.items.security', { 
            defaultValue: 'Maintaining the security of your account and password' 
          }),
          translate('terms:accountRegistration.items.activities', { 
            defaultValue: 'All activities that occur under your account' 
          }),
          translate('terms:accountRegistration.items.notify', { 
            defaultValue: 'Immediately notifying us of any unauthorized use of your account' 
          }),
          translate('terms:accountRegistration.items.update', { 
            defaultValue: 'Keeping your account information accurate and up-to-date' 
          })
        ]
      },
      useOfServices: {
        title: translate('terms:useOfServices.title', { defaultValue: 'Use of Services' }),
        text: translate('terms:useOfServices.text', { 
          defaultValue: 'Our platform provides tools and services to help you connect with healthcare professionals, manage patient records, and participate in healthcare activities. You may use our services for lawful purposes only.' 
        }),
        permitted: {
          title: translate('terms:useOfServices.permitted.title', { defaultValue: 'Permitted Uses' }),
          items: [
            translate('terms:useOfServices.permitted.items.connect', { 
              defaultValue: 'Connect with healthcare providers and patients' 
            }),
            translate('terms:useOfServices.permitted.items.create', { 
              defaultValue: 'Create and manage patient records' 
            }),
            translate('terms:useOfServices.permitted.items.participate', { 
              defaultValue: 'Participate in healthcare activities and consultations' 
            }),
            translate('terms:useOfServices.permitted.items.share', { 
              defaultValue: 'Share healthcare-related content and medical information' 
            })
          ]
        },
        prohibited: {
          title: translate('terms:useOfServices.prohibited.title', { defaultValue: 'Prohibited Uses' }),
          items: [
            translate('terms:useOfServices.prohibited.items.illegal', { 
              defaultValue: 'Use the platform for any illegal or unauthorized purpose' 
            }),
            translate('terms:useOfServices.prohibited.items.harass', { 
              defaultValue: 'Harass, abuse, or harm other users' 
            }),
            translate('terms:useOfServices.prohibited.items.spam', { 
              defaultValue: 'Send spam, unsolicited communications, or engage in commercial activities' 
            }),
            translate('terms:useOfServices.prohibited.items.impersonate', { 
              defaultValue: 'Impersonate others or provide false information' 
            }),
            translate('terms:useOfServices.prohibited.items.violate', { 
              defaultValue: 'Violate any laws, regulations, or third-party rights' 
            }),
            translate('terms:useOfServices.prohibited.items.interfere', { 
              defaultValue: 'Interfere with or disrupt the platform or servers' 
            })
          ]
        }
      },
      userContent: {
        title: translate('terms:userContent.title', { defaultValue: 'User Content' }),
        text: translate('terms:userContent.text', { 
          defaultValue: 'You may submit, upload, or post content on our platform ("User Content"). You retain ownership of your User Content, but you grant us certain rights to use it.' 
        }),
        license: {
          title: translate('terms:userContent.license.title', { defaultValue: 'License to User Content' }),
          text: translate('terms:userContent.license.text', { 
            defaultValue: 'By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your content in connection with our services.' 
          })
        },
        responsibilities: {
          title: translate('terms:userContent.responsibilities.title', { defaultValue: 'Your Responsibilities' }),
          text: translate('terms:userContent.responsibilities.text', { 
            defaultValue: 'You are solely responsible for your User Content and must ensure that it:' 
          }),
          items: [
            translate('terms:userContent.responsibilities.items.legal', { 
              defaultValue: 'Does not violate any laws or regulations' 
            }),
            translate('terms:userContent.responsibilities.items.rights', { 
              defaultValue: 'Does not infringe on third-party rights' 
            }),
            translate('terms:userContent.responsibilities.items.appropriate', { 
              defaultValue: 'Is appropriate and not offensive or harmful' 
            }),
            translate('terms:userContent.responsibilities.items.accurate', { 
              defaultValue: 'Is accurate and not misleading' 
            })
          ]
        }
      },
      privacy: {
        title: translate('terms:privacy.title', { defaultValue: 'Privacy and Data Protection' }),
        text: translate('terms:privacy.text', { 
          defaultValue: 'Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.' 
        })
      },
      intellectualProperty: {
        title: translate('terms:intellectualProperty.title', { defaultValue: 'Intellectual Property' }),
        text: translate('terms:intellectualProperty.text', { 
          defaultValue: 'The platform and its content, features, and functionality are owned by {companyName} and are protected by international copyright, trademark, and other intellectual property laws.' 
        })
      },
      payments: {
        title: translate('terms:payments.title', { defaultValue: 'Payments and Subscriptions' }),
        text: translate('terms:payments.text', { 
          defaultValue: 'Some features of our platform may require payment. By making a payment, you agree to our billing terms and policies.' 
        }),
        items: [
          translate('terms:payments.items.authorization', { 
            defaultValue: 'You authorize us to charge your payment method for applicable fees' 
          }),
          translate('terms:payments.items.accuracy', { 
            defaultValue: 'You are responsible for providing accurate payment information' 
          }),
          translate('terms:payments.items.cancellation', { 
            defaultValue: 'You may cancel your subscription at any time through your account settings' 
          }),
          translate('terms:payments.items.refunds', { 
            defaultValue: 'Refunds are subject to our refund policy' 
          })
        ]
      },
      disclaimers: {
        title: translate('terms:disclaimers.title', { defaultValue: 'Disclaimers' }),
        text: translate('terms:disclaimers.text', { 
          defaultValue: 'Our services are provided "as is" and "as available" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.' 
        })
      },
      limitation: {
        title: translate('terms:limitation.title', { defaultValue: 'Limitation of Liability' }),
        text: translate('terms:limitation.text', { 
          defaultValue: 'To the fullest extent permitted by law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.' 
        })
      },
      termination: {
        title: translate('terms:termination.title', { defaultValue: 'Termination' }),
        text: translate('terms:termination.text', { 
          defaultValue: 'We may terminate or suspend your account and access to our services at any time, with or without cause, and with or without notice. You may also terminate your account at any time.' 
        })
      },
      governingLaw: {
        title: translate('terms:governingLaw.title', { defaultValue: 'Governing Law' }),
        text: translate('terms:governingLaw.text', { 
          defaultValue: 'These Terms are governed by and construed in accordance with the laws of the jurisdiction where our company is incorporated, without regard to conflict of law principles.' 
        })
      },
      changes: {
        title: translate('terms:changes.title', { defaultValue: 'Changes to These Terms' }),
        text: translate('terms:changes.text', { 
          defaultValue: 'We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our platform and updating the "Last updated" date.' 
        })
      },
      contact: {
        title: translate('terms:contact.title', { defaultValue: 'Contact Us' }),
        text: translate('terms:contact.text', { 
          defaultValue: 'If you have any questions about these Terms of Service, please contact us:' 
        }),
        email: translate('terms:contact.email', { defaultValue: 'Email: {supportEmail}' }),
        address: translate('terms:contact.address', { defaultValue: 'Address: {companyAddress}' })
      },
      footer: {
        text: translate('terms:footer.text', { 
          defaultValue: 'By using {companyName}, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.' 
        })
      }
    }
  };
};

// For backward compatibility
export const termsOfServiceContent: Record<string, ModalContent> = {
  'v1.0.0': getTermsOfServiceContent('v1.0.0')
};