/**
 * TermsOfServiceModal Component for React Native
 * 
 * Modal displaying the terms of service for the Qualitick platform
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BaseModal from './BaseModal';
import { useModalContent, useCompanyInfo } from '../../hooks/useModalContent';
import { useTheme } from '../../contexts/ThemeContext';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('terms-of-service');
  const companyInfo = useCompanyInfo();

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const renderSection = (section: any, title: string) => {
    if (!section) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        {section.text && (
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {section.text}
          </Text>
        )}
        {section.items && (
          <View style={styles.list}>
            {section.items.map((item: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <Text style={[styles.listBullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSubsection = (subsection: any, title: string) => {
    if (!subsection) return null;

    return (
      <View style={styles.subsection}>
        <Text style={[styles.subsectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subsection.text && (
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {subsection.text}
          </Text>
        )}
        {subsection.items && (
          <View style={styles.list}>
            {subsection.items.map((item: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <Text style={[styles.listBullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title={t('common:terms.title', { defaultValue: 'Terms of Service' })}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('common:loading', { defaultValue: 'Loading...' })}
          </Text>
        </View>
      </BaseModal>
    );
  }

  if (error || !content) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title={t('common:terms.title', { defaultValue: 'Terms of Service' })}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || t('common:error.contentNotFound', { defaultValue: 'Content not found' })}
          </Text>
        </View>
      </BaseModal>
    );
  }

  const { content: termsContent } = content;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('common:terms.title', { defaultValue: 'Terms of Service' })}
      size="large"
    >
      <View style={styles.container}>
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={[styles.lastUpdatedText, { color: colors.textSecondary }]}>
            <Text style={styles.bold}>
              {t('common:terms.lastUpdated', { defaultValue: 'Last updated:' })}
            </Text>{' '}
            {formatDate(content.lastUpdated)}
          </Text>
        </View>

        {/* Introduction */}
        {renderSection(termsContent.introduction, 
          t('common:terms.introduction.title', { defaultValue: 'Introduction' }))}

        {/* Acceptance */}
        {renderSection(termsContent.acceptance,
          t('common:terms.acceptance.title', { defaultValue: 'Acceptance of Terms' }))}

        {/* Eligibility */}
        {renderSection(termsContent.eligibility,
          t('common:terms.eligibility.title', { defaultValue: 'Eligibility' }))}

        {/* Account Registration */}
        {renderSection(termsContent.accountRegistration,
          t('common:terms.accountRegistration.title', { defaultValue: 'Account Registration and Security' }))}

        {/* Use of Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('common:terms.useOfServices.title', { defaultValue: 'Use of Services' })}
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {termsContent.useOfServices.text}
          </Text>
          
          {renderSubsection(termsContent.useOfServices.permitted,
            t('common:terms.useOfServices.permitted.title', { defaultValue: 'Permitted Uses' }))}
          
          {renderSubsection(termsContent.useOfServices.prohibited,
            t('common:terms.useOfServices.prohibited.title', { defaultValue: 'Prohibited Uses' }))}
        </View>

        {/* User Content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('common:terms.userContent.title', { defaultValue: 'User Content' })}
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {termsContent.userContent.text}
          </Text>
          
          {renderSubsection(termsContent.userContent.license,
            t('common:terms.userContent.license.title', { defaultValue: 'License to User Content' }))}
          
          {renderSubsection(termsContent.userContent.responsibilities,
            t('common:terms.userContent.responsibilities.title', { defaultValue: 'Your Responsibilities' }))}
        </View>

        {/* Privacy */}
        {renderSection(termsContent.privacy,
          t('common:terms.privacy.title', { defaultValue: 'Privacy and Data Protection' }))}

        {/* Intellectual Property */}
        {renderSection(termsContent.intellectualProperty,
          t('common:terms.intellectualProperty.title', { defaultValue: 'Intellectual Property' }))}

        {/* Payments */}
        {renderSection(termsContent.payments,
          t('common:terms.payments.title', { defaultValue: 'Payments and Subscriptions' }))}

        {/* Disclaimers */}
        {renderSection(termsContent.disclaimers,
          t('common:terms.disclaimers.title', { defaultValue: 'Disclaimers' }))}

        {/* Limitation */}
        {renderSection(termsContent.limitation,
          t('common:terms.limitation.title', { defaultValue: 'Limitation of Liability' }))}

        {/* Termination */}
        {renderSection(termsContent.termination,
          t('common:terms.termination.title', { defaultValue: 'Termination' }))}

        {/* Governing Law */}
        {renderSection(termsContent.governingLaw,
          t('common:terms.governingLaw.title', { defaultValue: 'Governing Law' }))}

        {/* Changes */}
        {renderSection(termsContent.changes,
          t('common:terms.changes.title', { defaultValue: 'Changes to These Terms' }))}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('common:terms.contact.title', { defaultValue: 'Contact Us' })}
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {termsContent.contact.text}
          </Text>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              <Text style={styles.bold}>
                {t('common:terms.contact.email', { defaultValue: 'Email:' })}
              </Text>{' '}
              {companyInfo.supportEmail}
            </Text>
            {companyInfo.address && (
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                <Text style={styles.bold}>
                  {t('common:terms.contact.address', { defaultValue: 'Address:' })}
                </Text>{' '}
                {companyInfo.address}
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface || colors.background }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {termsContent.footer.text}
          </Text>
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  lastUpdated: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastUpdatedText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  subsection: {
    marginTop: 16,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  listBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  listText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  contactInfo: {
    marginTop: 12,
    paddingLeft: 12,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});

export default TermsOfServiceModal;