import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ScrollView,
  TextInput,
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

const backgrounds = [
  "Raised in a religion",
  "Exploring spirituality on my own",
  "No religious background",
  "Deeply religious",
  "Prefer not to say",
];

export default function BackgroundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleSelect = async (background) => {
    await Haptics.selectionAsync();
    setSelected(background);
  };

  const handleContinue = async () => {
    if (!selected) return;
    await Haptics.selectionAsync();
    await AsyncStorage.setItem("background", selected);
    if (note) {
      await AsyncStorage.setItem("background_note", note);
    }
    router.push("/onboarding/learning-preference");
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
          Your spiritual background
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#9CA3AF" : "#6B7280",
            marginBottom: 32,
          }}
        >
          This helps us understand your starting point
        </Text>

        {backgrounds.map((background, index) => {
          const isSelected = selected === background;
          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(background)}
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
                {background}
              </Text>
            </Pressable>
          );
        })}

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: isDark ? "#9CA3AF" : "#6B7280",
            marginTop: 24,
            marginBottom: 12,
          }}
        >
          Share more about your journey (optional)
        </Text>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Tell us a bit about your spiritual journey..."
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 12,
            padding: 16,
            fontFamily: "Inter_400Regular",
            fontSize: 15,
            color: isDark ? "#FFFFFF" : "#000000",
            height: 100,
            textAlignVertical: "top",
          }}
        />
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
          disabled={!selected}
          style={({ pressed }) => ({
            backgroundColor: selected ? "#477b78" : "#D1D5DB",
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
