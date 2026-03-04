/**
 * Contact Content
 * 
 * Versioned content for contact modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getContactContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'contact',
    title: translate('contact:title', { defaultValue: 'Contact Us' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      hero: {
        title: translate('contact:hero.title', { defaultValue: 'Get in Touch' }),
        subtitle: translate('contact:hero.subtitle', { 
          defaultValue: 'Have questions or need support? We\'re here to help! Send us a message and we\'ll get back to you as soon as possible.' 
        })
      },
      contactInfo: {
        title: translate('contact:contactInfo.title', { defaultValue: 'Contact Information' }),
        items: [
          {
            type: 'email',
            title: translate('contact:contactInfo.items.email.title', { defaultValue: 'Email Support' }),
            value: translate('contact:contactInfo.items.email.value', { defaultValue: '{supportEmail}' }),
            description: translate('contact:contactInfo.items.email.description', { 
              defaultValue: 'Get help with your account, billing, or technical issues' 
            }),
            icon: 'email'
          },
          {
            type: 'response-time',
            title: translate('contact:contactInfo.items.responseTime.title', { defaultValue: 'Response Time' }),
            value: translate('contact:contactInfo.items.responseTime.value', { defaultValue: 'Within 24 hours' }),
            description: translate('contact:contactInfo.items.responseTime.description', { 
              defaultValue: 'We respond to all inquiries within one business day' 
            }),
            icon: 'clock'
          },
          {
            type: 'support',
            title: translate('contact:contactInfo.items.support.title', { defaultValue: 'Support Available' }),
            value: translate('contact:contactInfo.items.support.value', { defaultValue: 'Monday - Friday, 9AM - 6PM EST' }),
            description: translate('contact:contactInfo.items.support.description', { 
              defaultValue: 'Our support team is here to help during business hours' 
            }),
            icon: 'support'
          }
        ]
      },
      form: {
        title: translate('contact:form.title', { defaultValue: 'Send us a Message' }),
        fields: [
          {
            name: 'name',
            label: translate('contact:form.fields.name.label', { defaultValue: 'Full Name' }),
            placeholder: translate('contact:form.fields.name.placeholder', { defaultValue: 'Enter your full name' }),
            type: 'text',
            required: true
          },
          {
            name: 'email',
            label: translate('contact:form.fields.email.label', { defaultValue: 'Email Address' }),
            placeholder: translate('contact:form.fields.email.placeholder', { defaultValue: 'Enter your email address' }),
            type: 'email',
            required: true
          },
          {
            name: 'subject',
            label: translate('contact:form.fields.subject.label', { defaultValue: 'Subject' }),
            placeholder: translate('contact:form.fields.subject.placeholder', { defaultValue: 'Select a subject' }),
            type: 'select',
            required: true,
            options: [
              { 
                value: 'support', 
                label: translate('contact:form.fields.subject.options.support', { defaultValue: 'Technical Support' }) 
              },
              { 
                value: 'billing', 
                label: translate('contact:form.fields.subject.options.billing', { defaultValue: 'Billing & Account' }) 
              },
              { 
                value: 'feature', 
                label: translate('contact:form.fields.subject.options.feature', { defaultValue: 'Feature Request' }) 
              },
              { 
                value: 'partnership', 
                label: translate('contact:form.fields.subject.options.partnership', { defaultValue: 'Partnership' }) 
              },
              { 
                value: 'other', 
                label: translate('contact:form.fields.subject.options.other', { defaultValue: 'Other' }) 
              }
            ]
          },
          {
            name: 'message',
            label: translate('contact:form.fields.message.label', { defaultValue: 'Message' }),
            placeholder: translate('contact:form.fields.message.placeholder', { defaultValue: 'Tell us how we can help you...' }),
            type: 'textarea',
            required: true,
            minLength: 10
          }
        ],
        submitText: translate('contact:form.submitText', { defaultValue: 'Send Message' }),
        loadingText: translate('contact:form.loadingText', { defaultValue: 'Sending...' }),
        successTitle: translate('contact:form.successTitle', { defaultValue: 'Message Sent Successfully!' }),
        successMessage: translate('contact:form.successMessage', { 
          defaultValue: 'Thank you for contacting us. We\'ll get back to you within 24 hours.' 
        })
      }
    }
  };
};

// For backward compatibility
export const contactContent: Record<string, ModalContent> = {
  'v1.0.0': getContactContent('v1.0.0')
};