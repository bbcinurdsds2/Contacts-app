"use client"

import React, { useState, useEffect, useContext } from "react"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import * as Contacts from "expo-contacts"
import { Alert, useColorScheme, Appearance, AppState, View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import ContactsList from "./components/ContactsList"
import ContactDetail from "./components/ContactDetail"
import ContactPoster from "./components/ContactPoster"
import CallScreen from "./components/CallScreen"
import Keypad from "./components/Keypad"
import FavoritesScreen from "./components/FavoritesScreen"
import GroupsScreen from "./components/GroupsScreen"
import SettingsScreen from "./components/SettingsScreen"
import { ThemeProvider, ThemeContext } from "./context/ThemeContext"

// Create a context for contacts
export const ContactsContext = React.createContext()

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Custom header button component
export const HeaderButton = ({ onPress, icon, color }) => (
  <TouchableOpacity
    style={{
      marginHorizontal: 15,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
    }}
    onPress={onPress}
  >
    <Ionicons name={icon} size={22} color={color} />
  </TouchableOpacity>
)

function ContactsStack() {
  const { theme } = useContext(ThemeContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme === "dark" ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "600",
        },
        cardStyle: {
          backgroundColor: theme === "dark" ? "#000" : "#f2f2f7",
        },
      }}
    >
      <Stack.Screen
        name="ContactsList"
        component={ContactsList}
        options={({ navigation }) => ({
          title: "Contacts",
          headerRight: () => (
            <HeaderButton
              icon="pencil-outline"
              color={theme === "dark" ? "#0a84ff" : "#007AFF"}
              onPress={() => navigation.navigate("ContactDetail", { isNew: true })}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ContactDetail"
        component={ContactDetail}
        options={({ route }) => ({
          title: route.params?.isNew ? "New Contact" : "Contact Details",
        })}
      />
      <Stack.Screen name="ContactPoster" component={ContactPoster} options={{ title: "Contact Poster" }} />
      <Stack.Screen name="CallScreen" component={CallScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function KeypadStack() {
  const { theme } = useContext(ThemeContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme === "dark" ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "600",
        },
        cardStyle: {
          backgroundColor: theme === "dark" ? "#000" : "#f2f2f7",
        },
      }}
    >
      <Stack.Screen name="Keypad" component={Keypad} options={{ title: "Keypad" }} />
    </Stack.Navigator>
  )
}

function FavoritesStack() {
  const { theme } = useContext(ThemeContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme === "dark" ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "600",
        },
        cardStyle: {
          backgroundColor: theme === "dark" ? "#000" : "#f2f2f7",
        },
      }}
    >
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favorites" }} />
    </Stack.Navigator>
  )
}

function GroupsStack() {
  const { theme } = useContext(ThemeContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme === "dark" ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "600",
        },
        cardStyle: {
          backgroundColor: theme === "dark" ? "#000" : "#f2f2f7",
        },
      }}
    >
      <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: "Groups" }} />
    </Stack.Navigator>
  )
}

function SettingsStack() {
  const { theme } = useContext(ThemeContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme === "dark" ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "600",
        },
        cardStyle: {
          backgroundColor: theme === "dark" ? "#000" : "#f2f2f7",
        },
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Stack.Navigator>
  )
}

function TabNavigator() {
  const { theme } = useContext(ThemeContext)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "ContactsTab") {
            iconName = focused ? "people" : "people-outline"
          } else if (route.name === "FavoritesTab") {
            iconName = focused ? "star" : "star-outline"
          } else if (route.name === "KeypadTab") {
            iconName = focused ? "keypad" : "keypad-outline"
          } else if (route.name === "GroupsTab") {
            iconName = focused ? "people-circle" : "people-circle-outline"
          } else if (route.name === "SettingsTab") {
            iconName = focused ? "settings" : "settings-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme === "dark" ? "#0a84ff" : "#007AFF",
        tabBarInactiveTintColor: theme === "dark" ? "#8e8e93" : "#8e8e93",
        tabBarStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
          borderTopColor: theme === "dark" ? "#38383a" : "#d1d1d6",
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="FavoritesTab" component={FavoritesStack} options={{ title: "Favorites" }} />
      <Tab.Screen name="ContactsTab" component={ContactsStack} options={{ title: "Contacts" }} />
      <Tab.Screen name="GroupsTab" component={GroupsStack} options={{ title: "Groups" }} />
      <Tab.Screen name="KeypadTab" component={KeypadStack} options={{ title: "Keypad" }} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{ title: "Settings" }} />
    </Tab.Navigator>
  )
}

