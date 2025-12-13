import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ScrollView,
  ActivityIndicator,  Alert,
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

const PLAN_DETAILS = {
  monthly: {
    id: "monthly",
    cadence: "monthly",
    price_usd: 30,
    price_cents: 3000,
    trial_days: 7,
  },
  yearly: {
    id: "yearly",
    cadence: "yearly",
    price_usd: 90,
    price_cents: 9000,
    trial_days: 7,
  },
  lifetime: {
    id: "lifetime",
    cadence: "lifetime",
    price_usd: 150,
    price_cents: 15000,
    trial_days: 0,
  },
};

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const handleSelectPlan = async (plan) => {
    await Haptics.selectionAsync();
    setSelectedPlan(plan);
  };

  const handleStartTrial = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await Haptics.selectionAsync();

    try {
      const planDetails = PLAN_DETAILS[selectedPlan] || PLAN_DETAILS.monthly;

      // Create user in database
      const onboardingData = {
        primary_intent: JSON.parse(
          (await AsyncStorage.getItem("primary_intent")) || "[]",
        ),
        emotional_driver: await AsyncStorage.getItem("emotional_driver"),
        background: await AsyncStorage.getItem("background"),
        background_note: await AsyncStorage.getItem("background_note"),
        format_preference: JSON.parse(
          (await AsyncStorage.getItem("format_preference")) || "[]",
        ),
        selected_religions: JSON.parse(
          (await AsyncStorage.getItem("selected_religions")) || "[]",
        ),
        custom_religion: await AsyncStorage.getItem("custom_religion"),
        selected_plan: selectedPlan,
        plan_selection: {
          ...planDetails,
          currency: "USD",
        },
      };

      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Unable to start your trial. Please try again.",
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data?.message ||
            "We couldn't start your trial. Please double-check your info and try again.",
        );
      }

      await AsyncStorage.setItem("user_hash", data.user.user_hash);
      await AsyncStorage.setItem("onboarding_complete", "true");
      await AsyncStorage.setItem("has_subscription", "true");
      await AsyncStorage.setItem("selected_plan", selectedPlan);
      await AsyncStorage.setItem(
        "selected_plan_details",
        JSON.stringify(planDetails),
      );

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert(
        "Unable to continue",
        error?.message || "Please try again in a moment.",
      );
    } finally {
      setIsProcessing(false);
    }
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
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 36,
            color: "#477b78",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Find clarity in your{"\n"}spiritual path
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 15,
            color: isDark ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Personalized verses, daily alignment, and guided reflection tailored
          to you
        </Text>

        {/* Features */}
        <View style={{ marginBottom: 32 }}>
          {[
            "Daily personalized verses",
            "30-day alignment journey",
            "Deep spiritual insights",
            "Reflection prompts",
            "Unlimited coaching for lifetime members",
          ].map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: "rgba(71, 123, 120, 0.15)",
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "#477b78", fontSize: 14 }}>✓</Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Monthly Plan */}
        <Pressable
          onPress={() => handleSelectPlan("monthly")}
          style={({ pressed }) => ({
            backgroundColor:
              selectedPlan === "monthly"
                ? "#477b78"
                : isDark
                  ? "#1E1E1E"
                  : "#F6F7F9",
            borderRadius: 20,
            padding: 20,
            marginBottom: 12,
            borderWidth: selectedPlan === "monthly" ? 2 : 0,
            borderColor: "#477b78",
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          })}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color:
                    selectedPlan === "monthly"
                      ? "#FFFFFF"
                      : isDark
                        ? "#FFFFFF"
                        : "#000000",
                  marginBottom: 4,
                }}
              >
                Monthly
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color:
                    selectedPlan === "monthly"
                      ? "rgba(255,255,255,0.8)"
                      : isDark
                        ? "#9CA3AF"
                        : "#6B7280",
                }}
              >
                7-day free trial, then $30/month
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedPlan === "monthly" ? "#FFFFFF" : "#477b78",
                backgroundColor:
                  selectedPlan === "monthly" ? "#FFFFFF" : "transparent",
              }}
            />
          </View>
        </Pressable>

        {/* Yearly Plan */}
        <Pressable
          onPress={() => handleSelectPlan("yearly")}
          style={({ pressed }) => ({
            backgroundColor:
              selectedPlan === "yearly"
                ? "#477b78"
                : isDark
                  ? "#1E1E1E"
                  : "#F6F7F9",
            borderRadius: 20,
            padding: 20,
            marginBottom: 12,
            borderWidth: selectedPlan === "yearly" ? 2 : 0,
            borderColor: "#477b78",
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          })}
        >
          <View style={{ position: "absolute", top: -8, right: 16 }}>
            <View
              style={{
                backgroundColor: "#e5a754",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 11,
                  color: "#FFFFFF",
                }}
              >
                75% OFF
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color:
                    selectedPlan === "yearly"
                      ? "#FFFFFF"
                      : isDark
                        ? "#FFFFFF"
                        : "#000000",
                  marginBottom: 4,
                }}
              >
                Yearly
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color:
                    selectedPlan === "yearly"
                      ? "rgba(255,255,255,0.8)"
                      : isDark
                        ? "#9CA3AF"
                        : "#6B7280",
                }}
              >
                $90/year • Best value
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedPlan === "yearly" ? "#FFFFFF" : "#477b78",
                backgroundColor:
                  selectedPlan === "yearly" ? "#FFFFFF" : "transparent",
              }}
            />
          </View>
        </Pressable>

        {/* Lifetime Plan */}
        <Pressable
          onPress={() => handleSelectPlan("lifetime")}
          style={({ pressed }) => ({
            backgroundColor:
              selectedPlan === "lifetime"
                ? "#477b78"
                : isDark
                  ? "#1E1E1E"
                  : "#F6F7F9",
            borderRadius: 20,
            padding: 20,
            marginBottom: 32,
            borderWidth: selectedPlan === "lifetime" ? 2 : 0,
            borderColor: "#477b78",
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          })}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color:
                    selectedPlan === "lifetime"
                      ? "#FFFFFF"
                      : isDark
                        ? "#FFFFFF"
                        : "#000000",
                  marginBottom: 4,
                }}
              >
                Lifetime
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color:
                    selectedPlan === "lifetime"
                      ? "rgba(255,255,255,0.8)"
                      : isDark
                        ? "#9CA3AF"
                        : "#6B7280",
                }}
              >
                $150 one-time • Unlimited coaching
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  selectedPlan === "lifetime" ? "#FFFFFF" : "#477b78",
                backgroundColor:
                  selectedPlan === "lifetime" ? "#FFFFFF" : "transparent",
              }}
            />
          </View>
        </Pressable>

        {/* Legal text */}
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            color: isDark ? "#6B7280" : "#9CA3AF",
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          Payment will be charged to your Apple ID account after the free trial
          ends. Subscription renews automatically unless cancelled at least 24
          hours before the end of the trial or current period. You can manage or
          cancel your subscription in your Apple Account Settings.
        </Text>
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
          onPress={handleStartTrial}
          disabled={isProcessing}
          style={({ pressed }) => ({
            backgroundColor: "#477b78",
            borderRadius: 28,
            paddingVertical: 18,
            alignItems: "center",
            marginBottom: 12,
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          })}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
              }}
            >
              {selectedPlan === "monthly"
                ? "Start Free Trial"
                : `Choose ${selectedPlan === "yearly" ? "Yearly" : "Lifetime"} Plan`}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            paddingVertical: 8,
            alignItems: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: "#477b78",
            }}
          >
            Restore Purchases
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
