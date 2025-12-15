import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_NAME_STORAGE_KEY = "user_name";
export const DEFAULT_USER_NAME = "Jerrin";

const sanitizeName = (value) => {
  if (typeof value !== "string") return DEFAULT_USER_NAME;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_USER_NAME;
};

export const getStoredUserName = async () => {
  try {
    const stored = await AsyncStorage.getItem(USER_NAME_STORAGE_KEY);
    if (stored) {
      return sanitizeName(stored);
    }
  } catch (error) {
    console.error("Error reading stored user name:", error);
  }
  return DEFAULT_USER_NAME;
};

export const saveUserName = async (value) => {
  const sanitized = sanitizeName(value);
  try {
    if (sanitized === DEFAULT_USER_NAME) {
      await AsyncStorage.removeItem(USER_NAME_STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(USER_NAME_STORAGE_KEY, sanitized);
    }
  } catch (error) {
    console.error("Error saving user name:", error);
  }
  return sanitized;
};

export const useUserName = () => {
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        const storedName = await getStoredUserName();
        if (isActive) {
          setUserName(storedName);
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return userName;
};
