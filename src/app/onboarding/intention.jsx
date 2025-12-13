import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";

const intentions = [
  "Find a spiritual path that resonates",
  "Understand myself more deeply",
  "Build a daily reflection habit",
  "Explore different traditions",
  "Strengthen my faith",
  "Reduce anxiety or find peace",
  "I'm not sure yet",
];

export default function IntentionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState([]);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleToggle = async (intention) => {
    await Haptics.selectionAsync();
    setSelected((prev) => {
      if (prev.includes(intention)) {
        return prev.filter((i) => i !== intention);
      } else if (prev.length < 3) {
        return [...prev, intention];
      }
      return prev;
    });
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    await Haptics.selectionAsync();
    await AsyncStorage.setItem("primary_intent", JSON.stringify(selected));
    router.push("/onboarding/emotional-driver");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#FFFFFF",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 40,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 32,
            color: "#477b78",
            marginBottom: 12,
          }}
        >
          What brings you here?
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#9CA3AF" : "#6B7280",
            marginBottom: 32,
          }}
        >
          Select up to 3 intentions
        </Text>

        {intentions.map((intention, index) => {
          const isSelected = selected.includes(intention);
          return (
            <Pressable
              key={index}
              onPress={() => handleToggle(intention)}
              style={({ pressed }) => ({
                backgroundColor: isSelected
                  ? "#477b78"
                  : isDark
                    ? "#1E1E1E"
                    : "#F6F7F9",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderWidth: isSelected ? 2 : 0,
                borderColor: "#477b78",
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: isSelected
                    ? "#FFFFFF"
                    : isDark
                      ? "#FFFFFF"
                      : "#000000",
                }}
              >
                {intention}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          left: 32,
          right: 32,
        }}
      >
        <Pressable
          onPress={handleContinue}
          disabled={selected.length === 0}
          style={({ pressed }) => ({
            backgroundColor: selected.length > 0 ? "#477b78" : "#D1D5DB",
            borderRadius: 28,
            paddingVertical: 18,
            alignItems: "center",
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
