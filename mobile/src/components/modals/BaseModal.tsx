/**
 * BaseModal Component for React Native
 * 
 * A reusable modal component with styling and animations for mobile
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  scrollable?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BaseModal: React.FC<BaseModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  scrollable = true,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Handle hardware back button (Android) and gesture dismissal
  useEffect(() => {
    if (Platform.OS === 'android' && isOpen) {
      const backAction = () => {
        onClose();
        return true; // Prevent default behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }
    // Note: iOS back gesture is automatically handled by presentationStyle="pageSheet"
    // and the onRequestClose callback in the Modal component
  }, [isOpen, onClose]);

  const getModalSize = () => {
    switch (size) {
      case 'small':
        return {
          width: screenWidth * 0.85,
          maxHeight: screenHeight * 0.6,
        };
      case 'large':
        return {
          width: screenWidth * 0.95,
          maxHeight: screenHeight * 0.9,
        };
      default: // medium
        return {
          width: screenWidth * 0.9,
          maxHeight: screenHeight * 0.8,
        };
    }
  };

  const modalSize = getModalSize();

  const ContentComponent = scrollable ? ScrollView : View;
  const contentProps = scrollable 
    ? {
        contentContainerStyle: styles.scrollContent,
        showsVerticalScrollIndicator: false,
        bounces: false,
      }
    : {
        style: styles.staticContent,
      };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
      // iOS: Allow swipe-to-dismiss gesture
      {...(Platform.OS === 'ios' && {
        onShow: () => {
          // iOS automatically handles swipe gestures for pageSheet presentation
          // The onRequestClose will be called when user swipes down
        }
      })}
    >
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor: colors.background }
        ]}
      >
        {/* Status Bar Management for Android */}
        {Platform.OS === 'android' && (
          <StatusBar
            backgroundColor={colors.background}
            barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
          />
        )}

        {/* Modal Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text 
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {title}
            </Text>
            
            {showCloseButton && (
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: colors.surface || colors.background }]}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modal Content */}
        <View style={[styles.content, modalSize]}>
          <ContentComponent {...contentProps}>
            {children}
          </ContentComponent>
        </View>

        {/* Modal Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.footerButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.footerButtonText, { color: colors.text || '#FFFFFF' }]}>
              {t('common:actions.close', { defaultValue: 'Close' })}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignSelf: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  staticContent: {
    padding: 20,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BaseModal;