function AppContent() {
  const [contacts, setContacts] = useState([])
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useContext(ThemeContext)

  // Load contacts from device on app start
  useEffect(() => {
    loadDeviceContacts()

    // Listen for app state changes to refresh contacts when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        loadDeviceContacts()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const loadDeviceContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "This app needs access to your contacts to function properly.", [
          { text: "OK", onPress: () => setIsLoading(false) },
        ])
        return
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.ID,
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
          Contacts.Fields.ImageAvailable,
          Contacts.Fields.Note,
        ],
        sort: Contacts.SortTypes.FirstName,
      })

      if (data.length > 0) {
        // Transform contacts to our app format
        const formattedContacts = data
          .map((contact) => ({
            id: contact.id,
            name: contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
            firstName: contact.firstName || "",
            lastName: contact.lastName || "",
            phone:
              contact.phoneNumbers && contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].number : "",
            phoneNumbers: contact.phoneNumbers || [],
            email: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : "",
            emails: contact.emails || [],
            posterImage: contact.imageAvailable ? contact.image.uri : null,
            note: contact.note || "",
            isFavorite: false, // We'll set this based on user preferences
            rawContact: contact, // Keep the raw contact data for reference
          }))
          .filter((contact) => contact.name) // Only include contacts with names

        // Sort contacts alphabetically
        formattedContacts.sort((a, b) => a.name.localeCompare(b.name))

        // Load favorites from AsyncStorage or another source
        // For now, we'll just set the first few contacts as favorites
        const sampleFavorites = formattedContacts.slice(0, 5).map((contact) => ({
          ...contact,
          isFavorite: true,
        }))

        setContacts(formattedContacts)
        setFavorites(sampleFavorites)
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
      Alert.alert("Error", "Failed to load contacts from your device.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new contact
  const addContact = async (newContact) => {
    try {
      const contactData = {
        [Contacts.Fields.FirstName]: newContact.firstName || newContact.name.split(" ")[0],
        [Contacts.Fields.LastName]: newContact.lastName || newContact.name.split(" ").slice(1).join(" "),
        [Contacts.Fields.PhoneNumbers]: [
          {
            label: "mobile",
            number: newContact.phone,
          },
        ],
        [Contacts.Fields.Emails]: newContact.email
          ? [
              {
                label: "home",
                email: newContact.email,
              },
            ]
          : undefined,
        [Contacts.Fields.Image]: newContact.posterImage,
        [Contacts.Fields.Note]: newContact.note,
      }

      const contactId = await Contacts.addContactAsync(contactData)

      // Reload contacts to get the new one with proper ID
      loadDeviceContacts()

      return contactId
    } catch (error) {
      console.error("Error adding contact:", error)
      Alert.alert("Error", "Failed to add contact to your device.")
      return null
    }
  }

  // Update an existing contact
  const updateContact = async (updatedContact) => {
    try {
      // Find the original contact to get the raw data
      const originalContact = contacts.find((c) => c.id === updatedContact.id)
      if (!originalContact || !originalContact.rawContact) {
        throw new Error("Original contact not found")
      }

      const contactData = {
        ...originalContact.rawContact,
        [Contacts.Fields.FirstName]: updatedContact.firstName || updatedContact.name.split(" ")[0],
        [Contacts.Fields.LastName]: updatedContact.lastName || updatedContact.name.split(" ").slice(1).join(" "),
        [Contacts.Fields.PhoneNumbers]: [
          {
            label: "mobile",
            number: updatedContact.phone,
          },
        ],
        [Contacts.Fields.Emails]: updatedContact.email
          ? [
              {
                label: "home",
                email: updatedContact.email,
              },
            ]
          : undefined,
        [Contacts.Fields.Image]: updatedContact.posterImage,
        [Contacts.Fields.Note]: updatedContact.note,
      }

      await Contacts.updateContactAsync(contactData)

      // Reload contacts to get the updated data
      loadDeviceContacts()

      return true
    } catch (error) {
      console.error("Error updating contact:", error)
      Alert.alert("Error", "Failed to update contact on your device.")
      return false
    }
  }

  // Delete a contact
  const deleteContact = async (contactId) => {
    try {
      // Find the original contact to get the raw data
      const contact = contacts.find((c) => c.id === contactId)
      if (!contact || !contact.rawContact) {
        throw new Error("Contact not found")
      }

      await Contacts.removeContactAsync(contactId)

      // Update local state
      setContacts((prevContacts) => prevContacts.filter((c) => c.id !== contactId))
      setFavorites((prevFavorites) => prevFavorites.filter((c) => c.id !== contactId))

      return true
    } catch (error) {
      console.error("Error deleting contact:", error)
      Alert.alert("Error", "Failed to delete contact from your device.")
      return false
    }
  }

  // Toggle favorite status
  const toggleFavorite = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (!contact) return

    const isFavorite = favorites.some((f) => f.id === contactId)

    if (isFavorite) {
      // Remove from favorites
      setFavorites((prevFavorites) => prevFavorites.filter((f) => f.id !== contactId))
    } else {
      // Add to favorites
      setFavorites((prevFavorites) => [...prevFavorites, contact])
    }
  }

  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <ContactsContext.Provider
        value={{
          contacts,
          favorites,
          isLoading,
          loadDeviceContacts,
          addContact,
          updateContact,
          deleteContact,
          toggleFavorite,
        }}
      >
        <TabNavigator />
      </ContactsContext.Provider>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
