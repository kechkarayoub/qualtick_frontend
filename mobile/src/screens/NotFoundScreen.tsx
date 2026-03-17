/**
 * NotFoundScreen
 *
 * Fallback screen for unknown routes/deep links.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import CustomButton from '../components/form/CustomButton';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../contexts/ThemeContext';

const NotFoundScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <>
      <AppHeader title={t('common:navigation.pageNotFound')} showBackButton={false} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('common:navigation.pageNotFound')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}> 
          {t('common:errors.somethingWentWrong')}
        </Text>

        <CustomButton
          title={t('navigation:home')}
          onPress={() => navigation.navigate('MainStack')}
          variant="primary"
          fullWidth
          style={styles.button}
          loadingTitle={t('navigation:home')}
        />

        <CustomButton
          title={t('auth:login.signIn')}
          onPress={() => navigation.navigate('AuthStack')}
          variant="outline"
          fullWidth
          style={styles.button}
          loadingTitle={t('auth:login.signIn')}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
});

export default NotFoundScreen;
