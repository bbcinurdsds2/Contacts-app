"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  BackHandler,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

const { width, height } = Dimensions.get("window")

export default function IncomingCallScreen({ route, navigation }) {
  const { contact } = route.params
  const [isLocked, setIsLocked] = useState(true)

  const slideAnimation = new Animated.Value(0)

  // Handle back button to prevent accidental navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true // Prevent default back behavior
    })

    return () => backHandler.remove()
  }, [])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx > 0) {
        slideAnimation.setValue(gestureState.dx)
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > width / 2) {
        // Slide completed, answer call
        Animated.timing(slideAnimation, {
          toValue: width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => handleAnswerCall())
      } else {
        // Reset slide
        Animated.spring(slideAnimation, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start()
      }
    },
  })

  const handleAnswerCall = () => {
    navigation.replace("CallScreen", { contact })
  }

  const handleDeclineCall = () => {
    navigation.goBack()
  }

  const toggleLockState = () => {
    setIsLocked(!isLocked)
  }

  // Render locked screen (slide to answer)
  const renderLockedScreen = () => (
    <View style={styles.lockedContainer}>
      <View style={styles.callInfoContainer}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.callStatusText}>incoming call</Text>
      </View>

      <View style={styles.slideContainer}>
        <View style={styles.slideTrack}>
          <Text style={styles.slideText}>slide to answer</Text>
          <Animated.View
            style={[styles.slideThumb, { transform: [{ translateX: slideAnimation }] }]}
            {...panResponder.panHandlers}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </Animated.View>
        </View>
      </View>

      <View style={styles.declineContainer}>
        <TouchableOpacity style={styles.declineButton} onPress={handleDeclineCall}>
          <Ionicons name="call" size={36} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
        </TouchableOpacity>
      </View>
    </View>
  )

  // Render unlocked screen (buttons to answer/decline)
  const renderUnlockedScreen = () => (
    <View style={styles.unlockedContainer}>
      <View style={styles.callInfoContainer}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.callStatusText}>incoming call</Text>
      </View>

      <View style={styles.contactImageContainer}>
        {contact.posterImage ? (
          <Image source={{ uri: contact.posterImage }} style={styles.contactImage} />
        ) : (
          <View style={styles.contactInitial}>
            <Text style={styles.initialText}>{contact.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.callActionsContainer}>
        <View style={styles.callActionRow}>
          <TouchableOpacity style={styles.messageAction}>
            <View style={styles.messageIcon}>
              <Ionicons name="chatbubble" size={20} color="white" />
            </View>
            <Text style={styles.messageText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reminderAction}>
            <View style={styles.reminderIcon}>
              <Ionicons name="alarm" size={20} color="white" />
            </View>
            <Text style={styles.reminderText}>Remind Me</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.answerDeclineRow}>
          <TouchableOpacity style={styles.declineCallButton} onPress={handleDeclineCall}>
            <Ionicons name="call" size={30} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.answerCallButton} onPress={handleAnswerCall}>
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.blurContainer}>
        {contact.posterImage ? (
          <Image source={{ uri: contact.posterImage }} style={styles.backgroundImage} blurRadius={10} />
        ) : (
          <View style={styles.colorBackground} />
        )}

        <TouchableOpacity style={styles.lockToggle} onPress={toggleLockState}>
          <Ionicons name={isLocked ? "lock-closed" : "lock-open"} size={24} color="white" />
        </TouchableOpacity>

        {isLocked ? renderLockedScreen() : renderUnlockedScreen()}
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  blurContainer: {
    flex: 1,
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
  lockToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // Locked screen styles
  lockedContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
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
  slideContainer: {
    alignItems: "center",
  },
  slideTrack: {
    width: width - 80,
    height: 60,
    backgroundColor: "rgba(52, 199, 89, 0.3)",
    borderRadius: 30,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  slideText: {
    color: "white",
    marginLeft: 20,
    fontSize: 16,
  },
  slideThumb: {
    position: "absolute",
    left: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  declineContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  // Unlocked screen styles
  unlockedContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
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
  callActionsContainer: {
    marginBottom: 40,
  },
  callActionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  messageAction: {
    alignItems: "center",
  },
  messageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  messageText: {
    color: "white",
  },
  reminderAction: {
    alignItems: "center",
  },
  reminderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderText: {
    color: "white",
  },
  answerDeclineRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  declineCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  answerCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
})

