import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const INTERPRETATION_SUMMARY_KEY = "interpretation_summary";
export const DEFAULT_INTERPRETATION_SUMMARY =
  "Your profile shows a strong alignment with Christian teachings, particularly around meaning, forgiveness, and moral guidance. You also display selective resonance with Islamic and Buddhist ideas, while Jewish teachings appear as a smaller but present influence. As you continue your journey, these proportions will evolve based on what resonates most consistently.";

const sanitizeSummary = (value) => {
  if (typeof value !== "string") return DEFAULT_INTERPRETATION_SUMMARY;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_INTERPRETATION_SUMMARY;
};

export const getStoredInterpretationSummary = async () => {
  try {
    const stored = await AsyncStorage.getItem(INTERPRETATION_SUMMARY_KEY);
    if (stored) {
      return sanitizeSummary(stored);
    }
  } catch (error) {
    console.error("Error reading interpretation summary:", error);
  }
  return DEFAULT_INTERPRETATION_SUMMARY;
};

export const saveInterpretationSummary = async (value) => {
  const sanitized = sanitizeSummary(value);
  try {
    if (sanitized === DEFAULT_INTERPRETATION_SUMMARY) {
      await AsyncStorage.removeItem(INTERPRETATION_SUMMARY_KEY);
    } else {
      await AsyncStorage.setItem(INTERPRETATION_SUMMARY_KEY, sanitized);
    }
  } catch (error) {
    console.error("Error saving interpretation summary:", error);
  }
  return sanitized;
};

export const useInterpretationSummary = () => {
  const [summary, setSummary] = useState(DEFAULT_INTERPRETATION_SUMMARY);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        const storedSummary = await getStoredInterpretationSummary();
        if (isActive) {
          setSummary(storedSummary);
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return summary;
};
