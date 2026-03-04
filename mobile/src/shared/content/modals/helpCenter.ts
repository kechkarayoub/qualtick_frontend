/**
 * Help Center Content
 * 
 * Versioned content for help center modal
 */

import { ModalContent } from '../types';

// Translation function type for compatibility
type TranslationFunction = (key: string, options?: { defaultValue?: string }) => string;

export const getHelpCenterContent = (version?: string, t?: TranslationFunction): ModalContent => {
  const latestVersion = 'v1.0.0';
  
  // Default translation function if none provided
  const translate = t || ((key: string, options?: { defaultValue?: string }) => options?.defaultValue || key);
  
  return {
    id: 'help-center',
    title: translate('helpCenter:title', { defaultValue: 'Help Center' }),
    version: latestVersion,
    lastUpdated: new Date('2024-01-01'),
    content: {
      hero: {
        title: translate('helpCenter:hero.title', { defaultValue: 'Help Center' }),
        subtitle: translate('helpCenter:hero.subtitle', { defaultValue: 'Search for help...' })
      },
      categories: [
        {
          id: 'all',
          name: translate('helpCenter:categories.all.name', { defaultValue: 'All Categories' }),
          description: translate('helpCenter:categories.all.description', { defaultValue: 'Browse all help topics' }),
          icon: 'all'
        },
        {
          id: 'account',
          name: translate('helpCenter:categories.account.name', { defaultValue: 'Account Settings' }),
          description: translate('helpCenter:categories.account.description', { defaultValue: 'Account settings, profile management' }),
          icon: 'user'
        },
        {
          id: 'patients',
          name: translate('helpCenter:categories.patients.name', { defaultValue: 'Patients Management' }),
          description: translate('helpCenter:categories.patients.description', { defaultValue: 'Creating and managing patient records' }),
          icon: 'patients'
        },
        {
          id: 'technical',
          name: translate('helpCenter:categories.technical.name', { defaultValue: 'Troubleshooting' }),
          description: translate('helpCenter:categories.technical.description', { defaultValue: 'App problems, bugs, connectivity' }),
          icon: 'troubleshooting'
        },
        {
          id: 'billing',
          name: translate('helpCenter:categories.billing.name', { defaultValue: 'Billing & Payments' }),
          description: translate('helpCenter:categories.billing.description', { defaultValue: 'Subscriptions, payments, invoices' }),
          icon: 'billing'
        },
        {
          id: 'mobile',
          name: translate('helpCenter:categories.mobile.name', { defaultValue: 'Getting Started' }),
          description: translate('helpCenter:categories.mobile.description', { defaultValue: 'Getting started and setup guides' }),
          icon: 'mobile'
        }
      ],
      faqs: [
        // Account & Profile FAQs
        {
          id: 'account-1',
          category: 'account',
          question: translate('helpCenter:faqs.account1.question', { defaultValue: 'How do I change my password?' }),
          answer: translate('helpCenter:faqs.account1.answer', { 
            defaultValue: 'Go to your Account Settings, click on Security, and select Change Password. You will need to enter your current password and then create a new one.' 
          })
        },
        {
          id: 'account-2',
          category: 'account',
          question: translate('helpCenter:faqs.account2.question', { defaultValue: 'How do I update my email address?' }),
          answer: translate('helpCenter:faqs.account2.answer', { 
            defaultValue: 'In your Account Settings, go to Personal Information and click Edit next to your email address. You will need to verify the new email address before the change takes effect.' 
          })
        },
        {
          id: 'account-3',
          category: 'account',
          question: translate('helpCenter:faqs.account3.question', { defaultValue: 'How do I delete my account?' }),
          answer: translate('helpCenter:faqs.account3.answer', { 
            defaultValue: 'To delete your account, go to Account Settings, select Privacy & Security, and click Delete Account. Note that this action is permanent and cannot be undone.' 
          })
        },
        
        // Patients Management FAQs
        {
          id: 'patients-1',
          category: 'patients',
          question: translate('helpCenter:faqs.patients1.question', { defaultValue: 'How do I create a new patient record?' }),
          answer: translate('helpCenter:faqs.patients1.answer', { 
            defaultValue: 'Go to your dashboard and click Add Patient. Fill in the patient details including name, medical history, contact information, and initial assessment. Ensure all required medical information is properly documented.' 
          })
        },
        {
          id: 'patients-2',
          category: 'patients',
          question: translate('helpCenter:faqs.patients2.question', { defaultValue: 'How do I access patient records?' }),
          answer: translate('helpCenter:faqs.patients2.answer', { 
            defaultValue: 'You can access patient records through your healthcare dashboard. Use the search function to find specific patients or browse your patient list. All patient data is securely encrypted and HIPAA-compliant.' 
          })
        },
        {
          id: 'patients-3',
          category: 'patients',
          question: translate('helpCenter:faqs.patients3.question', { defaultValue: 'How do I manage patient medical records?' }),
          answer: translate('helpCenter:faqs.patients3.answer', { 
            defaultValue: 'In your patient management panel, you can view all medical records, update treatment plans, manage appointments, and track patient progress. All changes are automatically logged for audit purposes.' 
          })
        },
        
        // Technical Issues FAQs
        {
          id: 'technical-1',
          category: 'technical',
          question: translate('helpCenter:faqs.technical1.question', { defaultValue: 'The app is running slowly' }),
          answer: translate('helpCenter:faqs.technical1.answer', { 
            defaultValue: 'Try refreshing the page or restarting the app. Clear your browser cache and ensure you have a stable internet connection. If problems persist, try using a different browser or updating your current one.' 
          })
        },
        {
          id: 'technical-2',
          category: 'technical',
          question: translate('helpCenter:faqs.technical2.question', { defaultValue: 'I\'m not receiving notifications' }),
          answer: translate('helpCenter:faqs.technical2.answer', { 
            defaultValue: 'Check your notification settings to ensure they are enabled. Also verify your email address is correct and check your spam/junk folder. For mobile notifications, ensure the app has permission to send notifications.' 
          })
        },
        {
          id: 'technical-3',
          category: 'technical',
          question: translate('helpCenter:faqs.technical3.question', { defaultValue: 'I can\'t log into my account' }),
          answer: translate('helpCenter:faqs.technical3.answer', { 
            defaultValue: 'First, check that you are using the correct email and password. If you have forgotten your password, use the Forgot Password link. If issues persist, clear your browser cache or try a different browser.' 
          })
        },
        
        // Billing & Payments FAQs
        {
          id: 'billing-1',
          category: 'billing',
          question: translate('helpCenter:faqs.billing1.question', { defaultValue: 'What subscription plans are available?' }),
          answer: translate('helpCenter:faqs.billing1.answer', { 
            defaultValue: 'We offer Free, Premium, and Team plans. The Free plan includes basic features, Premium adds advanced analytics and priority support, while Team plans include additional management tools and higher limits.' 
          })
        },
        {
          id: 'billing-2',
          category: 'billing',
          question: translate('helpCenter:faqs.billing2.question', { defaultValue: 'What is your refund policy?' }),
          answer: translate('helpCenter:faqs.billing2.answer', { 
            defaultValue: 'We offer a 30-day money-back guarantee for all paid subscriptions. If you are not satisfied, contact our support team within 30 days of your purchase for a full refund.' 
          })
        },
        {
          id: 'billing-3',
          category: 'billing',
          question: translate('helpCenter:faqs.billing3.question', { defaultValue: 'How do I update my payment method?' }),
          answer: translate('helpCenter:faqs.billing3.answer', { 
            defaultValue: 'Go to your Account Settings, select Billing, and click Payment Methods. You can add a new card, update existing payment information, or set a different card as your primary payment method.' 
          })
        },
        
        // Getting Started FAQs
        {
          id: 'mobile-1',
          category: 'mobile',
          question: translate('helpCenter:faqs.mobile1.question', { defaultValue: 'How do I create an account?' }),
          answer: translate('helpCenter:faqs.mobile1.answer', { 
            defaultValue: 'To create an account, click on the Sign Up button in the top right corner of our homepage. Fill in your email, create a password, and verify your email address to get started.' 
          })
        },
        {
          id: 'mobile-2',
          category: 'mobile',
          question: translate('helpCenter:faqs.mobile2.question', { defaultValue: 'How do I set up my profile?' }),
          answer: translate('helpCenter:faqs.mobile2.answer', { 
            defaultValue: 'After creating your account, go to your profile settings to add your professional information, medical credentials, specializations, and profile picture. A complete profile helps patients and healthcare providers connect with you.' 
          })
        },
        
        // Privacy & Security FAQs
        {
          id: 'privacy-1',
          category: 'privacy',
          question: translate('helpCenter:faqs.privacy1.question', { defaultValue: 'How do you protect my personal data?' }),
          answer: translate('helpCenter:faqs.privacy1.answer', { 
            defaultValue: 'We use industry-standard encryption and security measures to protect your data. We never sell your personal information and only share data as outlined in our Privacy Policy.' 
          })
        },
        {
          id: 'privacy-2',
          category: 'privacy',
          question: translate('helpCenter:faqs.privacy2.question', { defaultValue: 'Who can see my profile information?' }),
          answer: translate('helpCenter:faqs.privacy2.answer', { 
            defaultValue: 'You can control your profile visibility in Privacy Settings. You can choose to make your profile public, visible to healthcare network members only, or completely private. All medical data remains confidential regardless of profile settings.' 
          })
        }
      ],
      contactSupport: {
        title: translate('helpCenter:contactSupport.title', { defaultValue: 'Need More Help?' }),
        description: translate('helpCenter:contactSupport.description', { 
          defaultValue: 'Can\'t find what you\'re looking for? Our support team is here to help you with any questions or issues.' 
        }),
        buttonText: translate('helpCenter:contactSupport.buttonText', { defaultValue: 'Contact Support' }),
        email: translate('helpCenter:contactSupport.email', { defaultValue: '{supportEmail}' })
      }
    }
  };
};

// For backward compatibility
export const helpCenterContent: Record<string, ModalContent> = {
  'v1.0.0': getHelpCenterContent('v1.0.0')
};