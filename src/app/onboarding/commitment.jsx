import { View, Text, Pressable, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";

export default function CommitmentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleStart = async () => {
    await Haptics.selectionAsync();
    router.push("/paywall");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#477b78",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style="light" />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 32,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Text style={{ fontSize: 48 }}>🌅</Text>
        </View>

        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 36,
            color: "#FFFFFF",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Your 30-day{"\n"}spiritual journey
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 17,
            color: "rgba(255, 255, 255, 0.95)",
            textAlign: "center",
            lineHeight: 26,
            marginBottom: 48,
          }}
        >
          Each day, you'll receive a verse from different faiths.
          {"\n\n"}
          Rate how much it resonates with you.
          {"\n\n"}
          After 30 days, discover which spiritual path aligns most with your
          soul.
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>📖</Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            Daily verse + reflection
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderRadius: 16,
            marginTop: 12,
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>📊</Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            Personalized spiritual report
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderRadius: 16,
            marginTop: 12,
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>🎯</Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            Find your spiritual alignment
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => ({
            backgroundColor: "#FFFFFF",
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
              color: "#477b78",
            }}
          >
            Start My 30-Day Exploration
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
