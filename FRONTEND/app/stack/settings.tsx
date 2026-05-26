import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark and White</Text>
          <Text style={{ color: colors.text, opacity: 0.7 }}>Toggle between dark and light themes</Text>
        </View>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2, // Android shadow
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
});
