"use client"

import { useState, useRef, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Linking,
  Alert,
  Animated,
  Vibration,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"

const { width } = Dimensions.get("window")

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function Keypad({ navigation }) {
  const { theme } = useContext(ThemeContext)
  const [phoneNumber, setPhoneNumber] = useState("")
  const buttonScales = useRef(
    Array(12)
      .fill(0)
      .map(() => new Animated.Value(1)),
  ).current

  const handleDigitPress = (digit, index) => {
    setPhoneNumber((prev) => prev + digit)

    // Vibration feedback
    if (Platform.OS === "ios") {
      // iOS uses different vibration API
      const impactHeavy = true
      if (impactHeavy) {
        Vibration.vibrate(10)
      }
    } else {
      // Android vibration
      Vibration.vibrate(20)
    }

    // Button animation
    Animated.sequence([
      Animated.timing(buttonScales[index], {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScales[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleDeletePress = () => {
    setPhoneNumber((prev) => prev.slice(0, -1))

    // Vibration feedback
    if (Platform.OS === "ios") {
      Vibration.vibrate(10)
    } else {
      Vibration.vibrate(20)
    }
  }

  const handleCallPress = () => {
    if (phoneNumber.length > 0) {
      // Use Linking to make an actual phone call
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
    } else {
      Alert.alert("Error", "Please enter a phone number")
    }
  }

  const renderKeypadButton = (digit, letters = "", index) => (
    <AnimatedTouchable
      style={[
        styles.keypadButton,
        {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "white",
          transform: [{ scale: buttonScales[index] }],
        },
      ]}
      onPress={() => handleDigitPress(digit, index)}
      activeOpacity={0.7}
    >
      <Text style={[styles.digitText, { color: theme === "dark" ? "#fff" : "#333" }]}>{digit}</Text>
      {letters ? (
        <Text style={[styles.lettersText, { color: theme === "dark" ? "#8e8e93" : "#666" }]}>{letters}</Text>
      ) : null}
    </AnimatedTouchable>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }]}>
      <View style={styles.phoneNumberContainer}>
        <TextInput
          style={[styles.phoneNumberInput, { color: theme === "dark" ? "#fff" : "#333" }]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          editable={true}
          selectionColor={theme === "dark" ? "#0a84ff" : "#007AFF"}
        />
        {phoneNumber.length > 0 && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
            <Ionicons name="backspace-outline" size={24} color={theme === "dark" ? "#8e8e93" : "#666"} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          {renderKeypadButton("1", "", 0)}
          {renderKeypadButton("2", "ABC", 1)}
          {renderKeypadButton("3", "DEF", 2)}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton("4", "GHI", 3)}
          {renderKeypadButton("5", "JKL", 4)}
          {renderKeypadButton("6", "MNO", 5)}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton("7", "PQRS", 6)}
          {renderKeypadButton("8", "TUV", 7)}
          {renderKeypadButton("9", "WXYZ", 8)}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton("*", "", 9)}
          {renderKeypadButton("0", "+", 10)}
          {renderKeypadButton("#", "", 11)}
        </View>
      </View>

      <View style={styles.callButtonContainer}>
        <TouchableOpacity style={styles.callButton} onPress={handleCallPress} activeOpacity={0.8}>
          <Ionicons name="call-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.addContactContainer}>
        {phoneNumber.length > 0 && (
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() =>
              navigation.navigate("ContactDetail", {
                isNew: true,
                contact: { phone: phoneNumber },
              })
            }
          >
            <Text style={[styles.addContactText, { color: theme === "dark" ? "#0a84ff" : "#007AFF" }]}>
              Add to Contacts
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
  },
  phoneNumberInput: {
    fontSize: 32,
    textAlign: "center",
    letterSpacing: 2,
    fontWeight: "300",
  },
  deleteButton: {
    padding: 10,
  },
  keypadContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  keypadButton: {
    width: width / 4,
    height: width / 4,
    borderRadius: width / 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  digitText: {
    fontSize: 30,
    fontWeight: "300",
  },
  lettersText: {
    fontSize: 12,
    marginTop: 2,
  },
  callButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  callButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addContactContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  addContactButton: {
    padding: 10,
  },
  addContactText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

