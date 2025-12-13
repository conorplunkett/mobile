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

const religions = [
  "Christianity",
  "Islam",
  "Judaism",
  "Buddhism",
  "Hinduism",
  "Sikhism",
  "Bahá'í Faith",
  "Jainism",
  "Shinto",
  "Taoism",
];

export default function ReligionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState(religions);
  const [customReligion, setCustomReligion] = useState("");
  const [showThanks, setShowThanks] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleSelectAll = async () => {
    await Haptics.selectionAsync();
    if (selected.length === religions.length) {
      setSelected([]);
    } else {
      setSelected([...religions]);
    }
  };

  const handleToggle = async (religion) => {
    await Haptics.selectionAsync();
    setSelected((prev) => {
      if (prev.includes(religion)) {
        return prev.filter((r) => r !== religion);
      } else {
        return [...prev, religion];
      }
    });
  };

  const handleAddCustom = async () => {
    if (customReligion.trim()) {
      await Haptics.selectionAsync();
      await AsyncStorage.setItem("custom_religion", customReligion);
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 2000);
    }
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    await Haptics.selectionAsync();
    await AsyncStorage.setItem("selected_religions", JSON.stringify(selected));
    router.push("/onboarding/notifications");
  };

  if (!fontsLoaded) {
    return null;
  }

  const allSelected = selected.length === religions.length;

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
          Which faiths interest you?
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#9CA3AF" : "#6B7280",
            marginBottom: 32,
          }}
        >
          We'll draw verses from these traditions
        </Text>

        {/* Select All */}
        <Pressable
          onPress={handleSelectAll}
          style={({ pressed }) => ({
            backgroundColor: allSelected
              ? "#477b78"
              : isDark
                ? "#1E1E1E"
                : "#F6F7F9",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: "#477b78",
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              color: allSelected ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000",
            }}
          >
            ✓ Select All
          </Text>
        </Pressable>

        {/* Individual religions */}
        {religions.map((religion, index) => {
          const isSelected = selected.includes(religion);
          return (
            <Pressable
              key={index}
              onPress={() => handleToggle(religion)}
              style={({ pressed }) => ({
                backgroundColor: isSelected
                  ? "#477b78"
                  : isDark
                    ? "#1E1E1E"
                    : "#E5E7EB",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected
                  ? "#477b78"
                  : isDark
                    ? "#2A2A2A"
                    : "#D1D5DB",
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
                {religion}
              </Text>
            </Pressable>
          );
        })}

        {/* Custom religion */}
        <View
          style={{
            marginTop: 24,
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
            }}
          >
            Want to add another one? Tell us here:
          </Text>

          <TextInput
            value={customReligion}
            onChangeText={setCustomReligion}
            placeholder="Enter faith tradition..."
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            style={{
              backgroundColor: isDark ? "#121212" : "#FFFFFF",
              borderRadius: 8,
              padding: 12,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 12,
            }}
          />

          <Pressable
            onPress={handleAddCustom}
            disabled={!customReligion.trim()}
            style={({ pressed }) => ({
              backgroundColor: customReligion.trim() ? "#477b78" : "#D1D5DB",
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              Submit
            </Text>
          </Pressable>

          {showThanks && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#477b78",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Thank you!
            </Text>
          )}
        </View>
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
