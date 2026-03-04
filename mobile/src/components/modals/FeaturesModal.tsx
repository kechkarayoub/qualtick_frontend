/**
 * FeaturesModal Component for React Native
 * 
 * Modal displaying the features of the Qualitick platform
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

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeaturesModal: React.FC<FeaturesModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('features');

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

    const featuresContent = content.content as any;

    return (
      <View style={styles.contentContainer}>
        {/* Introduction */}
        {featuresContent.introduction && (
          <View style={styles.section}>
            <Text style={[styles.text, { color: colors.text }]}>
              {featuresContent.introduction.text}
            </Text>
          </View>
        )}

        {/* Core Features */}
        {featuresContent.core && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.core.title}
            </Text>
            {featuresContent.core.features?.map((feature: any, index: number) => (
              <View key={index} style={styles.featureCard}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
                {feature.benefits && (
                  <View style={styles.benefitsList}>
                    <Text style={[styles.benefitsTitle, { color: colors.text }]}>
                      {t('features:benefits')}:
                    </Text>
                    {feature.benefits.map((benefit: string, benefitIndex: number) => (
                      <Text key={benefitIndex} style={[styles.benefitItem, { color: colors.textSecondary }]}>
                        • {benefit}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Patient Features */}
        {featuresContent.patient && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.patient.title}
            </Text>
            {featuresContent.patient.features?.map((feature: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={[styles.featureItemTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Provider Features */}
        {featuresContent.provider && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.provider.title}
            </Text>
            {featuresContent.provider.features?.map((feature: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={[styles.featureItemTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Administrative Features */}
        {featuresContent.administrative && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.administrative.title}
            </Text>
            {featuresContent.administrative.features?.map((feature: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={[styles.featureItemTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Technology Features */}
        {featuresContent.technology && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.technology.title}
            </Text>
            {featuresContent.technology.features?.map((feature: any, index: number) => (
              <View key={index} style={styles.techFeature}>
                <Text style={[styles.techFeatureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
                {feature.specifications && (
                  <View style={styles.specsList}>
                    {feature.specifications.map((spec: string, specIndex: number) => (
                      <Text key={specIndex} style={[styles.specItem, { color: colors.textSecondary }]}>
                        • {spec}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Security Features */}
        {featuresContent.security && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.security.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {featuresContent.security.description}
            </Text>
            {featuresContent.security.features && (
              <View style={styles.securityList}>
                {featuresContent.security.features.map((feature: string, index: number) => (
                  <Text key={index} style={[styles.securityItem, { color: colors.text }]}>
                    ✓ {feature}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Coming Soon */}
        {featuresContent.comingSoon && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {featuresContent.comingSoon.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {featuresContent.comingSoon.description}
            </Text>
            {featuresContent.comingSoon.features && (
              <View style={styles.comingSoonList}>
                {featuresContent.comingSoon.features.map((feature: any, index: number) => (
                  <View key={index} style={styles.comingSoonItem}>
                    <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                      {feature.description}
                    </Text>
                    {feature.timeline && (
                      <Text style={[styles.timeline, { color: colors.accent }]}>
                        {t('features:expectedBy')}: {feature.timeline}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
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
      title={t('features:title', { defaultValue: 'Platform Features' })}
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
  featureCard: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0, 122, 255, 0.8)',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
    paddingLeft: 8,
  },
  featureItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 122, 255, 0.3)',
  },
  featureItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  techFeature: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  techFeatureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  specsList: {
    marginTop: 8,
  },
  specItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
    paddingLeft: 8,
  },
  securityList: {
    marginTop: 12,
  },
  securityItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  comingSoonList: {
    marginTop: 12,
  },
  comingSoonItem: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 193, 7, 0.8)',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeline: {
    fontSize: 14,
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

export default FeaturesModal;