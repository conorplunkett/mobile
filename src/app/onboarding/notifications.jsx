import { View, Text, Pressable, useColorScheme, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useState } from "react";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { COLOR_PRIMARY } from "../../utils/colors";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    await Haptics.selectionAsync();

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        console.log("Notifications enabled");
      }
    } catch (error) {
      console.error("Error requesting notifications:", error);
    }

    setIsRequesting(false);
    router.push("/onboarding/commitment");
  };

  const handleSkip = async () => {
    await Haptics.selectionAsync();
    router.push("/onboarding/commitment");
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
            width: 80,
            height: 80,
            backgroundColor: "rgba(71, 123, 120, 0.1)",
            borderRadius: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Image
            source={{
              uri: "https://ucarecdn.com/a0fd9767-7c50-4f02-aae5-fa7fe595ab27/-/format/auto/",
            }}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 32,
            color: COLOR_PRIMARY,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Stay aligned daily
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 40,
          }}
        >
          To stay aligned, you'll need your daily verse delivered at the right
          moment.
          {"\n\n"}
          Rio can only guide you if you receive your reflection each day.
          {"\n\n"}
          Enable notifications so we can send the daily insight that powers your
          journey.
        </Text>

        {/* iOS notification diagram */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 16,
            padding: 20,
            width: "100%",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
              backgroundColor: COLOR_PRIMARY,
                borderRadius: 8,
                marginRight: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: "https://ucarecdn.com/a0fd9767-7c50-4f02-aae5-fa7fe595ab27/-/format/auto/",
                }}
                style={{ width: 20, height: 20, borderRadius: 4 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Rio
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            Your daily spiritual verse is ready
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
        <Pressable
          onPress={handleEnableNotifications}
          disabled={isRequesting}
          style={({ pressed }) => ({
            backgroundColor: COLOR_PRIMARY,
            borderRadius: 28,
            paddingVertical: 18,
            alignItems: "center",
            marginBottom: 12,
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
            {isRequesting ? "Requesting..." : "Enable Notifications"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => ({
            paddingVertical: 12,
            alignItems: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            Skip for now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
