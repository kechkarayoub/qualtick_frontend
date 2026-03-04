/**
 * ContactModal Component for React Native
 * 
 * Modal displaying contact information for the Qualitick platform
 */

import React from 'react';
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

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { content, loading, error } = useModalContent('contact');

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

  const handleWebsitePress = (website: string) => {
    Linking.openURL(website);
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

    const contactContent = content.content as any;

    return (
      <View style={styles.contentContainer}>
        {/* Introduction */}
        {contactContent.introduction && (
          <View style={styles.section}>
            <Text style={[styles.text, { color: colors.text }]}>
              {contactContent.introduction.text}
            </Text>
          </View>
        )}

        {/* Contact Methods */}
        {contactContent.methods && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {contactContent.methods.title}
            </Text>
            {contactContent.methods.items?.map((method: any, index: number) => (
              <View key={index} style={styles.contactMethod}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  {method.title}
                </Text>
                <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                  {method.description}
                </Text>
                {method.value && method.type === 'email' && (
                  <TouchableOpacity onPress={() => handleEmailPress(method.value)}>
                    <Text style={[styles.contactLink, { color: colors.primary }]}>
                      {method.value}
                    </Text>
                  </TouchableOpacity>
                )}
                {method.value && method.type === 'phone' && (
                  <TouchableOpacity onPress={() => handlePhonePress(method.value)}>
                    <Text style={[styles.contactLink, { color: colors.primary }]}>
                      {method.value}
                    </Text>
                  </TouchableOpacity>
                )}
                {method.value && method.type === 'website' && (
                  <TouchableOpacity onPress={() => handleWebsitePress(method.value)}>
                    <Text style={[styles.contactLink, { color: colors.primary }]}>
                      {method.value}
                    </Text>
                  </TouchableOpacity>
                )}
                {method.value && !method.type && (
                  <Text style={[styles.contactValue, { color: colors.text }]}>
                    {method.value}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Office Hours */}
        {contactContent.hours && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {contactContent.hours.title}
            </Text>
            {contactContent.hours.items?.map((hour: any, index: number) => (
              <View key={index} style={styles.hoursItem}>
                <Text style={[styles.hoursDay, { color: colors.text }]}>
                  {hour.day}
                </Text>
                <Text style={[styles.hoursTime, { color: colors.textSecondary }]}>
                  {hour.time}
                </Text>
              </View>
            ))}
            {contactContent.hours.note && (
              <Text style={[styles.hoursNote, { color: colors.textSecondary }]}>
                {contactContent.hours.note}
              </Text>
            )}
          </View>
        )}

        {/* Address */}
        {contactContent.address && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {contactContent.address.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {contactContent.address.street}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {contactContent.address.city}, {contactContent.address.state} {contactContent.address.zip}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {contactContent.address.country}
            </Text>
          </View>
        )}

        {/* Support */}
        {contactContent.support && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {contactContent.support.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {contactContent.support.description}
            </Text>
            {contactContent.support.email && (
              <TouchableOpacity onPress={() => handleEmailPress(contactContent.support.email)}>
                <Text style={[styles.contactLink, { color: colors.primary }]}>
                  {contactContent.support.email}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Emergency Contact */}
        {contactContent.emergency && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              {contactContent.emergency.title}
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {contactContent.emergency.description}
            </Text>
            {contactContent.emergency.phone && (
              <TouchableOpacity onPress={() => handlePhonePress(contactContent.emergency.phone)}>
                <Text style={[styles.emergencyLink, { color: colors.error }]}>
                  {contactContent.emergency.phone}
                </Text>
              </TouchableOpacity>
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
      title={t('contact:title', { defaultValue: 'Contact Us' })}
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
  contactMethod: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  contactLink: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hoursDay: {
    fontSize: 16,
    fontWeight: '500',
  },
  hoursTime: {
    fontSize: 16,
  },
  hoursNote: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emergencyLink: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
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

export default ContactModal;