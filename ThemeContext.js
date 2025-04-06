"use client"

import { createContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme()
  const [theme, setTheme] = useState(deviceTheme || "light")
  const [themeMode, setThemeMode] = useState("system") // 'system', 'light', or 'dark'

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("themeMode")
        if (savedThemeMode) {
          setThemeMode(savedThemeMode)

          if (savedThemeMode === "system") {
            setTheme(deviceTheme || "light")
          } else {
            setTheme(savedThemeMode)
          }
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error)
      }
    }

    loadThemePreference()
  }, [deviceTheme])

  // Update theme when device theme changes
  useEffect(() => {
    if (themeMode === "system") {
      setTheme(deviceTheme || "light")
    }
  }, [deviceTheme, themeMode])

  const setThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode)
      setThemeMode(mode)

      if (mode === "system") {
        setTheme(deviceTheme || "light")
      } else {
        setTheme(mode)
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

