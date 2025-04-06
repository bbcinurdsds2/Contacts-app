"use client"

import { useState, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Linking,
  Platform,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ContactsContext } from "../App"
import { ThemeContext } from "../context/ThemeContext"

export default function GroupsScreen() {
  const { contacts } = useContext(ContactsContext)
  const { theme } = useContext(ThemeContext)
  const [groups, setGroups] = useState([
    { id: "1", name: "Family", members: [] },
    { id: "2", name: "Work", members: [] },
    { id: "3", name: "Friends", members: [] },
  ])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)

  const handleCreateGroup = () => {
    setIsCreatingGroup(true)
    setNewGroupName("")
    setSelectedContacts([])
    setModalVisible(true)
  }

  const handleEditGroup = (group) => {
    setIsCreatingGroup(false)
    setSelectedGroup(group)
    setNewGroupName(group.name)
    setSelectedContacts(group.members)
    setModalVisible(true)
  }

  const handleSaveGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name")
      return
    }

    if (selectedContacts.length === 0) {
      Alert.alert("Error", "Please select at least one contact")
      return
    }

    if (isCreatingGroup) {
      // Create new group
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        members: selectedContacts,
      }
      setGroups([...groups, newGroup])
    } else {
      // Update existing group
      const updatedGroups = groups.map((group) =>
        group.id === selectedGroup.id ? { ...group, name: newGroupName.trim(), members: selectedContacts } : group,
      )
      setGroups(updatedGroups)
    }

    setModalVisible(false)
  }

  const handleDeleteGroup = (groupId) => {
    Alert.alert("Delete Group", "Are you sure you want to delete this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedGroups = groups.filter((group) => group.id !== groupId)
          setGroups(updatedGroups)
          setModalVisible(false)
        },
      },
    ])
  }

  const toggleContactSelection = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId))
    } else {
      setSelectedContacts([...selectedContacts, contactId])
    }
  }

  const handleMessageGroup = (group) => {
    const groupMembers = contacts.filter((contact) => group.members.includes(contact.id))
    const phoneNumbers = groupMembers.map((member) => member.phone).filter(Boolean)

    if (phoneNumbers.length === 0) {
      Alert.alert("Error", "No valid phone numbers in this group")
      return
    }

    // On iOS, we can use the group messaging feature
    if (Platform.OS === "ios") {
      const smsUrl = `sms:${phoneNumbers.join(",")}`
      Linking.canOpenURL(smsUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(smsUrl)
          } else {
            Alert.alert("Error", "Messaging is not supported on this device")
          }
        })
        .catch((err) => console.error("An error occurred", err))
    } else {
      // On Android, we might need to use a different approach
      // For now, just show the first number
      const smsUrl = `sms:${phoneNumbers[0]}`
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
  }

  const renderGroupItem = ({ item }) => {
    const memberCount = item.members.length
    const groupMembers = contacts.filter((contact) => item.members.includes(contact.id))

    return (
      <TouchableOpacity
        style={[styles.groupItem, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
        onPress={() => handleEditGroup(item)}
      >
        <View style={styles.groupInfo}>
          <View style={[styles.groupIcon, { backgroundColor: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
            <Ionicons name="people" size={24} color="white" />
          </View>
          <View style={styles.groupDetails}>
            <Text style={[styles.groupName, { color: theme === "dark" ? "#fff" : "#000" }]}>{item.name}</Text>
            <Text style={[styles.memberCount, { color: theme === "dark" ? "#8e8e93" : "#666" }]}>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.messageButton,
            { backgroundColor: theme === "dark" ? "rgba(94, 92, 230, 0.2)" : "rgba(94, 92, 230, 0.1)" },
          ]}
          onPress={() => handleMessageGroup(item)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#5e5ce6" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" },
        selectedContacts.includes(item.id) && {
          backgroundColor: theme === "dark" ? "rgba(10, 132, 255, 0.2)" : "rgba(0, 122, 255, 0.1)",
        },
      ]}
      onPress={() => toggleContactSelection(item.id)}
    >
      <View style={styles.contactInfo}>
        {item.posterImage ? (
          <Image source={{ uri: item.posterImage }} style={styles.contactImage} />
        ) : (
          <View style={[styles.contactInitial, { backgroundColor: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
            <Text style={styles.initialText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <Text style={[styles.contactName, { color: theme === "dark" ? "#fff" : "#000" }]}>{item.name}</Text>
      </View>
      {selectedContacts.includes(item.id) && (
        <Ionicons name="checkmark-circle" size={24} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
      )}
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.createGroupButton, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}
            onPress={handleCreateGroup}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme === "dark" ? "#0a84ff" : "#007AFF"} />
            <Text style={[styles.createGroupText, { color: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
              Create New Group
            </Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={theme === "dark" ? "#8e8e93" : "#ccc"} />
            <Text style={[styles.emptyText, { color: theme === "dark" ? "#8e8e93" : "#999" }]}>No Groups</Text>
            <Text style={[styles.emptySubText, { color: theme === "dark" ? "#8e8e93" : "#999" }]}>
              Create groups to message multiple contacts at once
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme === "dark" ? "#1c1c1e" : "white" }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: theme === "dark" ? "#0a84ff" : "#007AFF" }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme === "dark" ? "#fff" : "#000" }]}>
                {isCreatingGroup ? "New Group" : "Edit Group"}
              </Text>
              <TouchableOpacity onPress={handleSaveGroup}>
                <Text style={{ color: theme === "dark" ? "#0a84ff" : "#007AFF" }}>Save</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.groupNameInput,
                {
                  backgroundColor: theme === "dark" ? "#2c2c2e" : "#f2f2f7",
                  color: theme === "dark" ? "#fff" : "#000",
                },
              ]}
              placeholder="Group Name"
              placeholderTextColor={theme === "dark" ? "#8e8e93" : "#999"}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <Text style={[styles.sectionTitle, { color: theme === "dark" ? "#fff" : "#000" }]}>Select Contacts</Text>

            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              style={styles.contactsList}
            />

            {!isCreatingGroup && (
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: theme === "dark" ? "#2c2c2e" : "#f2f2f7" }]}
                onPress={() => handleDeleteGroup(selectedGroup.id)}
              >
                <Text style={{ color: "#FF3B30" }}>Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  createGroupText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  groupItem: {
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
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
  },
  messageButton: {
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  groupNameInput: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  contactsList: {
    flex: 1,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  initialText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
})

