"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { captureRef } from "react-native-view-shot"
import { BlurView } from "expo-blur"
import ColorPicker from "react-native-wheel-color-picker"

const { width } = Dimensions.get("window")

export default function ContactPoster({ route, navigation }) {
  const { contact, onSavePoster } = route.params
  const [image, setImage] = useState(contact.posterImage)
  const [backgroundColor, setBackgroundColor] = useState("#007AFF")
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [blur, setBlur] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const posterRef = useRef(null)

  const handleSave = useCallback(async () => {
    if (!image) {
      Alert.alert("Image Required", "Please select an image for the contact poster.")
      return
    }

    try {
      const uri = await captureRef(posterRef, {
        format: "jpg",
        quality: 0.8,
      })

      onSavePoster(uri)
      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", "Failed to save the contact poster.")
      console.error(error)
    }
  }, [image, navigation, onSavePoster])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={handleSave}>
          <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>Save</Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, handleSave])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to select a poster image.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <View style={styles.container}>
      {showPreview ? (
        <View style={styles.previewContainer}>
          <View style={styles.incomingCallContainer}>
            <View style={styles.callHeader}>
              <Text style={styles.callHeaderText}>Incoming Call Preview</Text>
            </View>

            <View style={styles.posterPreview} ref={posterRef}>
              {image ? (
                <Image source={{ uri: image }} style={[styles.posterImage, { backgroundColor }]} />
              ) : (
                <View style={[styles.posterPlaceholder, { backgroundColor }]}>
                  <Text style={[styles.posterPlaceholderText, { color: textColor }]}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <BlurView intensity={blur} style={styles.posterOverlay}>
                <Text style={[styles.posterName, { color: textColor }]}>{contact.name}</Text>
                <Text style={[styles.posterPhone, { color: textColor }]}>{contact.phone}</Text>
              </BlurView>
            </View>

            <View style={styles.callActions}>
              <View style={styles.callActionRow}>
                <View style={styles.callActionItem}>
                  <Ionicons name="alarm-outline" size={24} color="white" />
                  <Text style={styles.callActionText}>Remind Me</Text>
                </View>
                <View style={styles.callActionItem}>
                  <Ionicons name="chatbubble-outline" size={24} color="white" />
                  <Text style={styles.callActionText}>Message</Text>
                </View>
              </View>

              <View style={styles.slideToAnswer}>
                <View style={styles.slideTrack}>
                  <Text style={styles.slideText}>slide to answer</Text>
                  <View style={styles.slideThumb}>
                    <Ionicons name="chevron-forward-outline" size={24} color="white" />
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.closePreviewButton} onPress={togglePreview}>
              <Text style={styles.closePreviewText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.editorContainer}>
          <View style={styles.posterContainer} ref={posterRef}>
            {image ? (
              <Image source={{ uri: image }} style={[styles.posterImage, { backgroundColor }]} />
            ) : (
              <View style={[styles.posterPlaceholder, { backgroundColor }]}>
                <Text style={[styles.posterPlaceholderText, { color: textColor }]}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <BlurView intensity={blur} style={styles.posterOverlay}>
              <Text style={[styles.posterName, { color: textColor }]}>{contact.name}</Text>
              <Text style={[styles.posterPhone, { color: textColor }]}>{contact.phone}</Text>
            </BlurView>
          </View>

          <View style={styles.editorControls}>
            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.pickImageText}>Choose Image</Text>
            </TouchableOpacity>

            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Background Color</Text>
              <View style={styles.colorPickerContainer}>
                <ColorPicker
                  color={backgroundColor}
                  onColorChange={setBackgroundColor}
                  thumbSize={30}
                  sliderSize={20}
                  noSnap={true}
                  row={false}
                />
              </View>
            </View>

            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Text Color</Text>
              <View style={styles.colorPickerContainer}>
                <ColorPicker
                  color={textColor}
                  onColorChange={setTextColor}
                  thumbSize={30}
                  sliderSize={20}
                  noSnap={true}
                  row={false}
                />
              </View>
            </View>

            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Blur Effect: {blur}</Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={() => setBlur(Math.max(0, blur - 10))} style={styles.sliderButton}>
                  <Ionicons name="remove-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${(blur / 100) * 100}%` }]} />
                </View>
                <TouchableOpacity onPress={() => setBlur(Math.min(100, blur + 10))} style={styles.sliderButton}>
                  <Ionicons name="add-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.previewButton} onPress={togglePreview}>
            <Ionicons name="eye-outline" size={24} color="white" />
            <Text style={styles.previewButtonText}>Preview Incoming Call</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  editorContainer: {
    flex: 1,
  },
  posterContainer: {
    width: width - 40,
    height: (width - 40) * 1.3,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
  },
  posterImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    fontSize: 80,
    fontWeight: "bold",
  },
  posterOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  posterName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  posterPhone: {
    fontSize: 18,
  },
  editorControls: {
    padding: 20,
  },
  pickImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  pickImageText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  controlSection: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  colorPickerContainer: {
    height: 220,
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  sliderTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5856D6",
    paddingVertical: 16,
    borderRadius: 10,
    margin: 20,
  },
  previewButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  incomingCallContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  callHeader: {
    alignItems: "center",
    marginTop: 40,
  },
  callHeaderText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  posterPreview: {
    width: width - 80,
    height: (width - 80) * 1.3,
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
  },
  callActions: {
    marginBottom: 40,
  },
  callActionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  callActionItem: {
    alignItems: "center",
  },
  callActionText: {
    color: "white",
    marginTop: 8,
  },
  slideToAnswer: {
    alignItems: "center",
  },
  slideTrack: {
    width: "80%",
    height: 60,
    backgroundColor: "rgba(52, 199, 89, 0.3)",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    justifyContent: "space-between",
  },
  slideText: {
    color: "white",
    marginLeft: 20,
    fontSize: 16,
  },
  slideThumb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewButton: {
    alignItems: "center",
    padding: 15,
  },
  closePreviewText: {
    color: "#007AFF",
    fontSize: 18,
  },
})
