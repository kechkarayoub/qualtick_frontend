/**
 * DashboardScreen Component
 *
 * Main dashboard screen for authenticated users.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../contexts/ThemeContext';
import useAuth from '../../hooks/useAuth';
import AppHeader from '../../components/AppHeader';

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();

  const stats = [
    { key: 'totalSessions', value: '24', color: colors.primary },
    { key: 'successes', value: '18', color: colors.success },
    { key: 'failures', value: '6', color: colors.error },
    { key: 'successRate', value: '75%', color: '#7C3AED' },
  ];

  const displayName = user?.first_name || user?.username || t('common:user.guest', { defaultValue: 'Guest' });

  return (
    <>
      <AppHeader title={t('dashboard:title')} showBackButton={false} />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.heroTitle, { color: colors.text }]}> 
            {t('dashboard:welcome', { name: displayName })}
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}> 
            {t('dashboard:description')}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.key} style={[styles.statCard, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}> 
                {t(`dashboard:stats.${item.key}`)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}> 
            {t('dashboard:quickActions.title')}
          </Text>

          <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]}> 
            <Text style={[styles.actionButtonText, { color: colors.text }]}> 
              {t('dashboard:quickActions.findProfessionals')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]}> 
            <Text style={[styles.actionButtonText, { color: colors.text }]}> 
              {t('dashboard:quickActions.viewStats')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
    width: '48%',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 13,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionButton: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DashboardScreen;
