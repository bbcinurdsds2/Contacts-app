"use client"

import { useContext, useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Animated,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ContactsContext } from "../App"
import { ThemeContext } from "../context/ThemeContext"

const { width } = Dimensions.get("window")

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function ContactsList({ navigation }) {
  const { contacts, isLoading, loadDeviceContacts } = useContext(ContactsContext)
  const { theme } = useContext(ThemeContext)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [sections, setSections] = useState([])

  // Animation values for button press
  const buttonScale = useRef(new Animated.Value(1)).current

  // Prepare sections for the section list
  useEffect(() => {
    if (contacts.length === 0) return

    // Filter contacts based on search query
    const filteredContacts = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phone && contact.phone.includes(searchQuery)),
    )

    // Group contacts by first letter
    const contactsByLetter = {}
    const specialSection = { title: "★", data: [] }

    filteredContacts.forEach((contact) => {
      // Get the first letter of the contact's name
      const firstLetter = contact.name.charAt(0).toUpperCase()

      // Check if the first letter is alphabetic
      if (/[A-Z]/.test(firstLetter)) {
        if (!contactsByLetter[firstLetter]) {
          contactsByLetter[firstLetter] = []
        }
        contactsByLetter[firstLetter].push(contact)
      } else {
        // Add to special section for non-alphabetic characters
        specialSection.data.push(contact)
      }
    })

    // Convert the grouped contacts into sections
    let sectionArray = Object.keys(contactsByLetter).map((letter) => ({
      title: letter,
      data: contactsByLetter[letter],
    }))

    // Sort sections alphabetically
    sectionArray.sort((a, b) => a.title.localeCompare(b.title))

    // Add special section at the beginning if it has data
    if (specialSection.data.length > 0) {
      sectionArray = [specialSection, ...sectionArray]
    }

    setSections(sectionArray)
  }, [contacts, searchQuery])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDeviceContacts()
    setRefreshing(false)
  }

  const handleContactPress = (contact) => {
    navigation.navigate("ContactDetail", { contact, isNew: false })
  }

  const makePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          // On Android, this will still show the chooser the first time
          // But if the user selects "Always" it will remember their choice
          Linking.openURL(phoneUrl)
        } else {
          Alert.alert("Error", "Phone calls are not supported on this device")
        }
      })
      .catch((err) => console.error("An error occurred", err))
  }

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start()
  }

  const renderContactItem = ({ item }) => (
    <AnimatedTouchable
      style={[
        styles.contactItem,
        {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "white",
          transform: [{ scale: buttonScale }],
        },
      ]}
      onPress={() => handleContactPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <View style={styles.contactInfo}>
        {item.posterImage ? (
          <Image source={{ uri: item.posterImage }} style={styles.contactImage} />
        ) : (
          <View style={[styles.contactInitial, { backgroundColor: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
            <Text style={styles.initialText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: theme === "dark" ? "#fff" : "#000" }]}>{item.name}</Text>
          {item.phone && (
            <Text style={[styles.contactPhone, { color: theme === "dark" ? "#8e8e93" : "#666" }]}>{item.phone}</Text>
          )}
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[
            styles.callButton,
            { backgroundColor: theme === "dark" ? "rgba(52, 199, 89, 0.2)" : "rgba(52, 199, 89, 0.1)" },
          ]}
          onPress={() => makePhoneCall(item.phone)}
        >
          <Ionicons name="call-outline" size={22} color="#34C759" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.videoButton,
            { backgroundColor: theme === "dark" ? "rgba(10, 132, 255, 0.2)" : "rgba(0, 122, 255, 0.1)" },
          ]}
          onPress={() => navigation.navigate("CallScreen", { contact: item })}
        >
          <Ionicons name="videocam-outline" size={22} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        </TouchableOpacity>
      </View>
    </AnimatedTouchable>
  )

  const renderSectionHeader = ({ section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
      <Text style={[styles.sectionHeaderText, { color: theme === "dark" ? "#8e8e93" : "#8e8e93" }]}>
        {section.title}
      </Text>
    </View>
  )

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        <Text style={[styles.loadingText, { color: theme === "dark" ? "#8e8e93" : "#666" }]}>Loading contacts...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme === "dark" ? "#1c1c1e" : "#e8e8e8" }]}>
        <Ionicons
          name="search-outline"
          size={20}
          color={theme === "dark" ? "#8e8e93" : "#666"}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme === "dark" ? "#fff" : "#333" }]}
          placeholder="Search"
          placeholderTextColor={theme === "dark" ? "#8e8e93" : "#8e8e93"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={theme === "dark" ? "#8e8e93" : "#666"} />
          </TouchableOpacity>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme === "dark" ? "#0a84ff" : "#007AFF"]}
            tintColor={theme === "dark" ? "#0a84ff" : "#007AFF"}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={60} color={theme === "dark" ? "#8e8e93" : "#ccc"} />
            <Text style={[styles.emptyText, { color: theme === "dark" ? "#8e8e93" : "#999" }]}>
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </Text>
            <Text style={[styles.emptySubText, { color: theme === "dark" ? "#8e8e93" : "#999" }]}>
              {searchQuery ? "Try a different search term" : "Add contacts to get started"}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contactInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  initialText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  callButton: {
    padding: 10,
    marginRight: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  videoButton: {
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    padding: 8,
    paddingLeft: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
})

