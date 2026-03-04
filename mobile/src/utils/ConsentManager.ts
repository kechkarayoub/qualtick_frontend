/**
 * ConsentManager Utility
 * 
 * Handles privacy policy, terms of service, and cookies policy consent
 * for different registration scenarios (traditional vs OAuth)
 */

import { Alert } from 'react-native';
import { TFunction } from 'i18next';

export interface ConsentData {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptCookies: boolean;
  consentTimestamp: string;
  consentMethod: 'traditional' | 'oauth' | 'progressive';
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentOptions {
  provider?: string;
  email?: string;
  showPolicyLinks?: boolean;
  allowPartialConsent?: boolean;
}

export class ConsentManager {
  private static instance: ConsentManager;
  private modalManager?: any;
  private translate?: TFunction;

  private constructor() {}

  public static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  /**
   * Initialize the consent manager with required dependencies
   */
  public initialize(modalManager: any, translate: TFunction) {
    this.modalManager = modalManager;
    this.translate = translate;
  }

  /**
   * Show appropriate consent flow based on registration type
   */
  public async showConsentFlow(
    registrationType: 'traditional' | 'oauth',
    options: ConsentOptions = {}
  ): Promise<ConsentData | null> {
    if (registrationType === 'traditional') {
      // Traditional registration uses existing checkbox flow
      return null; // Let RegisterScreen handle this
    }

    return this.showOAuthConsentFlow(options);
  }

  /**
   * Show streamlined consent flow for OAuth registration
   */
  private async showOAuthConsentFlow(options: ConsentOptions): Promise<ConsentData | null> {
    if (!this.translate) {
      console.warn('ConsentManager: Translate function not initialized');
      return null;
    }

    const { provider = 'third-party service', email = '' } = options;

    return new Promise((resolve) => {
      const title = this.translate!('auth:oauth.consentTitle', { 
        defaultValue: 'Welcome to Qualitick',
        provider 
      });

      const message = this.translate!('auth:oauth.consentMessage', {
        defaultValue: `By continuing with ${provider}, you agree to our Terms of Service, Privacy Policy, and Cookies Policy.\n\nYou can review these policies anytime in your account settings.`,
        provider,
        email: email ? `\n\nAccount: ${email}` : ''
      });

      Alert.alert(
        title,
        message,
        [
          {
            text: this.translate!('auth:oauth.viewPolicies', { defaultValue: 'Review Policies' }),
            onPress: () => {
              this.showPolicyReviewModal(() => {
                // After reviewing, ask again
                this.showOAuthConsentFlow(options).then(resolve);
              });
            },
            style: 'default'
          },
          {
            text: this.translate!('common:buttons.cancel', { defaultValue: 'Cancel' }),
            onPress: () => resolve(null),
            style: 'cancel'
          },
          {
            text: this.translate!('auth:oauth.acceptAndContinue', { defaultValue: 'Accept & Continue' }),
            onPress: () => {
              const consentData: ConsentData = {
                acceptTerms: true,
                acceptPrivacy: true,
                acceptCookies: true,
                consentTimestamp: new Date().toISOString(),
                consentMethod: 'oauth',
                // Could add IP/User-Agent for compliance if needed
              };
              resolve(consentData);
            },
            style: 'default'
          }
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Show policy review modal with all three policies
   */
  private showPolicyReviewModal(onComplete: () => void) {
    if (!this.modalManager) {
      console.warn('ConsentManager: Modal manager not initialized');
      onComplete();
      return;
    }

    // Show a sequential flow of the three main policies
    const showNextPolicy = (currentIndex: number) => {
      const policies = [
        { key: 'terms', modal: this.modalManager.termsOfService },
        { key: 'privacy', modal: this.modalManager.privacyPolicy },
        { key: 'cookies', modal: this.modalManager.cookiesPolicy }
      ];

      if (currentIndex >= policies.length) {
        onComplete();
        return;
      }

      const policy = policies[currentIndex];
      if (policy.modal && typeof policy.modal.open === 'function') {
        policy.modal.open();
        
        // Set up a listener for when this modal closes
        // Note: This assumes the modal manager provides a way to listen to close events
        // You might need to adjust this based on your actual modal implementation
        setTimeout(() => {
          showNextPolicy(currentIndex + 1);
        }, 1000); // Give time for user to read
      } else {
        showNextPolicy(currentIndex + 1);
      }
    };

    showNextPolicy(0);
  }

  /**
   * Validate traditional consent (for form-based registration)
   */
  public validateTraditionalConsent(formData: {
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    acceptCookies: boolean;
  }): ConsentData | null {
    if (!formData.acceptTerms || !formData.acceptPrivacy || !formData.acceptCookies) {
      return null;
    }

    return {
      acceptTerms: formData.acceptTerms,
      acceptPrivacy: formData.acceptPrivacy,
      acceptCookies: formData.acceptCookies,
      consentTimestamp: new Date().toISOString(),
      consentMethod: 'traditional'
    };
  }

  /**
   * Show progressive consent flow (for post-registration)
   */
  public async showProgressiveConsent(
    _requiredPolicies: ('terms' | 'privacy' | 'cookies')[]
  ): Promise<Partial<ConsentData> | null> {
    // Implementation for showing specific policies after registration
    // This could be used when users need to consent to new policies or updates
    return new Promise((resolve) => {
      // Implementation would depend on your specific needs
      resolve(null);
    });
  }

  /**
   * Record consent for audit purposes
   */
  public recordConsent(consentData: ConsentData, userId?: string): void {
    // Log consent data for compliance
    console.log('Consent recorded:', {
      userId,
      ...consentData,
      recordedAt: new Date().toISOString()
    });

    // In a real implementation, you might send this to your backend
    // for compliance tracking and audit purposes
  }

  /**
   * Check if consent needs to be refreshed (e.g., policy updates)
   */
  public needsConsentRefresh(lastConsentDate: string, policyUpdateDate: string): boolean {
    return new Date(lastConsentDate) < new Date(policyUpdateDate);
  }
}

export default ConsentManager.getInstance();