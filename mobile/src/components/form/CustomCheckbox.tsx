/**
 * CustomCheckbox Component
 * 
 * A custom checkbox component for React Native forms
 */

import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomCheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string | ReactNode;
  error?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  testID?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
  label,
  error,
  disabled = false,
  size = 'medium',
  style,
  labelStyle,
  testID,
}) => {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 18, height: 18, fontSize: 12 };
      case 'large':
        return { width: 26, height: 26, fontSize: 16 };
      default:
        return { width: 22, height: 22, fontSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  const checkboxStyle = [
    styles.checkbox,
    {
      width: sizeStyles.width,
      height: sizeStyles.height,
      backgroundColor: value ? colors.primary : 'transparent',
      borderColor: error ? colors.error : (value ? colors.primary : colors.border),
    },
    disabled && styles.disabled,
  ];

  const labelTextStyle = [
    styles.label,
    { 
      color: error ? colors.error : colors.text,
      fontSize: sizeStyles.fontSize + 2,
    },
    disabled && { color: colors.textSecondary },
    labelStyle,
  ];

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        <View style={checkboxStyle}>
          {value && (
            <Text style={styles.checkmark}>
              ✓
            </Text>
          )}
        </View>
        {label && (
          typeof label === 'string' ? (
            <Text style={labelTextStyle}>
              {label}
            </Text>
          ) : (
            <View style={styles.labelContainer}>
              {label}
            </View>
          )
        )}
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
    color: '#FFFFFF',
  },
  label: {
    flex: 1,
    lineHeight: 20,
  },
  labelContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 34, // Align with label text
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomCheckbox;