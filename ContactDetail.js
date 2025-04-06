"use client"

import { useState, useContext, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  Animated,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { ContactsContext } from "../App"
import { ThemeContext } from "../context/ThemeContext"

export default function ContactDetail({ route, navigation }) {
  const { contact, isNew } = route.params || {}
  const { addContact, updateContact, deleteContact } = useContext(ContactsContext)
  const { theme } = useContext(ThemeContext)

  const [firstName, setFirstName] = useState(contact?.firstName || "")
  const [lastName, setLastName] = useState(contact?.lastName || "")
  const [phone, setPhone] = useState(contact?.phone || "")
  const [email, setEmail] = useState(contact?.email || "")
  const [note, setNote] = useState(contact?.note || "")
  const [posterImage, setPosterImage] = useState(contact?.posterImage || null)
  const [isSaving, setIsSaving] = useState(false)

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(50))[0]

  const handleSave = useCallback(async () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert("Error", "Name is required")
      return
    }

    if (!phone.trim()) {
      Alert.alert("Error", "Phone number is required")
      return
    }

    setIsSaving(true)

    const name = `${firstName} ${lastName}`.trim()

    const contactData = {
      id: contact?.id,
      name,
      firstName,
      lastName,
      phone,
      email,
      posterImage,
      note,
    }

    try {
      if (isNew) {
        await addContact(contactData)
      } else {
        await updateContact(contactData)
      }
      navigation.goBack()
    } catch (error) {
      console.error("Error saving contact:", error)
      Alert.alert("Error", "Failed to save contact")
    } finally {
      setIsSaving(false)
    }
  }, [firstName, lastName, phone, contact, isNew, addContact, updateContact, navigation, posterImage, email, note])

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Contact", `Are you sure you want to delete ${firstName} ${lastName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsSaving(true)
          try {
            await deleteContact(contact.id)
            navigation.goBack()
          } catch (error) {
            console.error("Error deleting contact:", error)
            Alert.alert("Error", "Failed to delete contact")
            setIsSaving(false)
          }
        },
      },
    ])
  }, [firstName, lastName, contact, deleteContact, navigation])

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    // Set up the header right button
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          {!isNew && (
            <TouchableOpacity style={{ marginRight: 20 }} onPress={handleDelete} disabled={isSaving}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={isSaving ? (theme === "dark" ? "#8e8e93" : "#ccc") : "#FF3B30"}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={{ marginRight: 16 }} onPress={handleSave} disabled={isSaving}>
            <Text
              style={{
                color: isSaving ? (theme === "dark" ? "#8e8e93" : "#ccc") : theme === "dark" ? "#0a84ff" : "#007AFF",
                fontSize: 17,
                fontWeight: "600",
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    })
  }, [
    navigation,
    firstName,
    lastName,
    phone,
    email,
    posterImage,
    isSaving,
    theme,
    fadeAnim,
    slideAnim,
    handleDelete,
    handleSave,
    isNew,
  ])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to select a contact image.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setPosterImage(result.assets[0].uri)
    }
  }

  const handleCreatePoster = () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert("Missing Information", "Please enter a name before creating a poster.")
      return
    }

    navigation.navigate("ContactPoster", {
      contact: {
        id: contact?.id,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        phone,
        email,
        posterImage,
      },
      onSavePoster: (uri) => {
        setPosterImage(uri)
      },
    })
  }

  const makePhoneCall = () => {
    const phoneUrl = `tel:${phone}`
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl)
        } else {
          Alert.alert("Error", "Phone calls are not supported on this device")
        }
      })
      .catch((err) => console.error("An error occurred", err))
  }

  const makeVideoCall = () => {
    // This would typically use FaceTime on iOS or another video call app
    // For now, we'll just simulate it by going to the call screen
    navigation.navigate("CallScreen", {
      contact: {
        name: `${firstName} ${lastName}`.trim(),
        phone,
        email,
        posterImage,
      },
    })
  }

  const sendMessage = () => {
    const smsUrl = `sms:${phone}`
    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(smsUrl)
        } else {
          Alert.alert("Error", "Messaging is not supported on this device")
        }
      })
      .catch((err) => console.error("An error occurred", err))
  }

  if (isSaving) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
        <Text style={[styles.loadingText, { color: theme === "dark" ? "#8e8e93" : "#666" }]}>
          {isNew ? "Adding contact..." : "Updating contact..."}
        </Text>
      </View>
    )
  }

  return (
    <Animated.ScrollView
      style={[
        styles.container,
        {
          backgroundColor: theme === "dark" ? "#000" : "#f2f2f7",
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}>
        {posterImage ? (
          <Image source={{ uri: posterImage }} style={styles.contactImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
            <Text style={styles.placeholderText}>{firstName ? firstName.charAt(0).toUpperCase() : "+"}</Text>
          </View>
        )}
        <View style={styles.imageActions}>
          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: theme === "dark" ? "#0a84ff" : "#007AFF" }]}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.posterButton, { backgroundColor: theme === "dark" ? "#5e5ce6" : "#5856D6" }]}
            onPress={handleCreatePoster}
          >
            <Ionicons name="color-palette-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Create Poster</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.formContainer,
          {
            backgroundColor: theme === "dark" ? "#1c1c1e" : "white",
            borderColor: theme === "dark" ? "#38383a" : "#e0e0e0",
          },
        ]}
      >
        <View style={[styles.inputGroup, { borderBottomColor: theme === "dark" ? "#38383a" : "#e0e0e0" }]}>
          <Ionicons
            name="person-outline"
            size={22}
            color={theme === "dark" ? "#8e8e93" : "#666"}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme === "dark" ? "#fff" : "#333" }]}
            placeholder="First name"
            placeholderTextColor={theme === "dark" ? "#8e8e93" : "#999"}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.inputGroup, { borderBottomColor: theme === "dark" ? "#38383a" : "#e0e0e0" }]}>
          <Ionicons
            name="person-outline"
            size={22}
            color={theme === "dark" ? "#8e8e93" : "#666"}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme === "dark" ? "#fff" : "#333" }]}
            placeholder="Last name"
            placeholderTextColor={theme === "dark" ? "#8e8e93" : "#999"}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.inputGroup, { borderBottomColor: theme === "dark" ? "#38383a" : "#e0e0e0" }]}>
          <Ionicons
            name="call-outline"
            size={22}
            color={theme === "dark" ? "#8e8e93" : "#666"}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme === "dark" ? "#fff" : "#333" }]}
            placeholder="Phone"
            placeholderTextColor={theme === "dark" ? "#8e8e93" : "#999"}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.inputGroup, { borderBottomColor: theme === "dark" ? "#38383a" : "#e0e0e0" }]}>
          <Ionicons
            name="mail-outline"
            size={22}
            color={theme === "dark" ? "#8e8e93" : "#666"}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme === "dark" ? "#fff" : "#333" }]}
            placeholder="Email"
            placeholderTextColor={theme === "dark" ? "#8e8e93" : "#999"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="create-outline"
            size={22}
            color={theme === "dark" ? "#8e8e93" : "#666"}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme === "dark" ? "#fff" : "#333" }]}
            placeholder="Notes"
            placeholderTextColor={theme === "dark" ? "#8e8e93" : "#999"}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
      </View>

      {!isNew && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={makePhoneCall}>
            <View style={[styles.actionIcon, { backgroundColor: "#34C759" }]}>
              <Ionicons name="call-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionText, { color: theme === "dark" ? "#fff" : "#333" }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={makeVideoCall}>
            <View style={[styles.actionIcon, { backgroundColor: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
              <Ionicons name="videocam-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionText, { color: theme === "dark" ? "#fff" : "#333" }]}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={sendMessage}>
            <View style={[styles.actionIcon, { backgroundColor: "#5e5ce6" }]}>
              <Ionicons name="chatbubble-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionText, { color: theme === "dark" ? "#fff" : "#333" }]}>Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isNew && (
        <TouchableOpacity
          style={[styles.deleteContactButton, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
          onPress={handleDelete}
        >
          <Text style={{ color: "#FF3B30", fontSize: 17 }}>Delete Contact</Text>
        </TouchableOpacity>
      )}
    </Animated.ScrollView>
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
  imageContainer: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  contactImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  posterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText: {
    color: "white",
    marginLeft: 6,
    fontWeight: "600",
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontWeight: "500",
    fontSize: 14,
  },
  deleteContactButton: {
    marginTop: 40,
    marginBottom: 40,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
})

