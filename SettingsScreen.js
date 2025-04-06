"use client"

import { useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"
import { ContactsContext } from "../App"
import * as Contacts from "expo-contacts"

export default function SettingsScreen() {
  const { theme, themeMode, setThemePreference } = useContext(ThemeContext)
  const { loadDeviceContacts } = useContext(ContactsContext)

  const handleThemeChange = (mode) => {
    setThemePreference(mode)
  }

  const handleRefreshContacts = async () => {
    Alert.alert("Refresh Contacts", "This will reload all contacts from your device. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Refresh",
        onPress: async () => {
          await loadDeviceContacts()
          Alert.alert("Success", "Contacts refreshed successfully")
        },
      },
    ])
  }

  const handleExportContacts = async () => {
    Alert.alert(
      "Export Contacts",
      "This feature would export your contacts to a file. This is a placeholder for demonstration purposes.",
      [{ text: "OK" }]
    )
  }

  const handleImportContacts = async () => {
    Alert.alert(
      "Import Contacts",
      "This feature would import contacts from a file. This is a placeholder for demonstration purposes.",
      [{ text: "OK" }]
    )
  }

  const handleContactPermissions = async () => {
    const { status } = await Contacts.requestPermissionsAsync()
    Alert.alert(
      "Contact Permissions",
      `Current permission status: ${status}`,
      [
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:")
            } else {
              Linking.openSettings()
            }
          },
        },
        { text: "OK" },
      ]
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme === "dark" ? "#8e8e93" : "#8e8e93" }]}>APPEARANCE</Text>

        <View style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}>
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Theme</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "light" && {
                  backgroundColor: theme === "dark" ? "#2c2c2e" : "#e5e5ea",
                },
              ]}
              onPress={() => handleThemeChange("light")}
            >
              <Ionicons name="sunny-outline" size={20} color={theme === "dark" ? "#fff" : "#000"} />
              <Text style={[styles.themeText, { color: theme === "dark" ? "#fff" : "#000" }]}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "dark" && {
                  backgroundColor: theme === "dark" ? "#2c2c2e" : "#e5e5ea",
                },
              ]}
              onPress={() => handleThemeChange("dark")}
            >
              <Ionicons name="moon-outline" size={20} color={theme === "dark" ? "#fff" : "#000"} />
              <Text style={[styles.themeText, { color: theme === "dark" ? "#fff" : "#000" }]}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "system" && {
                  backgroundColor: theme === "dark" ? "#2c2c2e" : "#e5e5ea",
                },
              ]}
              onPress={() => handleThemeChange("system")}
            >
              <Ionicons name="settings-outline" size={20} color={theme === "dark" ? "#fff" : "#000"} />
              <Text style={[styles.themeText, { color: theme === "dark" ? "#fff" : "#000" }]}>System</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme === "dark" ? "#8e8e93" : "#8e8e93" }]}>CONTACTS</Text>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={handleRefreshContacts}
        >
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Refresh Contacts</Text>
          <Ionicons name="refresh-outline" size={24} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={handleExportContacts}
        >
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Export Contacts</Text>
          <Ionicons name="download-outline" size={24} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={handleImportContacts}
        >
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Import Contacts</Text>
          <Ionicons name="upload-outline" size={24} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={handleContactPermissions}
        >
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Contact Permissions</Text>
          <Ionicons name="key-outline" size={24} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme === "dark" ? "#8e8e93" : "#8e8e93" }]}>ABOUT</Text>

        <View style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}>
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Version</Text>
          <Text style={[styles.settingValue, { color: theme === "dark" ? "#8e8e93" : "#8e8e93" }]}>1.0.0</Text>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={() => Linking.openURL("https://example.com/privacy")}
        >
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={theme === "dark" ? "#8e8e93" : "#8e8e93"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={() => Linking.openURL("https://example.com/terms")}
        >
          <Text style={[styles.settingLabel, { color: theme === "dark" ? "#fff" : "#000" }]}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color={theme === "dark" ? "#8e8e93" : "#8e8e93"} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d1d6",
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  themeOptions: {
    flexDirection: "row",
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  themeText: {
    marginLeft: 4,
    fontSize: 14,
  },
})
