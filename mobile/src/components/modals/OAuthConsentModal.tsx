/**
 * OAuthConsentModal Component
 * 
 * Streamlined consent modal for OAuth registration that presents
 * all three policies (Terms, Privacy, Cookies) in a user-friendly format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../contexts/ThemeContext';
import CustomButton from '../form/CustomButton';
import { ConsentData } from '../../utils/ConsentManager';

interface OAuthConsentModalProps {
  visible: boolean;
  provider: string;
  email?: string;
  onAccept: (consentData: ConsentData) => void;
  onDecline: () => void;
  onViewPolicy: (policyType: 'terms' | 'privacy' | 'cookies') => void;
}

const OAuthConsentModal: React.FC<OAuthConsentModalProps> = ({
  visible,
  provider,
  email,
  onAccept,
  onDecline,
  onViewPolicy,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isAccepting, setIsAccepting] = useState(false);

  const policies = [
    {
      key: 'terms' as const,
      title: t('auth:policies.termsOfService', { defaultValue: 'Terms of Service' }),
      description: t('auth:policies.termsDescription', { 
        defaultValue: 'Rules and guidelines for using our platform' 
      }),
      icon: 'document-text-outline' as const,
    },
    {
      key: 'privacy' as const,
      title: t('auth:policies.privacyPolicy', { defaultValue: 'Privacy Policy' }),
      description: t('auth:policies.privacyDescription', { 
        defaultValue: 'How we collect, use, and protect your personal information' 
      }),
      icon: 'shield-checkmark-outline' as const,
    },
    {
      key: 'cookies' as const,
      title: t('auth:policies.cookiesPolicy', { defaultValue: 'Cookies Policy' }),
      description: t('auth:policies.cookiesDescription', { 
        defaultValue: 'Information about cookies and tracking technologies we use' 
      }),
      icon: 'settings-outline' as const,
    },
  ];

  const handleAccept = async () => {
    setIsAccepting(true);
    
    const consentData: ConsentData = {
      acceptTerms: true,
      acceptPrivacy: true,
      acceptCookies: true,
      consentTimestamp: new Date().toISOString(),
      consentMethod: 'oauth',
    };

    try {
      await onAccept(consentData);
    } finally {
      setIsAccepting(false);
    }
  };

  const providerDisplayName = provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDecline}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('auth:oauth.welcomeTitle', { defaultValue: 'Welcome to Qualitick' })}
            </Text>
            <TouchableOpacity onPress={onDecline} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('auth:oauth.signInWith', { 
              defaultValue: `Signing in with ${providerDisplayName}`,
              provider: providerDisplayName 
            })}
          </Text>
          
          {email && (
            <Text style={[styles.email, { color: colors.primary }]}>
              {email}
            </Text>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.introduction}>
            <Text style={[styles.introText, { color: colors.text }]}>
              {t('auth:oauth.consentIntro', {
                defaultValue: 'By continuing, you agree to the following policies that govern your use of our healthcare platform:',
              })}
            </Text>
          </View>

          {/* Policy Cards */}
          <View style={styles.policiesContainer}>
            {policies.map((policy) => (
              <TouchableOpacity
                key={policy.key}
                style={[styles.policyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => onViewPolicy(policy.key)}
                activeOpacity={0.7}
              >
                <View style={styles.policyCardContent}>
                  <View style={[styles.policyIcon, { backgroundColor: colors.surface }]}>
                    <Icon 
                      name={policy.icon} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  
                  <View style={styles.policyTextContainer}>
                    <Text style={[styles.policyTitle, { color: colors.text }]}>
                      {policy.title}
                    </Text>
                    <Text style={[styles.policyDescription, { color: colors.textSecondary }]}>
                      {policy.description}
                    </Text>
                  </View>
                  
                  <Icon 
                    name="chevron-forward" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Important Notice */}
          <View style={[styles.notice, { backgroundColor: colors.surface }]}>
            <Icon 
              name="information-circle-outline" 
              size={20} 
              color={colors.primary} 
              style={styles.noticeIcon}
            />
            <Text style={[styles.noticeText, { color: colors.text }]}>
              {t('auth:oauth.importantNotice', {
                defaultValue: 'You can review and update your privacy preferences anytime in your account settings.',
              })}
            </Text>
          </View>

          {/* Healthcare Data Notice */}
          <View style={[styles.healthcareNotice, { backgroundColor: colors.surface }]}>
            <Icon 
              name="heart-outline" 
              size={20} 
              color={colors.warning} 
              style={styles.noticeIcon}
            />
            <Text style={[styles.noticeText, { color: colors.text }]}>
              {t('auth:oauth.healthcareNotice', {
                defaultValue: 'As a healthcare platform, we maintain the highest standards for protecting your sensitive health information in compliance with applicable privacy laws.',
              })}
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <CustomButton
            title={t('auth:oauth.acceptAndContinue', { defaultValue: 'Accept & Continue' })}
            onPress={handleAccept}
            loading={isAccepting}
            disabled={isAccepting}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.acceptButton}
            loadingTitle={t('common:progress...', { defaultValue: 'Processing...' })}
          />
          
          <CustomButton
            title={t('common:buttons.cancel', { defaultValue: 'Cancel' })}
            onPress={onDecline}
            variant="secondary"
            size="md"
            fullWidth
            style={styles.cancelButton}
            loadingTitle=""
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  introduction: {
    paddingVertical: 20,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  policiesContainer: {
    marginBottom: 24,
  },
  policyCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  policyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  policyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  policyTextContainer: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  policyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  healthcareNotice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  noticeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  acceptButton: {
    marginBottom: 12,
  },
  cancelButton: {
    // Additional styling if needed
  },
});

export default OAuthConsentModal;