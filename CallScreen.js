"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
  Linking,
  Alert,
  Animated,
  Vibration,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { ThemeContext } from "../context/ThemeContext"
import React from "react"

const { width, height } = Dimensions.get("window")

export default function CallScreen({ route, navigation }) {
  const { contact } = route.params
  const { theme } = useContext(ThemeContext)
  const [callStatus, setCallStatus] = useState("connecting") // connecting, active, ended
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [isKeypadOpen, setIsKeypadOpen] = useState(false)
  const [dialedDigits, setDialedDigits] = useState("")

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(50))[0]

  // Make actual phone call
  const makeActualPhoneCall = React.useCallback(() => {
    const phoneUrl = `tel:${contact.phone}`
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl)
        } else {
          Alert.alert("Error", "Phone calls are not supported on this device")
        }
      })
      .catch((err) => console.error("An error occurred", err))
  }, [contact.phone])

  // Handle back button to prevent accidental navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true // Prevent default back behavior
    })

    return () => backHandler.remove()
  }, [])

  // Animate in
  useEffect(() => {
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
  }, [fadeAnim, slideAnim])

  // Simulate call connecting
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus("active")
      // Make the actual phone call
      makeActualPhoneCall()
      // Vibrate to indicate connection
      Vibration.vibrate(200)
    }, 1500)

    return () => clearTimeout(connectTimer)
  }, [makeActualPhoneCall])

  // Call duration timer
  useEffect(() => {
    let durationTimer

    if (callStatus === "active") {
      durationTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (durationTimer) clearInterval(durationTimer)
    }
  }, [callStatus])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCallStatus("ended")
      setTimeout(() => {
        navigation.goBack()
      }, 500)
    })

    // Vibrate to indicate end call
    Vibration.vibrate(100)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Vibrate for feedback
    Vibration.vibrate(50)
  }

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker)
    // Vibrate for feedback
    Vibration.vibrate(50)
  }

  const toggleKeypad = () => {
    setIsKeypadOpen(!isKeypadOpen)
    // Vibrate for feedback
    Vibration.vibrate(50)
  }

  const handleKeypadPress = (digit) => {
    setDialedDigits((prev) => prev + digit)
    // Vibrate for feedback
    Vibration.vibrate(20)
  }

  const renderKeypad = () => {
    const keypadButtons = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["*", "0", "#"],
    ]

    return (
      <View style={[styles.keypadContainer, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}>
        <View style={styles.dialedDigitsContainer}>
          <Text style={styles.dialedDigits}>{dialedDigits}</Text>
        </View>

        {keypadButtons.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((digit) => (
              <TouchableOpacity
                key={`digit-${digit}`}
                style={styles.keypadButton}
                onPress={() => handleKeypadPress(digit)}
                activeOpacity={0.7}
              >
                <Text style={styles.keypadDigit}>{digit}</Text>
                {digit !== "*" && digit !== "#" && digit !== "0" && (
                  <Text style={styles.keypadLetters}>
                    {digit === "1"
                      ? ""
                      : digit === "2"
                        ? "ABC"
                        : digit === "3"
                          ? "DEF"
                          : digit === "4"
                            ? "GHI"
                            : digit === "5"
                              ? "JKL"
                              : digit === "6"
                                ? "MNO"
                                : digit === "7"
                                  ? "PQRS"
                                  : digit === "8"
                                    ? "TUV"
                                    : "WXYZ"}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={80} style={styles.blurContainer}>
        {contact.posterImage ? (
          <Image source={{ uri: contact.posterImage }} style={styles.backgroundImage} blurRadius={10} />
        ) : (
          <View style={styles.colorBackground} />
        )}

        <View style={styles.callInfoContainer}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.callStatusText}>
            {callStatus === "connecting"
              ? "Calling..."
              : callStatus === "active"
                ? formatDuration(callDuration)
                : "Call ended"}
          </Text>
        </View>

        {isKeypadOpen ? (
          renderKeypad()
        ) : (
          <View style={styles.contactImageContainer}>
            {contact.posterImage ? (
              <Image source={{ uri: contact.posterImage }} style={styles.contactImage} />
            ) : (
              <View style={styles.contactInitial}>
                <Text style={styles.initialText}>{contact.name.charAt(0)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionButton, isMuted && styles.actionButtonActive]} onPress={toggleMute}>
              <Ionicons name={isMuted ? "mic-off-outline" : "mic-outline"} size={24} color="white" />
              <Text style={styles.actionText}>Mute</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={toggleKeypad}>
              <Ionicons name="keypad-outline" size={24} color="white" />
              <Text style={styles.actionText}>Keypad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isSpeaker && styles.actionButtonActive]}
              onPress={toggleSpeaker}
            >
              <Ionicons name={isSpeaker ? "volume-high-outline" : "volume-medium-outline"} size={24} color="white" />
              <Text style={styles.actionText}>Speaker</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-outline" size={24} color="white" />
              <Text style={styles.actionText}>Add Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="videocam-outline" size={24} color="white" />
              <Text style={styles.actionText}>FaceTime</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={24} color="white" />
              <Text style={styles.actionText}>Contacts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Ionicons name="call-outline" size={36} color="white" />
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  backgroundImage: {
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.5,
  },
  colorBackground: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "#007AFF",
    opacity: 0.3,
  },
  callInfoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  contactName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  callStatusText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contactImageContainer: {
    alignItems: "center",
  },
  contactImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  contactInitial: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  initialText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "white",
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    width: 80,
  },
  actionButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    padding: 5,
  },
  actionText: {
    color: "white",
    marginTop: 8,
  },
  endCallButton: {
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    transform: [{ rotate: "135deg" }],
  },
  keypadContainer: {
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  dialedDigitsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dialedDigits: {
    fontSize: 30,
    color: "white",
    letterSpacing: 2,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  keypadDigit: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  keypadLetters: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
})

