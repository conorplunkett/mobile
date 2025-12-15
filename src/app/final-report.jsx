import {
  View,
  Text,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import DonutChart from "../components/DonutChart";
import {
  COLOR_PRIMARY,
  COLOR_MUTED,
  COLOR_ACCENT,
  COLOR_ACCENT_SOFT,
  COLOR_DARK,
} from "../utils/colors";
import { useUserName } from "../utils/userName";

const RELIGIOUS_PROFILE = [
  { label: "Christianity", value: 65, color: COLOR_PRIMARY },
  { label: "Judaism", value: 6, color: COLOR_ACCENT_SOFT },
  { label: "Islam", value: 12, color: COLOR_ACCENT },
  { label: "Buddhism", value: 10, color: COLOR_MUTED },
  { label: "Other", value: 7, color: COLOR_DARK },
];

export default function FinalReportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userName = useUserName();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
      </View>
    );
  }

  const backgroundColor = isDark ? "#121212" : "#FFFFFF";
  const cardBackground = isDark ? "#1E1E1E" : "#F6F7F9";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 16,
          marginBottom: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: 8,
            marginRight: 12,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ChevronLeft size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "DMSerifDisplay_400Regular",
              fontSize: 30,
              color: COLOR_PRIMARY,
            }}
          >
            Your Final Report
          </Text>
        </View>

        <Pressable
          onPress={() => {}}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: isDark ? COLOR_DARK : "#E5E7EB",
            borderRadius: 999,
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Share report preview (coming soon)"
        >
          <Share2 size={20} color={isDark ? "#FFFFFF" : "#111827"} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: insets.bottom + 140,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: cardBackground,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View style={{ position: "relative" }}>
              <DonutChart
                data={RELIGIOUS_PROFILE}
                size={260}
                innerRadius={95}
                innerColor={cardBackground}
              />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                    color: isDark ? "#FFFFFF" : "#000000",
                    textAlign: "center",
                  }}
                >
                  {userName}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: textMuted,
                    marginTop: 4,
                  }}
                >
                  Religious profile preview
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {RELIGIOUS_PROFILE.map((faith) => (
              <View
                key={faith.label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: faith.color,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 15,
                      color: isDark ? "#FFFFFF" : "#111827",
                    }}
                  >
                    {faith.label}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                    color: isDark ? "#FFFFFF" : "#111827",
                  }}
                >
                  {faith.value}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            borderWidth: isDark ? 0 : 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 12,
            }}
          >
            Interpretation Summary
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: textMuted,
              lineHeight: 22,
            }}
          >
            This profile reflects how your responses distribute across faith
            traditions over time. As you continue your journey, these
            proportions will update and eventually settle into your final
            report. Today's view is a conceptual preview powered by sample
            data.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#FDF9F3",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "#F3E8D8",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: COLOR_MUTED,
              lineHeight: 20,
            }}
          >
            This is a preview using sample data. Your final report will be based
            on your own reflections.
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
          paddingTop: 16,
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => ({
            backgroundColor: COLOR_PRIMARY,
            borderRadius: 30,
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
            Share Your Report
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
