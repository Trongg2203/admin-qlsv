import http from "@/api/http";
import RatingModal from "@/app/Screen/RatingModal";
import { API } from "@/constants/constants";
import { Fonts } from "@/constants/theme";
import { useMealPlanStore } from "@/store/mealPlanStore";
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { MealPlanDetail } from "@/typings/interfaces/mealPlan/mealPlan";
import {
  ApiResult,
  ApiResultGeneric,
} from "@/typings/interfaces/result/apiResult";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import { resolveImageUrl } from "@/utils/image";
import { tabBarScrollY } from "@/utils/tabBarScroll";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";

const { width } = Dimensions.get("window");

const ACCENT_ORANGE = "#FF8A00";
const CARD_WIDTH = Math.min(width * 0.26, 112);

const MEAL_SECTIONS = [
  { id: 1, label: "Bữa sáng", icon: "sunny" }, // 1 = breakfast
  { id: 2, label: "Bữa trưa", icon: "restaurant" }, // 2 = lunch
  { id: 3, label: "Bữa tối", icon: "moon" }, // 3 = dinner
  { id: 4, label: "Bữa phụ", icon: "cafe" }, // 4 = snack
];

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
];

const MONTHS = [
  "Thg 1",
  "Thg 2",
  "Thg 3",
  "Thg 4",
  "Thg 5",
  "Thg 6",
  "Thg 7",
  "Thg 8",
  "Thg 9",
  "Thg 10",
  "Thg 11",
  "Thg 12",
];

const formatShortDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getMonth()]}`;
};

const formatRange = (start?: string, end?: string) => {
  const startLabel = formatShortDate(start);
  const endLabel = formatShortDate(end);
  if (!startLabel && !endLabel) return "";
  return `${startLabel} - ${endLabel}`;
};

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getRandomImage = (index: number) =>
  FOOD_IMAGES[index % FOOD_IMAGES.length];

export default function DailyScreen() {
  const { activeMealPlan, loading, fetchActiveMealPlan, generateMealPlan } =
    useMealPlanStore();
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const accent = tokens.accent;
  const headerGlassColors =
    resolvedTheme === "dark"
      ? ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]
      : ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.75)"];
  const dayCardColors = (isActive: boolean) =>
    isActive
      ? [tokens.surface, tokens.background]
      : [tokens.surface, tokens.surface];
  const aiBannerColors =
    resolvedTheme === "dark" ? ["#1F2F1F", "#0F0F12"] : ["#FFFFFF", "#F4FFF6"];

  const [selectedDay, setSelectedDay] = useState(1);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<MealPlanDetail | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [calorieTargets, setCalorieTargets] = useState<{
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const timelineAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      await fetchActiveMealPlan();
      setHasLoaded(true);
    })();
  }, [fetchActiveMealPlan]);

  // Pull the real macro targets (grams) from the latest calorie calculation
  // instead of approximating from calories with a fixed ratio.
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get<ApiResultGeneric<any>>(API.CALORIE.LATEST);
        if (res?.code === 200 && res.data) {
          setCalorieTargets({
            protein: toNumber(res.data.protein_grams),
            carbs: toNumber(res.data.carbs_grams),
            fat: toNumber(res.data.fat_grams),
          });
        }
      } catch (error) {
        console.log("calorie latest fetch error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    Animated.timing(timelineAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [selectedDay, timelineAnim]);

  const details = activeMealPlan?.details ?? [];
  const targetCalories = toNumber(activeMealPlan?.target_calories_per_day);
  const dateRange = formatRange(
    activeMealPlan?.start_date,
    activeMealPlan?.end_date,
  );

  const dayDetails = useMemo(
    () => details.filter((item) => item.day_number === selectedDay),
    [details, selectedDay],
  );

  const dayTotals = useMemo(() => {
    return dayDetails.reduce(
      (acc, item) => {
        acc.calories += toNumber(item.total_calories);
        acc.protein += toNumber(item.total_protein);
        acc.carbs += toNumber(item.total_carbs);
        acc.fat += toNumber(item.total_fat);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [dayDetails]);

  const macroTargets = useMemo(() => {
    // Prefer the actual macro grams from the calorie calculation.
    if (calorieTargets) {
      return {
        protein: Math.round(calorieTargets.protein),
        carbs: Math.round(calorieTargets.carbs),
        fat: Math.round(calorieTargets.fat),
      };
    }
    // Fallback: approximate from daily calories (30% P / 40% C / 30% F).
    if (!targetCalories) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    const protein = Math.round((targetCalories * 0.3) / 4);
    const carbs = Math.round((targetCalories * 0.4) / 4);
    const fat = Math.round((targetCalories * 0.3) / 9);
    return { protein, carbs, fat };
  }, [targetCalories, calorieTargets]);

  const handleSelectDay = (day: number) => {
    timelineAnim.setValue(0.6);
    setSelectedDay(day);
  };

  const handleGenerate = async () => {
    ToastManager.show({
      type: "info",
      text1: "Đang tạo thực đơn bằng AI…",
      text2: "Quá trình này có thể mất tới 60 giây.",
      position: POSITION_TOAST.TOP,
    });
    const response = await generateMealPlan({});
    if (!response) {
      ToastManager.show({
        type: "error",
        text1: "Tạo thực đơn thất bại",
        position: POSITION_TOAST.TOP,
      });
      return;
    }
    setSelectedDay(1);
    ToastManager.show({
      type: "success",
      text1: "Tạo thực đơn thành công",
      position: POSITION_TOAST.TOP,
    });
  };

  // Regenerating replaces the current active plan (old one is marked Replaced
  // server-side), so confirm first.
  const confirmRegenerate = () => {
    Alert.alert(
      "Tạo thực đơn mới?",
      "Thực đơn hiện tại sẽ được thay thế bằng thực đơn 7 ngày mới do AI tạo.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Tạo mới", style: "destructive", onPress: handleGenerate },
      ],
    );
  };

  const handleRatingSubmit = async (
    foodId: string,
    rating: number,
    comment: string,
  ) => {
    try {
      const response = await http.post<ApiResult>("/api/food-ratings/rate", {
        food_id: foodId,
        rating,
        comment,
      });

      if (!response) {
        throw new Error("Gửi đánh giá thất bại");
      }

      ToastManager.show({
        type: "success",
        text1: "Đánh giá thành công",
        text2: response.message || "Cảm ơn bạn đã đánh giá món ăn",
        position: POSITION_TOAST.TOP,
      });

      setRatingModalVisible(false);
      setSelectedFood(null);
    } catch (error: any) {
      console.error("Rating error:", error);

      ToastManager.show({
        type: "error",
        text1: "Gửi đánh giá thất bại",
        text2:
          error?.response?.data?.message || error?.message || "Đã xảy ra lỗi",
        position: POSITION_TOAST.TOP,
      });

      throw error;
    }
  };

  const handleCloseRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedFood(null);
  };

  const renderDayCard = ({ item }: { item: number }) => {
    const dayCalories = details
      .filter((detail) => detail.day_number === item)
      .reduce((sum, detail) => sum + toNumber(detail.total_calories), 0);
    const progress = targetCalories
      ? Math.min(dayCalories / targetCalories, 1)
      : 0;
    const isActive = selectedDay === item;

    return (
      <TouchableOpacity
        onPress={() => handleSelectDay(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={dayCardColors(isActive)}
          style={[styles.dayCard, isActive && styles.dayCardActive]}
        >
          {isActive && (
            <LinearGradient
              colors={["rgba(124,255,107,0.3)", "rgba(255,138,0,0.1)"]}
              style={styles.dayGlow}
            />
          )}
          <Text style={styles.dayLabel}>Ngày {item}</Text>
          <View style={styles.dayProgressRing}>
            <LinearGradient
              colors={[accent, ACCENT_ORANGE]}
              style={styles.progressOuter}
            >
              <View style={styles.progressInner}>
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.dayCalories}>{Math.round(dayCalories)} kcal</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const MacroBar = ({
    label,
    value,
    target,
    color,
  }: {
    label: string;
    value: number;
    target: number;
    color: string;
  }) => {
    const progress = target ? Math.min(value / target, 1) : 0;
    return (
      <View style={styles.macroRow}>
        <View style={styles.macroLabelRow}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>
            {Math.round(value)}g / {Math.round(target)}g
          </Text>
        </View>
        <View style={styles.macroBarTrack}>
          <View
            style={[
              styles.macroBarFill,
              { width: `${progress * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderMealCard = (item: MealPlanDetail, index: number) => {
    const handleFoodPress = () => {
      setSelectedFood(item);
      setRatingModalVisible(true);
    };

    return (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        onPress={handleFoodPress}
        activeOpacity={0.7}
      >
        <View style={styles.mealCard}>
          <Image
            source={{
              uri: resolveImageUrl(item.food?.image_url) ?? getRandomImage(index),
            }}
            style={styles.mealImage}
          />
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{item.food?.name ?? "Món ăn"}</Text>
            <Text style={styles.mealMeta}>
              {Math.round(toNumber(item.total_calories))} kcal ·{" "}
              {toNumber(item.total_protein)}g P · {toNumber(item.total_carbs)}g
              C · {toNumber(item.total_fat)}g F
            </Text>
            <View style={styles.mealFooter}>
              <Text style={styles.mealServings}>Khẩu phần {item.servings}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!hasLoaded) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={styles.stateText}>Đang tải thực đơn…</Text>
      </View>
    );
  }

  if (!activeMealPlan) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="restaurant-outline" size={48} color={accent} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có thực đơn</Text>
        <Text style={styles.emptyDesc}>
          Hãy để AI tạo thực đơn 7 ngày phù hợp với mục tiêu và lượng calo của
          bạn.
        </Text>
        <TouchableOpacity
          style={[styles.emptyGenerateBtn, loading && { opacity: 0.6 }]}
          onPress={handleGenerate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={tokens.background} />
          ) : (
            <Ionicons name="sparkles" size={18} color={tokens.background} />
          )}
          <Text style={styles.emptyGenerateText}>
            {loading ? "Đang tạo… (tối đa 60 giây)" : "AI tạo thực đơn"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: tabBarScrollY } } }],
          { useNativeDriver: true },
        )}
      >
        <View style={styles.headerWrap}>
          <LinearGradient colors={headerGlassColors} style={styles.headerGlass}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>
                  {activeMealPlan?.plan_name ?? "Thực đơn 7 ngày"}
                </Text>
                <Text style={styles.headerSubtitle}>{dateRange}</Text>
              </View>
            </View>
            <View style={styles.headerMetaRow}>
              <View style={styles.kcalBadge}>
                <Ionicons name="flash" size={14} color={accent} />
                <Text style={styles.kcalText}>
                  {Math.round(targetCalories)} kcal/ngày
                </Text>
              </View>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={confirmRegenerate}
                disabled={loading}
              >
                <Text style={styles.generateText}>
                  {loading ? "Đang tạo..." : "Tạo thực đơn mới"}
                </Text>
                <Ionicons name="sparkles" size={16} color={tokens.background} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(124,255,107,0.35)", "rgba(255,138,0,0.08)"]}
            style={styles.headerGlow}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch ăn theo tuần</Text>
          <Text style={styles.sectionHint}>Chạm vào ngày để xem bữa ăn</Text>
        </View>
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7]}
          renderItem={renderDayCard}
          keyExtractor={(item) => String(item)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayList}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch bữa ăn trong ngày</Text>
          <Text style={styles.sectionHint}>Vuốt thẻ để thao tác nhanh</Text>
        </View>

        <Animated.View
          style={{
            opacity: timelineAnim,
            transform: [
              {
                translateY: timelineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          {MEAL_SECTIONS.map((section) => {
            const items = dayDetails.filter(
              (detail) => detail.meal_type === section.id,
            );
            return (
              <View key={section.id} style={styles.mealSection}>
                <View style={styles.mealSectionHeader}>
                  <View style={styles.mealSectionTitleRow}>
                    <Ionicons
                      name={section.icon as any}
                      size={18}
                      color={accent}
                    />
                    <Text style={styles.mealSectionTitle}>{section.label}</Text>
                  </View>
                  <Text style={styles.mealSectionHint}>{items.length} món</Text>
                </View>
                {items.length === 0 ? (
                  <View style={styles.mealEmptyCard}>
                    <Text style={styles.mealEmptyText}>
                      Chưa có món.
                    </Text>
                  </View>
                ) : (
                  items.map(renderMealCard)
                )}
              </View>
            );
          })}
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tổng quan dinh dưỡng</Text>
          <Text style={styles.sectionHint}>Mục tiêu và lượng nạp mỗi ngày</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.calorieRing}>
              <LinearGradient
                colors={[accent, ACCENT_ORANGE]}
                style={styles.calorieRingOuter}
              >
                <View style={styles.calorieRingInner}>
                  <Text style={styles.calorieValue}>
                    {Math.round(dayTotals.calories)}
                  </Text>
                  <Text style={styles.calorieLabel}>kcal</Text>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.summaryStats}>
              <Text style={styles.summaryTitle}>Cân bằng ngày</Text>
              <Text style={styles.summarySubTitle}>
                Mục tiêu {Math.round(targetCalories || 0)} kcal
              </Text>
              <View style={styles.summaryBadgeRow}>
                <View style={styles.summaryBadge}>
                  <Ionicons name="flame" size={14} color={ACCENT_ORANGE} />
                  <Text style={styles.summaryBadgeText}>Trao đổi chất</Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Ionicons name="pulse" size={14} color={accent} />
                  <Text style={styles.summaryBadgeText}>AI tối ưu</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.macroBlock}>
            <MacroBar
              label="Đạm"
              value={dayTotals.protein}
              target={macroTargets.protein}
              color={accent}
            />
            <MacroBar
              label="Tinh bột"
              value={dayTotals.carbs}
              target={macroTargets.carbs}
              color="#5B8CFF"
            />
            <MacroBar
              label="Chất béo"
              value={dayTotals.fat}
              target={macroTargets.fat}
              color="#FF8A00"
            />
          </View>
        </View>
      </Animated.ScrollView>

      <RatingModal
        visible={ratingModalVisible}
        onClose={handleCloseRatingModal}
        foodId={selectedFood?.food?.id ?? ""}
        foodName={selectedFood?.food?.name ?? ""}
        foodImage={resolveImageUrl(selectedFood?.food?.image_url)}
        onSubmit={handleRatingSubmit}
      />
    </View>
  );
}

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.background,
    },
    stateContainer: {
      flex: 1,
      backgroundColor: tokens.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 14,
    },
    stateText: {
      color: tokens.subtext,
      fontSize: 14,
    },
    emptyIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: tokens.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      color: tokens.text,
      fontSize: 18,
      fontWeight: "700",
    },
    emptyDesc: {
      color: tokens.subtext,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    emptyGenerateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 999,
      backgroundColor: tokens.accent,
      marginTop: 8,
    },
    emptyGenerateText: {
      color: tokens.background,
      fontWeight: "700",
      fontSize: 14,
    },
    scrollContent: {
      paddingBottom: 160,
    },
    headerWrap: {
      paddingHorizontal: 20,
      paddingTop: 52,
      marginBottom: 20,
    },
    headerGlass: {
      borderRadius: 24,
      padding: 20,
      backgroundColor: tokens.glass,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    headerGlow: {
      position: "absolute",
      top: 0,
      left: 20,
      right: 20,
      height: 120,
      borderRadius: 24,
      zIndex: -1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: tokens.text,
      fontFamily: Fonts.rounded,
    },
    headerSubtitle: {
      fontSize: 13,
      color: tokens.subtext,
      marginTop: 6,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: tokens.card,
      alignItems: "center",
      justifyContent: "center",
    },
    headerMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 18,
    },
    kcalBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: tokens.accentSoft,
    },
    kcalText: {
      color: tokens.text,
      fontSize: 12,
      fontWeight: "600",
    },
    generateButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: tokens.accent,
    },
    generateText: {
      fontSize: 12,
      fontWeight: "700",
      color: tokens.background,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: tokens.text,
    },
    sectionHint: {
      fontSize: 12,
      color: tokens.subtext,
      marginTop: 4,
    },
    dayList: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: 12,
    },
    dayCard: {
      width: CARD_WIDTH,
      padding: 14,
      borderRadius: 20,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      overflow: "hidden",
    },
    dayCardActive: {
      borderColor: tokens.accent,
    },
    dayGlow: {
      position: "absolute",
      inset: 0,
    },
    dayLabel: {
      color: tokens.text,
      fontSize: 12,
      fontWeight: "600",
    },
    dayProgressRing: {
      marginTop: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    progressOuter: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: "center",
      justifyContent: "center",
    },
    progressInner: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: tokens.background,
      alignItems: "center",
      justifyContent: "center",
    },
    progressText: {
      color: tokens.text,
      fontSize: 11,
      fontWeight: "700",
    },
    dayCalories: {
      marginTop: 10,
      color: tokens.subtext,
      fontSize: 11,
    },
    mealSection: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    mealSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    mealSectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    mealSectionTitle: {
      color: tokens.text,
      fontWeight: "700",
      fontSize: 15,
    },
    mealSectionHint: {
      color: tokens.subtext,
      fontSize: 12,
    },
    mealEmptyCard: {
      padding: 18,
      borderRadius: 18,
      backgroundColor: tokens.card,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    mealEmptyText: {
      color: tokens.subtext,
      fontSize: 12,
    },
    mealCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      marginBottom: 12,
      borderRadius: 18,
      backgroundColor: tokens.card,
      borderWidth: 1,
      borderColor: tokens.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    mealImage: {
      width: 58,
      height: 58,
      borderRadius: 14,
    },
    mealInfo: {
      flex: 1,
    },
    mealName: {
      color: tokens.text,
      fontWeight: "600",
      fontSize: 14,
    },
    mealMeta: {
      color: tokens.subtext,
      fontSize: 11,
      marginTop: 4,
    },
    mealFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
    },
    mealServings: {
      color: tokens.subtext,
      fontSize: 11,
    },
    mealActions: {
      flexDirection: "row",
      gap: 10,
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 12,
      backgroundColor: tokens.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryCard: {
      marginHorizontal: 20,
      borderRadius: 22,
      padding: 18,
      backgroundColor: tokens.card,
      borderWidth: 1,
      borderColor: tokens.border,
      marginBottom: 20,
    },
    summaryTop: {
      flexDirection: "row",
      gap: 16,
    },
    calorieRing: {
      alignItems: "center",
      justifyContent: "center",
    },
    calorieRingOuter: {
      width: 94,
      height: 94,
      borderRadius: 47,
      alignItems: "center",
      justifyContent: "center",
    },
    calorieRingInner: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: tokens.background,
      alignItems: "center",
      justifyContent: "center",
    },
    calorieValue: {
      color: tokens.text,
      fontWeight: "700",
      fontSize: 18,
    },
    calorieLabel: {
      color: tokens.subtext,
      fontSize: 11,
    },
    summaryStats: {
      flex: 1,
    },
    summaryTitle: {
      color: tokens.text,
      fontWeight: "700",
      fontSize: 14,
    },
    summarySubTitle: {
      color: tokens.subtext,
      fontSize: 12,
      marginTop: 4,
    },
    summaryBadgeRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    summaryBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: tokens.card,
    },
    summaryBadgeText: {
      color: tokens.subtext,
      fontSize: 11,
    },
    macroBlock: {
      marginTop: 18,
      gap: 12,
    },
    macroRow: {
      gap: 8,
    },
    macroLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    macroLabel: {
      color: tokens.text,
      fontSize: 12,
      fontWeight: "600",
    },
    macroValue: {
      color: tokens.subtext,
      fontSize: 11,
    },
    macroBarTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: tokens.border,
      overflow: "hidden",
    },
    macroBarFill: {
      height: "100%",
      borderRadius: 999,
    },
    aiBanner: {
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: tokens.accentSoft,
    },
    aiIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: tokens.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    aiBannerText: {
      flex: 1,
    },
    aiBannerTitle: {
      color: tokens.text,
      fontWeight: "700",
      fontSize: 14,
    },
    aiBannerSubtitle: {
      color: tokens.subtext,
      fontSize: 12,
      marginTop: 4,
    },
    queueFab: {
      position: "absolute",
      right: 20,
      bottom: 96,
      backgroundColor: tokens.accent,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
    },
    queueText: {
      color: tokens.background,
      fontWeight: "700",
      fontSize: 12,
    },
    queueBadge: {
      position: "absolute",
      top: -6,
      right: -6,
      backgroundColor: tokens.background,
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    queueBadgeText: {
      color: tokens.text,
      fontSize: 10,
      fontWeight: "700",
    },
    bottomNav: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 24,
      backgroundColor: tokens.nav,
      borderRadius: 24,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-around",
      borderWidth: 1,
      borderColor: tokens.border,
    },
    navItem: {
      alignItems: "center",
      gap: 4,
    },
    navLabel: {
      color: tokens.subtext,
      fontSize: 10,
    },
    navLabelActive: {
      color: tokens.accent,
    },
  });
