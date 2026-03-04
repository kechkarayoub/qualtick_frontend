/**
 * Modal Content Provider - React Native Version
 * 
 * Centralized provider for all modal content with version management
 * This is a copy of the shared content specifically for React Native usage
 */

import { ModalContent, ModalContentProvider, CompanyInfo, ContentVersion } from './types';
import { getPrivacyPolicyContent } from './modals/privacyPolicy';
import { getTermsOfServiceContent } from './modals/termsOfService';
import { getCookiesPolicyContent } from './modals/cookiesPolicy';
import { getAboutUsContent } from './modals/aboutUs';
import { getFeaturesContent } from './modals/features';
import { getContactContent } from './modals/contact';
import { getHelpCenterContent } from './modals/helpCenter';

type ModalId = 'privacy-policy' | 'terms-of-service' | 'cookies-policy' | 'about-us' | 'features' | 'contact' | 'help-center';

interface ModalContentGetters {
  [key: string]: (version?: string, t?: any) => ModalContent;
}

class SharedModalContentProvider implements ModalContentProvider {
  private contentGetters: ModalContentGetters = {
    'privacy-policy': (version, t) => getPrivacyPolicyContent(version, t),
    'terms-of-service': (version, t) => getTermsOfServiceContent(version, t),
    'cookies-policy': (version, t) => getCookiesPolicyContent(version, t),
    'about-us': (version, t) => getAboutUsContent(version, t),
    'features': (version, t) => getFeaturesContent(version, t),
    'contact': (version, t) => getContactContent(version, t),
    'help-center': (version, t) => getHelpCenterContent(version, t),
  };

  private companyInfo: CompanyInfo = {
    name: 'Qualitick',
    supportEmail: 'support@qualitick.com',
    address: '',
    website: 'https://qualitick.com',
  };

  getModalContent(modalId: string, version?: string, t?: any): ModalContent | null {
    const getter = this.contentGetters[modalId];
    if (!getter) {
      console.warn(`No content getter found for modal: ${modalId}`);
      return null;
    }

    try {
      const content = getter(version, t);
      return this.interpolateContent(content);
    } catch (error) {
      console.error(`Error getting content for modal ${modalId}:`, error);
      return null;
    }
  }

  getLatestVersion(modalId: string): string | null {
    const content = this.getModalContent(modalId);
    return content?.version || null;
  }

  getAllVersions(modalId: string): ContentVersion[] {
    // For now, we only have v1.0.0 for all modals
    // This can be expanded to support multiple versions
    const content = this.getModalContent(modalId);
    if (!content) return [];

    return [{
      version: content.version,
      lastUpdated: content.lastUpdated,
      title: content.title,
      description: `Current version of ${content.title}`
    }];
  }

  hasContentChanged(modalId: string, lastKnownVersion: string): boolean {
    const latestVersion = this.getLatestVersion(modalId);
    return latestVersion !== lastKnownVersion;
  }

  getCompanyInfo(): CompanyInfo {
    return this.companyInfo;
  }

  /**
   * Interpolates template variables in content with company information
   */
  private interpolateContent(content: ModalContent): ModalContent {
    const interpolatedContent = this.deepInterpolate(content.content, {
      companyName: this.companyInfo.name,
      supportEmail: this.companyInfo.supportEmail,
      companyAddress: this.companyInfo.address || '',
      companyWebsite: this.companyInfo.website || '',
    });

    return {
      ...content,
      content: interpolatedContent,
    };
  }

  /**
   * Recursively interpolates template variables in nested objects
   */
  private deepInterpolate(obj: any, variables: Record<string, string>): any {
    if (typeof obj === 'string') {
      return this.interpolateString(obj, variables);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepInterpolate(item, variables));
    }

    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.deepInterpolate(value, variables);
      }
      return result;
    }

    return obj;
  }

  /**
   * Interpolates template variables in a string
   */
  private interpolateString(str: string, variables: Record<string, string>): string {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Gets content with change detection
   */
  getContentWithChangeDetection(modalId: string, lastKnownVersion?: string): {
    content: ModalContent | null;
    hasChanged: boolean;
  } {
    const content = this.getModalContent(modalId);
    const hasChanged = lastKnownVersion ? this.hasContentChanged(modalId, lastKnownVersion) : false;

    return {
      content,
      hasChanged,
    };
  }

  /**
   * Gets all available modal IDs
   */
  getAvailableModalIds(): string[] {
    return Object.keys(this.contentGetters);
  }

  /**
   * Creates an alias for easier modal access
   */
  createModalAlias(): Record<string, (version?: string) => ModalContent | null> {
    const aliases: Record<string, (version?: string) => ModalContent | null> = {};
    
    for (const modalId of this.getAvailableModalIds()) {
      // Create camelCase aliases
      const camelCaseId = modalId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      aliases[camelCaseId] = (version?: string) => this.getModalContent(modalId, version);
      
      // Keep original hyphenated names
      aliases[modalId] = (version?: string) => this.getModalContent(modalId, version);
    }

    return aliases;
  }
}

// Create and export singleton instance
export const modalContentProvider = new SharedModalContentProvider();

// Export convenient aliases
export const modals = modalContentProvider.createModalAlias();

// Export individual getters for convenience
export const getPrivacyPolicy = (version?: string) => modalContentProvider.getModalContent('privacy-policy', version);
export const getTermsOfService = (version?: string) => modalContentProvider.getModalContent('terms-of-service', version);
export const getCookiesPolicy = (version?: string) => modalContentProvider.getModalContent('cookies-policy', version);
export const getAboutUs = (version?: string) => modalContentProvider.getModalContent('about-us', version);
export const getFeatures = (version?: string) => modalContentProvider.getModalContent('features', version);
export const getContact = (version?: string) => modalContentProvider.getModalContent('contact', version);
export const getHelpCenter = (version?: string) => modalContentProvider.getModalContent('help-center', version);

// Export types
export * from './types';
export type { ModalId };

export default modalContentProvider;