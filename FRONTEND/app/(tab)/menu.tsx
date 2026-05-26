import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

// Reusable Menu Item
// @ts-ignore
const MenuItem = ({ icon, label, color, onPress, themeColors }) => {
  const itemColor = color || themeColors.text;
  return (
    <Pressable style={[styles.menuItem, { backgroundColor: themeColors.card }]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={itemColor} />
      <Text style={[styles.menuText, { color: itemColor }]}>{label}</Text>
    </Pressable>
  );
};

// Main Menu Component
const Menu = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>Menu</Text>

      {/* Menu Items */}
      <MenuItem
        icon="person-outline"
        label="Profile"
        onPress={() => router.push("/stack/profile")}
        themeColors={colors}
      />
      <MenuItem 
        icon="settings-outline" 
        label="Settings" 
        onPress={() => router.push("/stack/settings")} 
        themeColors={colors} 
      />
      <MenuItem
        icon="information-circle-outline"
        label="About"
        onPress={undefined}
        themeColors={colors}
      />
      <MenuItem 
        icon="call-outline" 
        label="Contact" 
        onPress={undefined} 
        themeColors={colors} 
      />
      <MenuItem
        icon="alert-circle-outline"
        label="Report a Problem"
        onPress={undefined}
        themeColors={colors}
      />

      {/* Logout */}
      <MenuItem
        icon="log-out-outline"
        label="Logout"
        color="red"
        themeColors={colors}
        onPress={async () => {
          try {
            // Clear stored user info
            await AsyncStorage.removeItem("userEmail");
            await AsyncStorage.removeItem("userName");
            await AsyncStorage.removeItem("token");

            // Navigate to login (using replace so back button doesn't reopen app)
            router.replace("/stack/login");
          } catch (err) {
            console.log("Logout error:", err);
            alert("Could not log out. Try again.");
          }
        }}
      />
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 15,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2, // Android shadow
  },

  menuText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
  },
});
