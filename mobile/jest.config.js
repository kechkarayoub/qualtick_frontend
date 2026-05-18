module.exports = {
  preset: 'react-native',
  // The react-native preset ignores all node_modules by default.
  // These packages ship ESM source that Jest must transform through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-firebase|@react-native-google-signin|@react-native-community|react-native-toast-message|react-native-bootsplash|react-native-device-info|@react-navigation)/).*',
  ],
};
