/**
 * AboutUsModal Component for React Native
 * 
 * Modal displaying information about the Qualitick platform
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

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('about-us');

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

    const aboutContent = content.content as any;

    return (
      <View style={styles.contentContainer}>
        {/* Hero Section */}
        {aboutContent.hero && (
          <View style={styles.section}>
            <Text style={[styles.heroTitle, { color: colors.primary }]}>
              {aboutContent.hero.title}
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              {aboutContent.hero.subtitle}
            </Text>
          </View>
        )}

        {/* Mission */}
        {aboutContent.mission && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {aboutContent.mission.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {aboutContent.mission.text}
            </Text>
          </View>
        )}

        {/* Features */}
        {aboutContent.features && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {aboutContent.features.title}
            </Text>
            {aboutContent.features.items?.map((feature: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Values */}
        {aboutContent.values && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {aboutContent.values.title}
            </Text>
            {aboutContent.values.items?.map((value: any, index: number) => (
              <View key={index} style={styles.valueItem}>
                <Text style={[styles.valueTitle, { color: colors.text }]}>
                  {value.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {value.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Contact Information */}
        {aboutContent.contact && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {aboutContent.contact.title}
            </Text>
            {aboutContent.contact.email && (
              <Text style={[styles.contactInfo, { color: colors.text }]}>
                {t('common:email')}: {aboutContent.contact.email}
              </Text>
            )}
            {aboutContent.contact.phone && (
              <Text style={[styles.contactInfo, { color: colors.text }]}>
                {t('common:phone')}: {aboutContent.contact.phone}
              </Text>
            )}
            {aboutContent.contact.address && (
              <Text style={[styles.contactInfo, { color: colors.text }]}>
                {t('common:address')}: {aboutContent.contact.address}
              </Text>
            )}
          </View>
        )}

        {/* Last Updated */}
        {content.lastUpdated && (
          <View style={styles.section}>
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
              {t('common:lastUpdated')}: {formatDate(new Date(content.lastUpdated))}
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
      title={t('aboutUs:title', { defaultValue: 'About Us' })}
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
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
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
  featureItem: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 122, 255, 0.3)',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueItem: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 122, 255, 0.3)',
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  founded: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
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

export default AboutUsModal;