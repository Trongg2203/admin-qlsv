import { GOALSTATUS, STATUS, STATUS_COMPLETED } from "@/constants/constants";
import settingTargetService from "@/services/settingTargetService";
import { useErrorStore } from "@/store/errorStore";
import { useLoadingStore } from "@/store/loadingStore";
import { useSettingTargetStore } from "@/store/settingTargetStore";
import { CreateSettingTarget } from "@/typings/interfaces/settingTarget/settingTarget";
import { DateFormat } from "@/typings/types/DateType";
import { MasterComponentItem } from "@/typings/types/form.types";
import { GOALTYPE } from "@/typings/types/GoalType";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import { addDays, getCurrentDate } from "@/utils/dateHelpers";
import { scale } from "@/utils/responsive";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Toast } from "toastify-react-native";
import ButtonComponent from "../components/ButtonComponent";
import FromComponent from "../components/form/FormComponent";
import ErrorDialog from "../components/UI/ErrorDialog";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function SettingTarget() {
  const loadingStore = useLoadingStore();
  const settingTargetStore = useSettingTargetStore();

  const { hasError, clearError } = useErrorStore();
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const [isAdd, setIsAdd] = useState(true);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState<CreateSettingTarget[]>([]);

  const initialValue: CreateSettingTarget = {
    user_id: "",
    goal_type: GOALTYPE.GAIN_WEIGHT,
    target_date: addDays(getCurrentDate(), 1),
    status: GOALSTATUS.ACTIVE,
    is_completed: STATUS_COMPLETED.INCOMPLETE,
    is_active: STATUS.ACTIVE,
    start_weight: 70,
    target_weight: 65,
    start_date: getCurrentDate(),
    weekly_change_rate: 0.5,
  };

  const [formData, setFormData] = useState<CreateSettingTarget>(initialValue);

  const goalTypeLabel: Record<number, string> = {
    [GOALTYPE.LOSE_WEIGHT]: "Giảm cân",
    [GOALTYPE.GAIN_WEIGHT]: "Tăng cân",
    [GOALTYPE.MAINTAIN_WEIGHT]: "Duy trì",
  };

  const goalStatusLabel: Record<number, string> = {
    [GOALSTATUS.ACTIVE]: "Đang hoạt động",
    [GOALSTATUS.PAUSED]: "Tạm dừng",
    [GOALSTATUS.COMPLETED]: "Đã đạt",
    [GOALSTATUS.ANBANDONED]: "Bị hủy",
  };

  const formFields: MasterComponentItem[] = [
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "goal_type",
      info: {
        label: "Loại mục tiêu",
        required: true,
        direction: "row",
        returnType: "single",
        options: [
          { label: "Giảm cân", value: GOALTYPE.LOSE_WEIGHT },
          { label: "Tăng cân", value: GOALTYPE.GAIN_WEIGHT },
          { label: "Duy trì", value: GOALTYPE.MAINTAIN_WEIGHT },
        ],
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "start_weight",
      info: {
        label: "Cân nặng ban đầu",
        required: true,
        decimalPlaces: 2,
        prefix: "kg",
        min: 1,
        max: 300,
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "target_weight",
      info: {
        label: "Cân nặng mục tiêu",
        required: true,
        decimalPlaces: 2,
        prefix: "kg",
        min: 1,
        max: 300,
      },
    },
    {
      type: "DatePickerComponent",
      column: 6,
      model: "start_date",
      info: {
        label: "Ngày bắt đầu",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
      },
    },
    {
      type: "DatePickerComponent",
      column: 6,
      model: "target_date",
      info: {
        label: "Ngày mục tiêu",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
      },
    },
    {
      type: "InputDecimalComponent",
      column: 12,
      model: "weekly_change_rate",
      info: {
        label: "Tốc độ thay đổi mỗi tuần (kg)",
        required: true,
        decimalPlaces: 2,
        min: 0.1,
        max: 1.0,
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "is_active",
      info: {
        label: "Mục tiêu theo dõi",
        options: [{ label: "Đang hoạt động", value: STATUS.ACTIVE }],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "is_completed",
      info: {
        label: "Đã đạt mục tiêu",
        options: [{ label: "Chưa đạt", value: STATUS_COMPLETED.INCOMPLETE }],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "status",
      info: {
        returnType: "single",
        direction: "row",
        label: "Trạng thái mục tiêu",
        options: [
          { label: "Chưa đạt", value: GOALSTATUS.ACTIVE },
          { label: "Tạm dừng", value: GOALSTATUS.PAUSED },
          { label: "Đã đạt", value: GOALSTATUS.COMPLETED },
          { label: "Bị hủy", value: GOALSTATUS.ANBANDONED },
        ],
      },
    },
  ];

  const normalizeGoal = (goal: CreateSettingTarget) => {
    return {
      ...initialValue,
      ...goal,
    };
  };

  const handleDeleteGoal = (goal: CreateSettingTarget) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa mục tiêu ${goal.start_weight}kg → ${goal.target_weight}kg?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            loadingStore.setLoading(true);
            try {
              const success = await settingTargetService.delete("/api/goals/", [
                goal.id as string,
              ]);
              if (success) {
                Toast.success(
                  "Xóa mục tiêu thành công",
                  POSITION_TOAST.TOP,
                  "checkmark-circle-outline",
                );
                await fetchGoals();
              }
            } catch (error) {
              console.log(error);
              Toast.error(
                "Xóa mục tiêu thất bại",
                POSITION_TOAST.TOP,
                "close-circle-outline",
              );
            } finally {
              loadingStore.setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleSubmit = async (values: CreateSettingTarget) => {
    loadingStore.setLoading(true);

    const payload = {
      goal_type: values.goal_type,
      start_weight: values.start_weight,
      target_weight: values.target_weight,
      weekly_change_rate: values.weekly_change_rate,
      start_date: values.start_date,
      target_date: values.target_date,
    };

    try {
      let response;

      if (isAdd) {
        response = await settingTargetService.post("/api/goals/", payload);
      } else {
        response = await settingTargetService.update(
          `/api/goals/${goalId}`,
          payload,
        );
      }

      if (response) {
        Toast.success(
          isAdd ? "Thêm mới thành công" : "Cập nhật thành công",
          POSITION_TOAST.TOP,
          "checkmark-circle-outline",
        );

        setTimeout(() => {
          handleCalorie();
          setShowForm(false);
          setGoalId(null);
          setIsAdd(true);
          fetchGoals();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
    }

    loadingStore.setLoading(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleCalorie = async () => {
    try {
      const res = await settingTargetService.create(
        "/api/calorie/calculate",
        [],
      );

      console.log("calori", res);
    } catch (error) {
      console.log("calorie error:", error);
    }
  };

  const handleAdd = () => {
    setIsAdd(true);
    setGoalId(null);
    setFormData(initialValue);
    setShowForm(true);
  };

  const handleEdit = (goal: CreateSettingTarget) => {
    setIsAdd(false);
    setGoalId(goal.id ?? null);
    setFormData(normalizeGoal(goal));
    setShowForm(true);
  };

  const fetchGoals = useCallback(async () => {
    loadingStore.setLoading(true);

    const response = await settingTargetStore.getBySelf("/api/goals/active");
    loadingStore.setLoading(false);

    let list: CreateSettingTarget[] = [];

    if (response) {
      list = [response as CreateSettingTarget];
    } else {
      list = [];
    }

    setGoals(list);
  }, [loadingStore, settingTargetStore]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCloseError = () => {
    clearError();
    setShowErrorDialog(false);
  };

  useEffect(() => {
    if (hasError) setShowErrorDialog(true);
  }, [hasError]);

  // Tính phần trăm hoàn thành mục tiêu
  const calculateProgress = (goal: CreateSettingTarget) => {
    if (goal.goal_type === GOALTYPE.MAINTAIN_WEIGHT) return 0;
    const totalChange = Math.abs(goal.start_weight - goal.target_weight);
    const currentChange = Math.abs(
      goal.start_weight - (goal.current_weight || goal.start_weight),
    );
    return Math.min((currentChange / totalChange) * 100, 100);
  };

  return (
    <View style={styles.container}>
      {showForm ? (
        <>
          <LinearGradient
            colors={["#EF4444", "#DC2626"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.formHeader}
          >
            <TouchableOpacity
              onPress={() => setShowForm(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.formHeaderText}>
              {isAdd ? "Tạo mục tiêu mới" : "Cập nhật mục tiêu"}
            </Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView
            style={styles.formScrollView}
            showsVerticalScrollIndicator={false}
          >
            <FromComponent
              fields={formFields}
              initialValues={formData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </ScrollView>
        </>
      ) : (
        <>
          {/* Header Gradient */}
          <LinearGradient
            colors={["#EF4444", "#DC2626", "#B91C1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="fitness" size={32} color="#FFF" />
              </View>
              <Text style={styles.headerTitle}>Mục tiêu của tôi</Text>
              <Text style={styles.headerSubtitle}>
                {goals.length > 0
                  ? `${goals.length} mục tiêu đang theo dõi`
                  : "Hãy tạo mục tiêu đầu tiên"}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {goals.length > 0 ? (
              goals.map((goal, index) => {
                const progress = calculateProgress(goal);
                return (
                  <View
                    key={goal.id ?? `goal-${index}`}
                    style={styles.goalCardWrapper}
                  >
                    <TouchableOpacity
                      style={styles.goalCard}
                      onPress={() => handleEdit(goal)}
                      activeOpacity={0.9}
                    >
                      {/* Card Header với màu sắc theo loại mục tiêu */}
                      <LinearGradient
                        colors={
                          goal.goal_type === GOALTYPE.LOSE_WEIGHT
                            ? ["#EF4444", "#F87171"]
                            : goal.goal_type === GOALTYPE.GAIN_WEIGHT
                              ? ["#10B981", "#34D399"]
                              : ["#3B82F6", "#60A5FA"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardGradientHeader}
                      >
                        <View style={styles.cardHeaderLeft}>
                          <View style={styles.cardIconContainer}>
                            {goal.goal_type === GOALTYPE.LOSE_WEIGHT && (
                              <Ionicons
                                name="trending-down"
                                size={24}
                                color="#FFF"
                              />
                            )}
                            {goal.goal_type === GOALTYPE.GAIN_WEIGHT && (
                              <Ionicons
                                name="trending-up"
                                size={24}
                                color="#FFF"
                              />
                            )}
                            {goal.goal_type === GOALTYPE.MAINTAIN_WEIGHT && (
                              <Ionicons name="fitness" size={24} color="#FFF" />
                            )}
                          </View>
                          <Text style={styles.cardGoalType}>
                            {goalTypeLabel[goal.goal_type]}
                          </Text>
                        </View>
                        {goal.status === GOALSTATUS.ACTIVE && (
                          <View style={styles.activeBadge}>
                            <Ionicons name="flash" size={12} color="#D97706" />
                            <Text style={styles.activeBadgeText}>
                              Đang thực hiện
                            </Text>
                          </View>
                        )}
                      </LinearGradient>

                      {/* Weight Display */}
                      <View style={styles.weightContainer}>
                        <View style={styles.weightBox}>
                          <Text style={styles.weightLabel}>Hiện tại</Text>
                          <Text style={styles.weightValue}>
                            {goal.start_weight}
                            <Text style={styles.weightUnit}>kg</Text>
                          </Text>
                        </View>

                        <View style={styles.weightArrowContainer}>
                          <LinearGradient
                            colors={["#EF4444", "#FBBF24"]}
                            style={styles.weightArrowCircle}
                          >
                            <Ionicons
                              name="arrow-forward"
                              size={16}
                              color="#FFF"
                            />
                          </LinearGradient>
                        </View>

                        <View style={styles.weightBox}>
                          <Text style={styles.weightLabel}>Mục tiêu</Text>
                          <Text style={styles.weightValue}>
                            {goal.target_weight}
                            <Text style={styles.weightUnit}>kg</Text>
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      {goal.goal_type !== GOALTYPE.MAINTAIN_WEIGHT && (
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Tiến độ</Text>
                            <Text style={styles.progressPercent}>
                              {progress.toFixed(0)}%
                            </Text>
                          </View>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${progress}%`,
                                  backgroundColor:
                                    goal.goal_type === GOALTYPE.LOSE_WEIGHT
                                      ? "#EF4444"
                                      : "#10B981",
                                },
                              ]}
                            />
                          </View>
                        </View>
                      )}

                      {/* Meta Info */}
                      <View style={styles.metaSection}>
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar" size={14} color="#94A3B8" />
                          <Text style={styles.metaText}>
                            {goal.start_date} → {goal.target_date}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="speedometer"
                            size={14}
                            color="#94A3B8"
                          />
                          <Text style={styles.metaText}>
                            {goal.weekly_change_rate} kg/tuần
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteGoal(goal)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                      <Text style={styles.deleteButtonText}>Xóa mục tiêu</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={["#F3F4F6", "#E5E7EB"]}
                  style={styles.emptyIconWrapper}
                >
                  <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Chưa có mục tiêu</Text>
                <Text style={styles.emptyDescription}>
                  Hãy tạo mục tiêu đầu tiên để bắt đầu hành trình của bạn
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Floating Action Button when has goals */}
          {goals.length === 0 && (
            <TouchableOpacity
              style={styles.fab}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </>
      )}

      <ErrorDialog
        visible={showErrorDialog}
        onClose={handleCloseError}
        buttonText="Đóng"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  gradientHeader: {
    paddingTop: scale(48),
    paddingBottom: scale(32),
    paddingHorizontal: scale(20),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconWrapper: {
    width: scale(64),
    height: scale(64),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: scale(32),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(12),
  },
  headerTitle: {
    fontSize: scale(24),
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: scale(4),
  },
  headerSubtitle: {
    fontSize: scale(14),
    color: "rgba(255,255,255,0.9)",
  },
  listContainer: {
    flex: 1,
    marginTop: scale(-16),
  },
  listContent: {
    paddingBottom: scale(100),
    paddingHorizontal: scale(16),
  },
  goalCardWrapper: {
    marginBottom: scale(16),
    borderRadius: scale(16),
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  goalCard: {
    overflow: "hidden",
    borderRadius: scale(16),
  },
  cardGradientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  cardIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardGoalType: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#FFF",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    gap: scale(4),
  },
  activeBadgeText: {
    color: "#D97706",
    fontSize: scale(11),
    fontWeight: "600",
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
  },
  weightBox: {
    alignItems: "center",
    flex: 1,
  },
  weightLabel: {
    fontSize: scale(12),
    color: "#94A3B8",
    marginBottom: scale(8),
    textTransform: "uppercase",
    fontWeight: "600",
  },
  weightValue: {
    fontSize: scale(28),
    fontWeight: "bold",
    color: "#1E293B",
  },
  weightUnit: {
    fontSize: scale(14),
    fontWeight: "normal",
    color: "#94A3B8",
  },
  weightArrowContainer: {
    paddingHorizontal: scale(12),
  },
  weightArrowCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  progressSection: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },
  progressLabel: {
    fontSize: scale(12),
    color: "#64748B",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: scale(14),
    fontWeight: "bold",
    color: "#EF4444",
  },
  progressBarBg: {
    height: scale(8),
    backgroundColor: "#F1F5F9",
    borderRadius: scale(4),
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: scale(4),
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
    gap: scale(12),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#F8FAFC",
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(8),
    flex: 1,
  },
  metaText: {
    fontSize: scale(11),
    color: "#64748B",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(12),
    backgroundColor: "#FEF2F2",
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
    gap: scale(8),
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: scale(13),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: scale(60),
    paddingHorizontal: scale(32),
  },
  emptyIconWrapper: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(20),
  },
  emptyTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: scale(8),
  },
  emptyDescription: {
    fontSize: scale(14),
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: scale(20),
  },
  addButtonWrapper: {
    marginTop: scale(20),
    marginBottom: scale(20),
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(24),
    borderRadius: scale(12),
    gap: scale(8),
  },
  addButtonText: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#FFF",
  },
  fab: {
    position: "absolute",
    bottom: scale(24),
    right: scale(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabGradient: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: "center",
    alignItems: "center",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: scale(48),
    paddingBottom: scale(20),
    paddingHorizontal: scale(16),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  formHeaderText: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#FFF",
  },
  formScrollView: {
    flex: 1,
  },
});
