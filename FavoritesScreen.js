"use client"

import { useContext } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ContactsContext } from "../App"
import { ThemeContext } from "../context/ThemeContext"

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite } = useContext(ContactsContext)
  const { theme } = useContext(ThemeContext)

  const makePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`
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

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.favoriteItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
      onPress={() => navigation.navigate("ContactDetail", { contact: item, isNew: false })}
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
            styles.favoriteButton,
            { backgroundColor: theme === "dark" ? "rgba(255, 204, 0, 0.2)" : "rgba(255, 204, 0, 0.1)" },
          ]}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons name="star" size={22} color="#FFCC00" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={60} color={theme === "dark" ? "#8e8e93" : "#ccc"} />
          <Text style={[styles.emptyText, { color: theme === "dark" ? "#8e8e93" : "#999" }]}>No Favorites</Text>
          <Text style={[styles.emptySubText, { color: theme === "dark" ? "#8e8e93" : "#999" }]}>
            Add contacts to favorites for quick access
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  favoriteButton: {
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
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

