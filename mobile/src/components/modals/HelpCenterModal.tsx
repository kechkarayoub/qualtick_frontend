/**
 * HelpCenterModal Component for React Native
 * 
 * Modal displaying help center and FAQ for the Qualitick platform
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BaseModal from './BaseModal';
import { useModalContent } from '../../hooks/useModalContent';
import { useTheme } from '../../contexts/ThemeContext';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('help-center');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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

    const helpContent = content.content as any;

    return (
      <View style={styles.contentContainer}>
        {/* Introduction */}
        {helpContent.introduction && (
          <View style={styles.section}>
            <Text style={[styles.text, { color: colors.text }]}>
              {helpContent.introduction.text}
            </Text>
          </View>
        )}

        {/* Quick Start Guide */}
        {helpContent.quickStart && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {helpContent.quickStart.title}
            </Text>
            {helpContent.quickStart.steps?.map((step: any, index: number) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.text, { color: colors.textSecondary }]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Frequently Asked Questions */}
        {helpContent.faq && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {helpContent.faq.title}
            </Text>
            {helpContent.faq.questions?.map((faq: any, index: number) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <Text style={[styles.faqToggle, { color: colors.primary }]}>
                    {expandedFaq === index ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* User Guides */}
        {helpContent.guides && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {helpContent.guides.title}
            </Text>
            {helpContent.guides.categories?.map((category: any, index: number) => (
              <View key={index} style={styles.guideCategory}>
                <Text style={[styles.guideCategoryTitle, { color: colors.text }]}>
                  {category.title}
                </Text>
                {category.guides?.map((guide: any, guideIndex: number) => (
                  <View key={guideIndex} style={styles.guideItem}>
                    <Text style={[styles.guideTitle, { color: colors.text }]}>
                      {guide.title}
                    </Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                      {guide.description}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Common Issues */}
        {helpContent.commonIssues && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {helpContent.commonIssues.title}
            </Text>
            {helpContent.commonIssues.issues?.map((issue: any, index: number) => (
              <View key={index} style={styles.issueItem}>
                <Text style={[styles.issueTitle, { color: colors.text }]}>
                  {issue.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {issue.description}
                </Text>
                {issue.solution && (
                  <View style={styles.solutionBox}>
                    <Text style={[styles.solutionLabel, { color: colors.success }]}>
                      {t('help:solution')}:
                    </Text>
                    <Text style={[styles.text, { color: colors.text }]}>
                      {issue.solution}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Support Channels */}
        {helpContent.support && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {helpContent.support.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {helpContent.support.description}
            </Text>
            {helpContent.support.channels?.map((channel: any, index: number) => (
              <View key={index} style={styles.supportChannel}>
                <Text style={[styles.channelTitle, { color: colors.text }]}>
                  {channel.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {channel.description}
                </Text>
                {channel.email && (
                  <TouchableOpacity onPress={() => handleEmailPress(channel.email)}>
                    <Text style={[styles.contactLink, { color: colors.primary }]}>
                      {channel.email}
                    </Text>
                  </TouchableOpacity>
                )}
                {channel.phone && (
                  <TouchableOpacity onPress={() => handlePhonePress(channel.phone)}>
                    <Text style={[styles.contactLink, { color: colors.primary }]}>
                      {channel.phone}
                    </Text>
                  </TouchableOpacity>
                )}
                {channel.hours && (
                  <Text style={[styles.channelHours, { color: colors.textSecondary }]}>
                    {t('help:hours')}: {channel.hours}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Resources */}
        {helpContent.resources && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {helpContent.resources.title}
            </Text>
            {helpContent.resources.items?.map((resource: any, index: number) => (
              <View key={index} style={styles.resourceItem}>
                <Text style={[styles.resourceTitle, { color: colors.text }]}>
                  {resource.title}
                </Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {resource.description}
                </Text>
              </View>
            ))}
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
      title={t('help:title', { defaultValue: 'Help Center' })}
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
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  faqToggle: {
    fontSize: 20,
    fontWeight: '600',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  guideCategory: {
    marginBottom: 20,
  },
  guideCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  guideItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 122, 255, 0.3)',
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  issueItem: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  solutionBox: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderRadius: 6,
  },
  solutionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportChannel: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactLink: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  channelHours: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resourceItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 122, 255, 0.3)',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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

export default HelpCenterModal;