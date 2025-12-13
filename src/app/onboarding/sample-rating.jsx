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
import RatingSlider from "../../components/RatingSlider";

export default function SampleRatingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rating, setRating] = useState(3);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleContinue = async () => {
    await Haptics.selectionAsync();
    router.push("/onboarding/religions");
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
          Try it out
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#9CA3AF" : "#6B7280",
            marginBottom: 32,
          }}
        >
          Here's how you'll rate each daily verse
        </Text>

        {/* Sample verse */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <Text
            style={{
              fontFamily: "DMSerifDisplay_400Regular",
              fontSize: 22,
              color: isDark ? "#FFFFFF" : "#000000",
              lineHeight: 32,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            "By conquering your mind, you conquer the world."
          </Text>
        </View>

        {/* Rating slider demo */}
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: isDark ? "#FFFFFF" : "#000000",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Mark your resonance
        </Text>

        <RatingSlider onRatingChange={setRating} initialRating={3} />
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
          style={({ pressed }) => ({
            backgroundColor: "#477b78",
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
            Got it!
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
