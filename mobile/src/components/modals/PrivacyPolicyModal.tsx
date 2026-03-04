/**
 * PrivacyPolicyModal Component for React Native
 * 
 * Modal displaying the privacy policy for the Qualitick platform
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

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('privacy-policy');
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
      <BaseModal isOpen={isOpen} onClose={onClose} title={t('common:privacy.title', { defaultValue: 'Privacy Policy' })}>
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
      <BaseModal isOpen={isOpen} onClose={onClose} title={t('common:privacy.title', { defaultValue: 'Privacy Policy' })}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || t('common:error.contentNotFound', { defaultValue: 'Content not found' })}
          </Text>
        </View>
      </BaseModal>
    );
  }

  const { content: privacyContent } = content;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('common:privacy.title', { defaultValue: 'Privacy Policy' })}
      size="large"
    >
      <View style={styles.container}>
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={[styles.lastUpdatedText, { color: colors.textSecondary }]}>
            <Text style={styles.bold}>
              {t('common:privacy.lastUpdated', { defaultValue: 'Last updated:' })}
            </Text>{' '}
            {formatDate(content.lastUpdated)}
          </Text>
        </View>

        {/* Introduction */}
        {renderSection(privacyContent.introduction, 
          t('common:privacy.introduction.title', { defaultValue: 'Introduction' }))}

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('common:privacy.informationWeCollect.title', { defaultValue: 'Information We Collect' })}
          </Text>
          
          {renderSubsection(privacyContent.informationWeCollect.personalInfo,
            t('common:privacy.informationWeCollect.personalInfo.title', { defaultValue: 'Personal Information' }))}
          
          {renderSubsection(privacyContent.informationWeCollect.automaticInfo,
            t('common:privacy.informationWeCollect.automaticInfo.title', { defaultValue: 'Automatically Collected Information' }))}
        </View>

        {/* How We Use Your Information */}
        {renderSection(privacyContent.howWeUse,
          t('common:privacy.howWeUse.title', { defaultValue: 'How We Use Your Information' }))}

        {/* Information Sharing */}
        {renderSection(privacyContent.informationSharing,
          t('common:privacy.informationSharing.title', { defaultValue: 'Information Sharing and Disclosure' }))}

        {/* Data Security */}
        {renderSection(privacyContent.dataSecurity,
          t('common:privacy.dataSecurity.title', { defaultValue: 'Data Security' }))}

        {/* Your Rights */}
        {renderSection(privacyContent.yourRights,
          t('common:privacy.yourRights.title', { defaultValue: 'Your Privacy Rights' }))}

        {/* Cookies */}
        {renderSection(privacyContent.cookies,
          t('common:privacy.cookies.title', { defaultValue: 'Cookies and Tracking Technologies' }))}

        {/* Children's Privacy */}
        {renderSection(privacyContent.childrens,
          t('common:privacy.childrens.title', { defaultValue: "Children's Privacy" }))}

        {/* International Transfers */}
        {renderSection(privacyContent.international,
          t('common:privacy.international.title', { defaultValue: 'International Data Transfers' }))}

        {/* Changes */}
        {renderSection(privacyContent.changes,
          t('common:privacy.changes.title', { defaultValue: 'Changes to This Privacy Policy' }))}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('common:privacy.contact.title', { defaultValue: 'Contact Us' })}
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {privacyContent.contact.text}
          </Text>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              <Text style={styles.bold}>
                {t('common:privacy.contact.email', { defaultValue: 'Email:' })}
              </Text>{' '}
              {companyInfo.supportEmail}
            </Text>
            {companyInfo.address && (
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                <Text style={styles.bold}>
                  {t('common:privacy.contact.address', { defaultValue: 'Address:' })}
                </Text>{' '}
                {companyInfo.address}
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        {privacyContent.footer.text &&
          <View style={[styles.footer, { backgroundColor: colors.surface || colors.background }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {privacyContent.footer.text}
            </Text>
          </View>
        }
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

export default PrivacyPolicyModal;