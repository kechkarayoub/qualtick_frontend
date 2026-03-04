/**
 * Cookies Policy Content
 * 
 * Versioned content for cookies policy modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getCookiesPolicyContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'cookies-policy',
    title: translate('cookiesPolicy:title', { defaultValue: 'Cookies Policy' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      introduction: {
        title: translate('cookiesPolicy:introduction.title', { defaultValue: 'What Are Cookies?' }),
        text: translate('cookiesPolicy:introduction.text', { 
          defaultValue: 'This Cookies Policy explains how {companyName} uses cookies and similar tracking technologies when you visit our healthcare platform. We use cookies to enhance your experience, analyze usage patterns, and provide personalized healthcare content and services.' 
        })
      },
      whatAreCookies: {
        title: translate('cookiesPolicy:whatAreCookies.title', { defaultValue: 'Understanding Cookies' }),
        text: translate('cookiesPolicy:whatAreCookies.text', { 
          defaultValue: 'Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferred settings and login status, which can make your next visit easier and the site more useful to you.' 
        })
      },
      typesOfCookies: {
        title: translate('cookiesPolicy:typesOfCookies.title', { defaultValue: 'Types of Cookies We Use' }),
        essential: {
          title: translate('cookiesPolicy:typesOfCookies.essential.title', { defaultValue: 'Essential Cookies' }),
          text: translate('cookiesPolicy:typesOfCookies.essential.text', { 
            defaultValue: 'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.' 
          }),
          items: [
            translate('cookiesPolicy:typesOfCookies.essential.items.0', { 
              defaultValue: 'User authentication and session management' 
            }),
            translate('cookiesPolicy:typesOfCookies.essential.items.1', { 
              defaultValue: 'Security and fraud prevention' 
            }),
            translate('cookiesPolicy:typesOfCookies.essential.items.2', { 
              defaultValue: 'Basic website functionality and navigation' 
            }),
            translate('cookiesPolicy:typesOfCookies.essential.items.3', { 
              defaultValue: 'Your consent preferences for cookies' 
            })
          ]
        },
        performance: {
          title: translate('cookiesPolicy:typesOfCookies.performance.title', { defaultValue: 'Performance Cookies' }),
          text: translate('cookiesPolicy:typesOfCookies.performance.text', { 
            defaultValue: 'These cookies collect information about how you use our website, helping us understand and improve performance.' 
          }),
          items: [
            translate('cookiesPolicy:typesOfCookies.performance.items.0', { 
              defaultValue: 'Website analytics and usage statistics' 
            }),
            translate('cookiesPolicy:typesOfCookies.performance.items.1', { 
              defaultValue: 'Error tracking and performance monitoring' 
            }),
            translate('cookiesPolicy:typesOfCookies.performance.items.2', { 
              defaultValue: 'Website optimization and A/B testing' 
            }),
            translate('cookiesPolicy:typesOfCookies.performance.items.3', { 
              defaultValue: 'Loading speed and performance metrics' 
            })
          ]
        },
        functional: {
          title: translate('cookiesPolicy:typesOfCookies.functional.title', { defaultValue: 'Functional Cookies' }),
          text: translate('cookiesPolicy:typesOfCookies.functional.text', { 
            defaultValue: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.' 
          }),
          items: [
            translate('cookiesPolicy:typesOfCookies.functional.items.0', { 
              defaultValue: 'Language and region preferences' 
            }),
            translate('cookiesPolicy:typesOfCookies.functional.items.1', { 
              defaultValue: 'User interface settings and customizations' 
            }),
            translate('cookiesPolicy:typesOfCookies.functional.items.2', { 
              defaultValue: 'Personalized content and recommendations' 
            }),
            translate('cookiesPolicy:typesOfCookies.functional.items.3', { 
              defaultValue: 'Form data and user inputs' 
            })
          ]
        },
        targeting: {
          title: translate('cookiesPolicy:typesOfCookies.targeting.title', { defaultValue: 'Targeting Cookies' }),
          text: translate('cookiesPolicy:typesOfCookies.targeting.text', { 
            defaultValue: 'These cookies are used to deliver relevant advertisements and marketing content based on your interests and behavior.' 
          }),
          items: [
            translate('cookiesPolicy:typesOfCookies.targeting.items.0', { 
              defaultValue: 'Targeted advertising and marketing campaigns' 
            }),
            translate('cookiesPolicy:typesOfCookies.targeting.items.1', { 
              defaultValue: 'Social media integration and sharing' 
            }),
            translate('cookiesPolicy:typesOfCookies.targeting.items.2', { 
              defaultValue: 'Cross-site tracking and behavior analysis' 
            }),
            translate('cookiesPolicy:typesOfCookies.targeting.items.3', { 
              defaultValue: 'Retargeting and remarketing campaigns' 
            })
          ]
        }
      },
      managing: {
        title: translate('cookiesPolicy:managing.title', { defaultValue: 'Managing Your Cookie Preferences' }),
        text: translate('cookiesPolicy:managing.text', { 
          defaultValue: 'You have several options for managing cookies on our website:' 
        }),
        consent: {
          title: translate('cookiesPolicy:managing.consent.title', { defaultValue: 'Cookie Consent Banner' }),
          text: translate('cookiesPolicy:managing.consent.text', { 
            defaultValue: 'When you first visit our website, you will see a cookie consent banner where you can choose which types of cookies to accept or reject.' 
          })
        },
        browser: {
          title: translate('cookiesPolicy:managing.browser.title', { defaultValue: 'Browser Settings' }),
          text: translate('cookiesPolicy:managing.browser.text', { 
            defaultValue: 'You can control and delete cookies through your browser settings. Most browsers allow you to:' 
          }),
          items: [
            translate('cookiesPolicy:managing.browser.items.0', { 
              defaultValue: 'View and delete existing cookies' 
            }),
            translate('cookiesPolicy:managing.browser.items.1', { 
              defaultValue: 'Block cookies from specific websites' 
            }),
            translate('cookiesPolicy:managing.browser.items.2', { 
              defaultValue: 'Disable all cookies (may affect website functionality)' 
            }),
            translate('cookiesPolicy:managing.browser.items.3', { 
              defaultValue: 'Get notifications when cookies are set' 
            })
          ]
        }
      },
      impact: {
        title: translate('cookiesPolicy:impact.title', { defaultValue: 'Impact of Disabling Cookies' }),
        text: translate('cookiesPolicy:impact.text', { 
          defaultValue: 'Please note that disabling certain cookies may affect your experience on our website:' 
        }),
        items: [
          translate('cookiesPolicy:impact.items.0', { 
            defaultValue: 'Some features may not work properly or may be unavailable' 
          }),
          translate('cookiesPolicy:impact.items.1', { 
            defaultValue: 'Personalized content and recommendations may not be displayed' 
          }),
          translate('cookiesPolicy:impact.items.2', { 
            defaultValue: 'Your preferences and settings may not be remembered' 
          }),
          translate('cookiesPolicy:impact.items.3', { 
            defaultValue: 'We may not be able to improve our services based on usage patterns' 
          })
        ]
      },
      updates: {
        title: translate('cookiesPolicy:updates.title', { defaultValue: 'Updates to This Policy' }),
        text: translate('cookiesPolicy:updates.text', { 
          defaultValue: 'We may update this Cookies Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of any significant changes by updating the "Last updated" date at the top of this policy.' 
        })
      },
      contact: {
        title: translate('cookiesPolicy:contact.title', { defaultValue: 'Contact Us' }),
        text: translate('cookiesPolicy:contact.text', { 
          defaultValue: 'If you have any questions about our use of cookies or this Cookies Policy, please contact us:' 
        }),
        email: translate('cookiesPolicy:contact.email', { defaultValue: 'Email: {supportEmail}' })
      },
      footer: {
        text: translate('cookiesPolicy:footer.text', { 
          defaultValue: 'By continuing to use {companyName}, you acknowledge that you have read and understood this Cookies Policy and consent to our use of cookies as described herein.' 
        })
      }
    }
  };
};

// For backward compatibility
export const cookiesPolicyContent: Record<string, ModalContent> = {
  'v1.0.0': getCookiesPolicyContent('v1.0.0')
};