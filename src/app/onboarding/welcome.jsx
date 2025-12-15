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
import { COLOR_PRIMARY } from "../../utils/colors";

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleBegin = async () => {
    await Haptics.selectionAsync();
    router.push("/onboarding/intention");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLOR_PRIMARY,
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
        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 64,
            color: "#FFFFFF",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Rio
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
            lineHeight: 28,
            marginBottom: 48,
          }}
        >
         Find your faith
        </Text>

      </View>

      <View style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
        <Pressable
          onPress={handleBegin}
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
              color: COLOR_PRIMARY,
            }}
          >
            Begin Your Exploration
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
