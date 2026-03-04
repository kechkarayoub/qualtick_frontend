/**
 * CookiesPolicyModal Component for React Native
 * 
 * Modal displaying the cookies policy for the Qualitick platform
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BaseModal from './BaseModal';
import { useModalContent } from '../../hooks/useModalContent';
import { useTheme } from '../../contexts/ThemeContext';

interface CookiesPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookiesPolicyModal: React.FC<CookiesPolicyModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('cookies-policy');

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('common:loading')}
          </Text>
        </View>
      );
    }

    if (error || !content) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {t('common:error.loadingContent')}
          </Text>
        </View>
      );
    }

    const cookiesContent = content.content as any;

    return (
      <View style={styles.contentContainer}>
        {/* Introduction */}
        {cookiesContent.introduction && (
          <View style={styles.section}>
            <Text style={[styles.text, { color: colors.text }]}>
              {cookiesContent.introduction.text}
            </Text>
          </View>
        )}

        {/* What Are Cookies */}
        {cookiesContent.whatAreCookies && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {cookiesContent.whatAreCookies.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {cookiesContent.whatAreCookies.text}
            </Text>
          </View>
        )}

        {/* Types of Cookies */}
        {cookiesContent.types && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {cookiesContent.types.title}
            </Text>
            {cookiesContent.types.items?.map((type: any, index: number) => (
              <View key={index} style={styles.cookieType}>
                <Text style={[styles.typeTitle, { color: colors.text }]}>
                  {type.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {type.description}
                </Text>
                {type.examples && (
                  <Text style={[styles.examples, { color: colors.textSecondary }]}>
                    {t('cookies:examples')}: {type.examples.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* How We Use Cookies */}
        {cookiesContent.howWeUse && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {cookiesContent.howWeUse.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {cookiesContent.howWeUse.text}
            </Text>
            {cookiesContent.howWeUse.purposes && (
              <View style={styles.purposesList}>
                {cookiesContent.howWeUse.purposes.map((purpose: string, index: number) => (
                  <Text key={index} style={[styles.listItem, { color: colors.text }]}>
                    • {purpose}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Third Party Cookies */}
        {cookiesContent.thirdParty && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {cookiesContent.thirdParty.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {cookiesContent.thirdParty.text}
            </Text>
            {cookiesContent.thirdParty.services && (
              <View style={styles.servicesList}>
                {cookiesContent.thirdParty.services.map((service: any, index: number) => (
                  <View key={index} style={styles.serviceItem}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>
                      {service.name}
                    </Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                      {service.purpose}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Managing Cookies */}
        {cookiesContent.managing && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {cookiesContent.managing.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {cookiesContent.managing.text}
            </Text>
            {cookiesContent.managing.options && (
              <View style={styles.optionsList}>
                {cookiesContent.managing.options.map((option: any, index: number) => (
                  <View key={index} style={styles.optionItem}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Contact */}
        {cookiesContent.contact && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {cookiesContent.contact.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {cookiesContent.contact.text}
            </Text>
            {cookiesContent.contact.email && (
              <Text style={[styles.contactEmail, { color: colors.primary }]}>
                {cookiesContent.contact.email}
              </Text>
            )}
          </View>
        )}

        {/* Last Updated */}
        {content.lastUpdated && (
          <View style={styles.section}>
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
              {t('common:cookies.lastUpdated')}: {formatDate(new Date(content.lastUpdated))}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('cookies:title', { defaultValue: 'Cookies Policy' })}
      size="large"
    >
      {renderContent()}
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  cookieType: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  examples: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  purposesList: {
    marginTop: 12,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  servicesList: {
    marginTop: 12,
  },
  serviceItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 122, 255, 0.3)',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionsList: {
    marginTop: 12,
  },
  optionItem: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CookiesPolicyModal;